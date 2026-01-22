import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
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
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      user: {
        balance: user.balance,
        email: user.email,
      },
      payments: payments.map((payment) => ({
        id: payment.id,
        yooPaymentId: payment.yooPaymentId,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
      })),
      totalPayments: payments.length,
    });
  } catch (error) {
    console.error('My payments error:', error);
    return NextResponse.json({ error: 'Ошибка получения платежей' }, { status: 500 });
  }
}
