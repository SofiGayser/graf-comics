export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  const shopId = process.env.YOO_KASSA_SHOP_ID;
  const secretKey = process.env.YOO_KASSA_SECRET_KEY;

  console.log('=== FINAL CREDENTIALS CHECK ===');
  console.log('Shop ID:', shopId);
  console.log('Secret Key exists:', !!secretKey);
  console.log('Secret Key length:', secretKey?.length);
  console.log('==============================');

  // Проверяем точное соответствие
  const isShopIdCorrect = shopId === '1181255';
  const isSecretKeyCorrect = secretKey === 'test_yLHLpxAbCjGKYCeZW_-pq4GO-z9roRpgNTlM8JkcdOw';

  return NextResponse.json({
    credentials: {
      shopId: shopId,
      isShopIdCorrect: isShopIdCorrect,
      secretKeyExists: !!secretKey,
      secretKeyLength: secretKey?.length,
      isSecretKeyCorrect: isSecretKeyCorrect,
      returnUrl: process.env.YOO_KASSA_RETURN_URL,
    },
    expected: {
      shopId: '1181255',
      secretKeyStartsWith: 'test_yLHLpxAbCjGKYCeZW_-pq4GO-z9roRpgNTlM8JkcdOw',
    },
    status: isShopIdCorrect && isSecretKeyCorrect ? 'READY' : 'INVALID_CREDENTIALS',
  });
}
