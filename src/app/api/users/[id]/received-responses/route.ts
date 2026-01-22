// src/app/api/users/[id]/received-responses/route.ts
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

    // Находим все заявки пользователя и отклики на них
    const requestsWithResponses = await prisma.collaborationRequest.findMany({
      where: { authorId: params.id },
      include: {
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requestsWithResponses);
  } catch (error) {
    console.error('Error fetching received responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
