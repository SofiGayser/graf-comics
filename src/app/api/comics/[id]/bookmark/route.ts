// app/api/comics/[id]/bookmark/route.ts
import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const comicsId = params.id;
    const { status } = await request.json();

    const comics = await prisma.comics.findUnique({
      where: { id: comicsId },
    });

    if (!comics) {
      return NextResponse.json({ error: 'Comics not found' }, { status: 404 });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_comicsId: {
          userId: user.id,
          comicsId: comicsId,
        },
      },
    });

    if (existingBookmark) {
      const updatedBookmark = await prisma.bookmark.update({
        where: {
          id: existingBookmark.id,
        },
        data: {
          status: status || 'PLANNED',
        },
        include: {
          comics: {
            select: {
              id: true,
              title: true,
              covers: true,
              description: true,
              genres: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json(updatedBookmark);
    } else {
      const newBookmark = await prisma.bookmark.create({
        data: {
          userId: user.id,
          comicsId: comicsId,
          status: status || 'PLANNED',
        },
        include: {
          comics: {
            select: {
              id: true,
              title: true,
              covers: true,
              description: true,
              genres: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json(newBookmark);
    }
  } catch (error) {
    console.error('Error managing bookmark:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'This comics is already bookmarked' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const comicsId = params.id;

    await prisma.bookmark.delete({
      where: {
        userId_comicsId: {
          userId: user.id,
          comicsId: comicsId,
        },
      },
    });

    return NextResponse.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
