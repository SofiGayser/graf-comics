import prisma from '@/services/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id || params.id === 'undefined') {
      return NextResponse.json({ error: 'Comics ID is required' }, { status: 400 });
    }

    const count = await prisma.comment.count({
      where: {
        comicsId: params.id,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching comments count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
