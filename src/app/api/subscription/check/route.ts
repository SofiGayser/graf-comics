import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ hasSubscription: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        hasSubscription: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ hasSubscription: false }, { status: 404 });
    }

    // Проверяем, активна ли подписка
    const now = new Date();
    const isSubscriptionActive = user.hasSubscription && user.subscriptionEnd && user.subscriptionEnd > now;

    return NextResponse.json({
      hasSubscription: isSubscriptionActive,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ hasSubscription: false }, { status: 500 });
  }
}
