import { prisma } from '@/app/lib/prisma/shop-client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Необходимо авторизоваться' }, { status: 401 });
    }

    const { shippingAddress, paymentMethod, customerNote } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        balance: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const cartId = request.cookies.get('cartId')?.value;

    if (!cartId) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    if (user.balance < totalAmount) {
      return NextResponse.json(
        {
          error: 'Недостаточно средств',
          required: totalAmount,
          balance: user.balance,
        },
        { status: 400 },
      );
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        totalAmount,
        discountAmount: 0,
        shippingAmount: 0,
        finalAmount: totalAmount,
        paymentMethod: paymentMethod || 'BALANCE',
        paymentStatus: 'SUCCEEDED',
        shippingMethod: 'CDEK',
        shippingAddress: shippingAddress || null,
        customerNote: customerNote || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.title,
            variantName: item.variant?.value || null,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
        history: {
          create: [
            {
              status: 'CONFIRMED',
              note: 'Заказ создан и оплачен',
              createdBy: user.id,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: totalAmount,
        },
      },
    });

    await prisma.transactionHistory.create({
      data: {
        userId: user.id,
        type: 'PURCHASE',
        amount: totalAmount,
        description: `Оплата заказа #${orderNumber}`,
        status: 'COMPLETED',
      },
    });

    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
          salesCount: {
            increment: item.quantity,
          },
        },
      });

      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    await prisma.cartItem.deleteMany({
      where: { cartId },
    });

    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount,
      message: 'Заказ успешно оформлен',
    });

    response.cookies.delete('cartId');

    return response;
  } catch (error: any) {
    console.error('Error creating order:', error);

    return NextResponse.json(
      {
        error: 'Ошибка при оформлении заказа',
        details: error.message,
        code: error.code,
      },
      { status: 500 },
    );
  }
}
