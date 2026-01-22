import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Скрываем часть секретного ключа для безопасности
  const secretKey = process.env.YOO_KASSA_SECRET_KEY;
  const maskedKey = secretKey
    ? secretKey.substring(0, 10) + '...' + secretKey.substring(secretKey.length - 10)
    : 'NOT_SET';

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    credentials: {
      shopId: process.env.YOO_KASSA_SHOP_ID || 'NOT_SET',
      secretKey: maskedKey,
      secretKeyLength: secretKey?.length || 0,
      returnUrl: process.env.YOO_KASSA_RETURN_URL || 'NOT_SET',
    },
    expectedFormat: {
      shopId: 'Должен быть числом (например: 123456)',
      secretKey: 'Должен начинаться с test_... для тестового режима',
    },
  });
}
