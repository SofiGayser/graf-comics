import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { YooKassaService } from '@/services/yookassa';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  console.log('=== PAYMENT CREATE API CALLED ===');

  const session = await getServerSession(options);

  if (!session?.user?.email) {
    console.log('No session found');
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { amount } = await request.json();
    console.log('Payment amount:', amount);

    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Минимальная сумма пополнения 10 рублей' }, { status: 400 });
    }

    if (!process.env.YOO_KASSA_SHOP_ID || !process.env.YOO_KASSA_SECRET_KEY) {
      console.error('YooKassa credentials missing');
      return NextResponse.json({ error: 'Платежная система не настроена' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found:', session.user.email);
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    console.log('Found user:', user.id);

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        paymentMethod: 'SBP',
        description: 'Пополнение баланса',
        metadata: {
          type: 'balance_topup',
        },
      },
    });

    console.log('Created payment record:', payment.id);

    const yooPayment = await YooKassaService.createPayment({
      amount: amount,
      description: 'Пополнение баланса',
      metadata: {
        userId: user.id,
        type: 'balance_topup',
        paymentId: payment.id,
      },
    });

    console.log('YooKassa payment created:', yooPayment.id);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        yooPaymentId: yooPayment.id,
      },
    });

    console.log('Payment record updated with YooKassa ID');

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: yooPayment.confirmation.confirmation_url,
      yooPaymentId: yooPayment.id,
    });
  } catch (error) {
    console.error('Payment creation error:', error);

    let errorMessage = 'Ошибка при создании платежа';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
