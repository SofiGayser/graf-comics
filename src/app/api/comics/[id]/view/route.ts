import prisma from '@/services/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('📈 Incrementing views for comics:', params.id);

    if (!params.id || params.id === 'undefined') {
      return NextResponse.json({ error: 'Comics ID is required' }, { status: 400 });
    }

    const comics = await prisma.comics.findUnique({
      where: { id: params.id },
    });

    if (!comics) {
      return NextResponse.json({ error: 'Comics not found' }, { status: 404 });
    }

    const updatedComics = await prisma.comics.update({
      where: { id: params.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    console.log('✅ Views incremented to:', updatedComics.views);

    return NextResponse.json({
      success: true,
      views: updatedComics.views,
    });
  } catch (error) {
    console.error('❌ Error incrementing view count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
