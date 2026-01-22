import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    console.log('📋 Plan ID:', planId);

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

    // Проверяем, есть ли уже активная подписка
    if (user.hasActiveSubscription) {
      return NextResponse.json({ error: 'У вас уже есть активная подписка' }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'План подписки не найден' }, { status: 404 });
    }

    console.log('📊 Plan found:', plan.name, 'Price:', plan.price);

    // Проверка баланса
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

    // Расчет дат подписки
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    console.log('📅 Subscription dates:', { startDate, endDate });

    // Создаем подписку
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

    // Списание средств с баланса
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

    // Создаем запись о платеже за подписку
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

    // Детальная информация об ошибке
    let errorMessage = 'Ошибка при оформлении подписки';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error details:', error.stack);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 },
    );
  }
}
