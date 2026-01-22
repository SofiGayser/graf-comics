import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Не указан paymentId' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    const payment = payments[0];

    if (payment && payment.status === 'SUCCEEDED') {
      const existingHistory = await prisma.transactionHistory.findFirst({
        where: {
          userId: user.id,
          paymentId: payment.id,
          type: 'DEPOSIT',
        },
      });

      if (!existingHistory) {
        await prisma.transactionHistory.create({
          data: {
            userId: user.id,
            type: 'DEPOSIT',
            amount: payment.amount,
            currency: payment.currency || 'RUB',
            status: 'COMPLETED',
            description: payment.description || `Пополнение баланса на ${payment.amount} ₽`,
            paymentId: payment.id,
            metadata: {
              yooPaymentId: payment.yooPaymentId,
              paymentMethod: payment.paymentMethod,
              originalDescription: payment.description,
              checkDate: new Date().toISOString(),
            },
          },
        });

        console.log(`Запись истории создана для платежа ${payment.id}`);
      }
    }

    const formattedPayment = payment
      ? {
          id: payment.id,
          yooPaymentId: payment.yooPaymentId,
          amount: payment.amount,
          status: payment.status,
          description: payment.description,
          createdAt: payment.createdAt,
          formattedDate: new Date(payment.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
        }
      : null;

    return NextResponse.json({
      user: {
        balance: user.balance,
        email: user.email,
      },
      payment: formattedPayment,
      hasPayments: payments.length > 0,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка проверки статуса платежа',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Не указан paymentId' }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        OR: [{ id: paymentId }, { yooPaymentId: paymentId }],
        status: 'SUCCEEDED',
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: 'Платеж не найден или не успешен',
          success: false,
        },
        { status: 404 },
      );
    }

    const existingHistory = await prisma.transactionHistory.findFirst({
      where: {
        userId: session.user.id,
        paymentId: payment.id,
      },
    });

    if (existingHistory) {
      return NextResponse.json({
        success: true,
        message: 'Запись уже существует в истории',
        historyId: existingHistory.id,
      });
    }

    const transactionHistory = await prisma.transactionHistory.create({
      data: {
        userId: session.user.id,
        type: 'DEPOSIT',
        amount: payment.amount,
        currency: payment.currency || 'RUB',
        status: 'COMPLETED',
        description: payment.description || `Пополнение баланса на ${payment.amount} ₽`,
        paymentId: payment.id,
        metadata: {
          yooPaymentId: payment.yooPaymentId,
          paymentMethod: payment.paymentMethod,
          originalDescription: payment.description,
          syncDate: new Date().toISOString(),
          syncedManually: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Баланс синхронизирован с историей',
      historyId: transactionHistory.id,
      transaction: {
        id: transactionHistory.id,
        type: transactionHistory.type,
        amount: transactionHistory.amount,
        date: transactionHistory.createdAt,
        formattedDate: new Date(transactionHistory.createdAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка синхронизации баланса',
        success: false,
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
