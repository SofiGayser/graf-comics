import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const { status } = await req.json();

    const existingResponse = await prisma.collaborationResponse.findUnique({
      where: { id: params.id },
      include: { request: true },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: 'Отклик не найден' }, { status: 404 });
    }

    if (existingResponse.request.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const updatedResponse = await prisma.collaborationResponse.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Ошибка при обновлении отклика:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
};
