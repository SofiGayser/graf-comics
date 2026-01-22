// app/api/comics/[id]/like/route.ts
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id || params.id === 'undefined') {
      return NextResponse.json({ error: 'Comics ID is required' }, { status: 400 });
    }

    const session = await getServerSession(options);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comics = await prisma.comics.findUnique({
      where: { id: params.id },
    });

    if (!comics) {
      return NextResponse.json({ error: 'Comics not found' }, { status: 404 });
    }

    const hasLiked = comics.likes.includes(user.id);

    const updatedComics = await prisma.comics.update({
      where: { id: params.id },
      data: {
        likes: hasLiked
          ? { set: comics.likes.filter((id) => id !== user.id) } // Удаляем лайк
          : { push: user.id }, // Добавляем лайк
      },
    });

    return NextResponse.json({
      liked: !hasLiked,
      likesCount: updatedComics.likes.length,
    });
  } catch (error) {
    console.error('Error in like endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
