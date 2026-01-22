import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, price, durationMonths } = await request.json();

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем баланс (заглушка - нужно реализовать логику списания)
    const userBalance = 9999; // Здесь должна быть реальная логика проверки баланса
    if (userBalance < price) {
      return NextResponse.json(
        {
          error: 'Insufficient funds',
          required: price,
          current: userBalance,
        },
        { status: 400 },
      );
    }

    // Рассчитываем даты подписки
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Активируем подписку
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        hasSubscription: true,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });

    // Здесь должна быть логика списания средств
    // await processPayment(user.id, price);

    return NextResponse.json({
      success: true,
      subscriptionEnd: endDate,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
