import { prisma } from '@/app/lib/prisma/shop-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tags = await prisma.productTag.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
