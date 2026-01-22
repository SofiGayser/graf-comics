import { prisma } from '@/app/lib/prisma/shop-client';
import { ShopFilters } from '@/app/types/shop.types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: ShopFilters = {
      category: searchParams.get('category') || undefined,
      tags: searchParams.getAll('tag'),
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      isNew: searchParams.get('isNew') === 'true',
      isFeatured: searchParams.get('isFeatured') === 'true',
      inStock: searchParams.get('inStock') === 'true',
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'popularity',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    };

    const where: any = {
      isActive: true,
    };

    if (filters.category) {
      where.category = {
        slug: filters.category,
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          slug: {
            in: filters.tags,
          },
        },
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.inStock) {
      where.quantity = {
        gt: 0,
      };
    }

    if (filters.isNew) {
      where.isNew = true;
    }

    if (filters.isFeatured) {
      where.isFeatured = true;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (filters.sortBy) {
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'popularity':
      default:
        orderBy.viewsCount = 'desc';
        break;
    }

    const skip = (filters.page! - 1) * filters.limit!;

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        tags: true,
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
      orderBy,
      skip,
      take: filters.limit,
    });

    const total = await prisma.product.count({ where });

    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const tags = await prisma.productTag.findMany({
      orderBy: { name: 'asc' },
    });

    const priceRange = await prisma.product.aggregate({
      where: { isActive: true },
      _min: { price: true },
      _max: { price: true },
    });

    await prisma.product.updateMany({
      where: { id: { in: products.map((p) => p.id) } },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        reviewsCount: product._count.reviews,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit!),
      filters: {
        categories,
        tags,
        minPrice: priceRange._min.price || 0,
        maxPrice: priceRange._max.price || 10000,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
