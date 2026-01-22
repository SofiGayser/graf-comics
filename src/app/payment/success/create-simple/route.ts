import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('=== SIMPLE PAYMENT CREATE ===');

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

    // Проверяем credentials
    const shopId = process.env.YOO_KASSA_SHOP_ID;
    const secretKey = process.env.YOO_KASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return NextResponse.json(
        {
          error: 'Платежная система не настроена',
          debug: {
            shopId: !!shopId,
            secretKey: !!secretKey,
          },
        },
        { status: 500 },
      );
    }

    console.log('Using Shop ID:', shopId);
    console.log('Secret Key length:', secretKey.length);

    // Создаем запись о платеже в базе
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        paymentMethod: 'SBP',
        description: 'Пополнение баланса',
        metadata: {
          type: 'balance_topup',
        },
        status: 'PENDING', // Явно устанавливаем начальный статус
      },
    });

    // Создаем платеж в ЮKassa
    const paymentPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      payment_method_data: {
        type: 'sbp',
      },
      confirmation: {
        type: 'redirect',
        return_url: process.env.YOO_KASSA_RETURN_URL || 'https://graf-comics-632s.vercel.app/payment/success',
      },
      capture: true,
      description: 'Пополнение баланса',
      metadata: {
        userId: user.id,
        type: 'balance_topup',
        paymentId: payment.id,
      },
    };

    console.log('Sending to YooKassa:', JSON.stringify(paymentPayload, null, 2));

    const idempotenceKey = crypto.randomUUID(); // Используем встроенный метод для генерации UUID

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64'),
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log('YooKassa response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YooKassa error:', errorText);

      let errorMessage = 'Ошибка создания платежа';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.description || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${errorText}`;
      }

      // Обновляем статус платежа на FAILED с правильным типом
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED' as any, // Используем as any для обхода проверки типов
          // ИЛИ лучше определить правильный enum в вашей Prisma схеме
        },
      });

      throw new Error(errorMessage);
    }

    const yooPayment = await response.json();
    console.log('✅ Payment created:', yooPayment.id);

    // Обновляем запись с ID платежа ЮKassa
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        yooPaymentId: yooPayment.id,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: yooPayment.confirmation.confirmation_url,
      yooPaymentId: yooPayment.id,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Ошибка при создании платежа',
      },
      { status: 500 },
    );
  }
}
