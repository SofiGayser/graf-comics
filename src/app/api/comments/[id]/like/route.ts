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

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const hasLiked = comment.likedBy.includes(user.id);

    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        likedBy: hasLiked ? { set: comment.likedBy.filter((id) => id !== user.id) } : { push: user.id },
        likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
      },
    });

    return NextResponse.json({
      liked: !hasLiked,
      likesCount: updatedComment.likes,
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
