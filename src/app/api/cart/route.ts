import { prisma } from '@/app/lib/prisma/shop-client';
import { ObjectId } from 'bson';
import { NextRequest, NextResponse } from 'next/server';

function generateObjectId() {
  return new ObjectId().toString();
}

export async function GET(request: NextRequest) {
  try {
    const cartId = request.cookies.get('cartId')?.value;

    if (!cartId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    try {
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
        const response = NextResponse.json({ items: [], total: 0 });
        response.cookies.delete('cartId');
        return response;
      }

      const total = cart.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      return NextResponse.json({
        items: cart.items,
        total,
      });
    } catch (error) {
      const response = NextResponse.json({ items: [], total: 0 });
      response.cookies.delete('cartId');
      return response;
    }
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ items: [], total: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, variantId = null, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        price: true,
        quantity: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let cartId = request.cookies.get('cartId')?.value;
    let cart;

    if (!cartId) {
      cart = await prisma.cart.create({
        data: {
          userId: generateObjectId(),
        },
      });
      cartId = cart.id;
    } else {
      cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: generateObjectId(),
          },
        });
        cartId = cart.id;
      }
    }

    let price = product.price;
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { price: true },
      });
      if (variant?.price !== undefined && variant.price !== null) {
        price = variant.price;
      }
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
          price: price,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
          variant: true,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          variantId: variantId || null,
          quantity,
          price,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
          variant: true,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const total =
      updatedCart?.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0) || 0;

    const response = NextResponse.json({
      success: true,
      message: 'Товар добавлен в корзину',
      item: cartItem,
      total,
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

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        variant: true,
      },
    });

    return NextResponse.json({
      success: true,
      item: cartItem,
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE_ALL(request: NextRequest) {
  try {
    const cartId = request.cookies.get('cartId')?.value;

    if (!cartId) {
      return NextResponse.json({ success: true });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete('cartId');
    return response;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
