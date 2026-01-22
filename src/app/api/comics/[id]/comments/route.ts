import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id || params.id === 'undefined') {
      return NextResponse.json({ error: 'Comics ID is required' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        comicsId: params.id,
        replyId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error in comments GET endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Создать комментарий
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

    const { text, replyId } = await request.json();

    const comment = await prisma.comment.create({
      data: {
        text,
        userId: user.id,
        comicsId: params.id,
        replyId: replyId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error in comments POST endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
