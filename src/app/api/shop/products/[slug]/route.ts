import { prisma } from '@/app/lib/prisma/shop-client';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        specifications: true,
        variants: {
          where: {
            quantity: { gt: 0 },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Форматируем теги
    const formattedTags = product.tags.map((tagOnProduct) => tagOnProduct.tag);

    // Увеличиваем счетчик просмотров
    await prisma.product.update({
      where: { id: product.id },
      data: { viewsCount: { increment: 1 } },
    });

    // Форматируем ответ
    const response = {
      ...product,
      tags: formattedTags,
      reviewsCount: product._count.reviews,
    };

    // Удаляем приватные поля
    delete (response as any)._count;
    delete (response as any).tags; // удаляем старый формат

    return NextResponse.json({
      ...product,
      tags: formattedTags,
      reviewsCount: product._count.reviews,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
