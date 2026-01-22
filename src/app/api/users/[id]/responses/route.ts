// src/app/api/users/[id]/responses/route.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const GET = async (request: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const responses = await prisma.collaborationResponse.findMany({
      where: { userId: params.id },
      include: {
        request: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
