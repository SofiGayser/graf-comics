import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const planIdMap: { [key: string]: string } = {
  '1': '67a1b2c3d4e5f6a7b8c9d0e1',
  '2': '67a1b2c3d4e5f6a7b8c9d0e2',
  '3': '67a1b2c3d4e5f6a7b8c9d0e3',
  '4': '67a1b2c3d4e5f6a7b8c9d0e4',
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Не указан planId' }, { status: 400 });
    }

    console.log('🔐 User email:', session.user.email);
    console.log('📋 Plan ID received:', planId);

    const realPlanId = planIdMap[planId];
    if (!realPlanId) {
      return NextResponse.json({ error: 'Неверный ID плана' }, { status: 400 });
    }

    console.log('📋 Real Plan ID:', realPlanId);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        balance: true,
        hasActiveSubscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    console.log('👤 User found:', user.id, 'Balance:', user.balance, 'Has subscription:', user.hasActiveSubscription);

    if (user.hasActiveSubscription) {
      return NextResponse.json({ error: 'У вас уже есть активная подписка' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: realPlanId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'План подписки не найден' }, { status: 404 });
    }

    console.log('📊 Plan found:', plan.name, 'Price:', plan.price);

    if (user.balance < plan.price) {
      return NextResponse.json(
        {
          error: 'Недостаточно средств на счете',
          required: plan.price,
          current: user.balance,
        },
        { status: 400 },
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    console.log('📅 Subscription dates:', { startDate, endDate });

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        startDate,
        endDate,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Subscription created:', subscription.id);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: plan.price },
        hasActiveSubscription: true,
        hasSubscription: true,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
      select: {
        balance: true,
        hasActiveSubscription: true,
      },
    });

    console.log('💰 Balance updated:', updatedUser.balance);

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.price,
        paymentMethod: 'BALANCE',
        status: 'SUCCEEDED',
        description: `Оплата подписки: ${plan.name}`,
        metadata: {
          type: 'subscription',
          planId: plan.id,
          subscriptionId: subscription.id,
          duration: plan.duration,
        },
      },
    });

    console.log('💳 Payment recorded:', payment.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: plan.name,
        endDate: subscription.endDate,
        price: plan.price,
        duration: plan.duration,
      },
      newBalance: updatedUser.balance,
    });
  } catch (error) {
    console.error('❌ Subscription error:', error);

    let errorMessage = 'Ошибка при оформлении подписки';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
