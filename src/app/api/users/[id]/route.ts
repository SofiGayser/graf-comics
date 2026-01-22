import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        gender: true,
        birthDate: true,
        residenceName: true,
        avatar: true,
        showMatureContent: true,
        closedProfile: true,
        closedSubscribers: true,
        showNotificationsSubscribes: true,
        showNotificationsComments: true,
        showNotificationsPaidContent: true,
        showNotificationsLikes: true,
        showNotificationsGifts: true,
        showNotificationsNewPosts: true,
        showNotificationsListsReading: true,
        showNotificationsListsRead: true,
        showNotificationsListsPlanned: true,
        showNotificationsListsLiked: true,
        showNotificationsListsDropped: true,
        emailNotificationsUpdates: true,
        emailNotificationsSurveys: true,
        emailNotificationsReports: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
};

export const PUT = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const session = await getServerSession(options);

    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ message: 'Неавторизованный доступ' }, { status: 401 });
    }

    const body = await request.json();
    const { password, currentPassword, ...updateData } = body;

    if (password) {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { password: true },
      });

      if (user?.password && currentPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return NextResponse.json({ message: 'Неверный текущий пароль' }, { status: 400 });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 15);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        gender: true,
        birthDate: true,
        residenceName: true,
        avatar: true,
        showMatureContent: true,
        closedProfile: true,
        closedSubscribers: true,
        showNotificationsSubscribes: true,
        showNotificationsComments: true,
        showNotificationsPaidContent: true,
        showNotificationsLikes: true,
        showNotificationsGifts: true,
        showNotificationsNewPosts: true,
        showNotificationsListsReading: true,
        showNotificationsListsRead: true,
        showNotificationsListsPlanned: true,
        showNotificationsListsLiked: true,
        showNotificationsListsDropped: true,
        emailNotificationsUpdates: true,
        emailNotificationsSurveys: true,
        emailNotificationsReports: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Ошибка обновления пользователя' }, { status: 500 });
  }
};

export const DELETE = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Ошибка удаления пользователя' }, { status: 500 });
  }
};
