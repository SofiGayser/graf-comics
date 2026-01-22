import { YooKassaService } from '@/services/yookassa';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const shopId = process.env.YOO_KASSA_SHOP_ID;
    const secretKey = process.env.YOO_KASSA_SECRET_KEY;

    console.log('Debug - Shop ID:', shopId);
    console.log('Debug - Secret Key length:', secretKey?.length);
    console.log('Debug - Secret Key starts with:', secretKey?.substring(0, 10));

    const testPayment = await YooKassaService.createPayment({
      amount: 1,
      description: 'Тестовый платеж для проверки',
      metadata: {
        userId: 'test-user',
        type: 'balance_topup',
      },
    });

    return NextResponse.json({
      status: 'SUCCESS',
      credentials: {
        shopId: shopId ? '✅ Настроен' : '❌ Отсутствует',
        secretKey: secretKey ? `✅ Настроен (длина: ${secretKey.length})` : '❌ Отсутствует',
        returnUrl: process.env.YOO_KASSA_RETURN_URL || '❌ Отсутствует',
      },
      testPayment: {
        id: testPayment.id,
        status: testPayment.status,
        confirmationUrl: testPayment.confirmation.confirmation_url,
      },
    });
  } catch (error: any) {
    console.error('Debug error:', error);

    return NextResponse.json(
      {
        status: 'ERROR',
        credentials: {
          shopId: process.env.YOO_KASSA_SHOP_ID ? '✅ Настроен' : '❌ Отсутствует',
          secretKey: process.env.YOO_KASSA_SECRET_KEY
            ? `✅ Настроен (длина: ${process.env.YOO_KASSA_SECRET_KEY.length})`
            : '❌ Отсутствует',
          returnUrl: process.env.YOO_KASSA_RETURN_URL || '❌ Отсутствует',
        },
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
