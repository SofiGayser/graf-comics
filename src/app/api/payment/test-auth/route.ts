import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const shopId = process.env.YOO_KASSA_SHOP_ID;
    const secretKey = process.env.YOO_KASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials',
        shopId: !!shopId,
        secretKey: !!secretKey,
      });
    }

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': 'test-key-' + Date.now(),
        Authorization: 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64'),
      },
      body: JSON.stringify({
        amount: {
          value: '1.00',
          currency: 'RUB',
        },
        payment_method_data: {
          type: 'sbp',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'https://graf-comics-632s.vercel.app/payment/success',
        },
        capture: true,
        description: 'Test payment',
      }),
    });

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      credentials: {
        shopId: shopId,
        secretKeyLength: secretKey.length,
        authHeader: 'Basic ' + Buffer.from(shopId + ':' + secretKey.substring(0, 10) + '...').toString('base64'),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        credentials: {
          shopId: process.env.YOO_KASSA_SHOP_ID,
          secretKeyExists: !!process.env.YOO_KASSA_SECRET_KEY,
          secretKeyLength: process.env.YOO_KASSA_SECRET_KEY?.length,
        },
      },
      { status: 500 },
    );
  }
}
