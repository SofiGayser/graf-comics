import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { paymentId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        balance: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id,
        OR: [{ id: paymentId }, { yooPaymentId: paymentId }],
      },
    });

    const payment = payments[0];

    if (!payment) {
      return NextResponse.json({ error: 'Платеж не найден' }, { status: 404 });
    }

    if (payment.status === 'SUCCEEDED') {
      return NextResponse.json({
        message: 'Платеж уже обработан',
        balance: user.balance,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + payment.amount,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCEEDED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Баланс обновлен вручную',
      previousBalance: user.balance,
      newBalance: updatedUser.balance,
      addedAmount: payment.amount,
    });
  } catch (error) {
    console.error('Sync balance error:', error);
    return NextResponse.json({ error: 'Ошибка синхронизации баланса' }, { status: 500 });
  }
}
