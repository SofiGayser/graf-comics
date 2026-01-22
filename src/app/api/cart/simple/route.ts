import { prisma } from '@/app/lib/prisma/shop-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cartId = request.cookies.get('cartId')?.value;

    if (!cartId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
                category: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    return NextResponse.json({
      items: cart.items,
      total,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ items: [], total: 0, error: 'Failed to fetch cart' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, variantId = null, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let cartId = request.cookies.get('cartId')?.value;
    let cart;

    if (!cartId) {
      cart = await prisma.cart.create({
        data: {
          userId: `user-${Date.now()}`,
        },
      });
      cartId = cart.id;
    }

    cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: `user-${Date.now()}`,
        },
      });
      cartId = cart.id;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        price: true,
        title: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId || null,
      },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          variantId: variantId || null,
          quantity,
          price: product.price,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Товар добавлен в корзину',
      item: cartItem,
    });

    if (!request.cookies.get('cartId')) {
      response.cookies.set('cartId', cartId, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error adding to cart:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove item' });
  }
}
