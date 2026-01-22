import prisma from '@/services/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('📊 Fetching stats for comics:', params.id);

    if (!params.id || params.id === 'undefined') {
      return NextResponse.json({ error: 'Comics ID is required' }, { status: 400 });
    }

    const comics = await prisma.comics.findUnique({
      where: { id: params.id },
      select: {
        views: true,
        likes: true,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!comics) {
      return NextResponse.json({ error: 'Comics not found' }, { status: 404 });
    }

    const stats = {
      views: comics.views || 0,
      likes: comics.likes.length,
      bookmarks: comics._count.bookmarks,
    };

    console.log('📊 Stats retrieved:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Error fetching comics stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
