import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Минимальная сумма пополнения 10 рублей' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Создаем запись о платеже в базе
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        paymentMethod: 'SBP',
        description: 'Пополнение баланса (тестовый режим)',
        metadata: {
          type: 'balance_topup',
          test: true,
        },
      },
    });

    // Возвращаем тестовый URL для демонстрации
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=test_' + payment.id,
      yooPaymentId: 'test_payment_' + payment.id,
      debug: {
        message: 'ТЕСТОВЫЙ РЕЖИМ - платеж не создан в ЮKassa',
        instructions: 'Найдите правильный Shop ID в личном кабинете ЮKassa',
        currentShopId: process.env.YOO_KASSA_SHOP_ID,
        amount: amount,
      },
    });
  } catch (error: any) {
    console.error('Mock payment error:', error);
    return NextResponse.json(
      {
        error: 'Тестовая ошибка: ' + error.message,
      },
      { status: 500 },
    );
  }
}
