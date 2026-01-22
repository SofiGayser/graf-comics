import { options } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(options);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    // Получаем параметры запроса для пагинации истории
    const { searchParams } = new URL(request.url);
    const historyLimit = parseInt(searchParams.get('historyLimit') || '5');
    const historyPage = parseInt(searchParams.get('historyPage') || '1');
    const historySkip = (historyPage - 1) * historyLimit;

    // Получаем пользователя с балансом и активными подписками
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        hasActiveSubscription: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gt: new Date(), // Только действующие подписки
            },
          },
          include: {
            plan: true,
          },
          orderBy: {
            endDate: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем последние транзакции пользователя
    const recentTransactions = await prisma.transactionHistory.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        createdAt: true,
        payment: {
          select: {
            id: true,
            yooPaymentId: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: historyLimit,
      skip: historySkip,
    });

    // Получаем общее количество транзакций для пагинации
    const totalTransactions = await prisma.transactionHistory.count({
      where: {
        userId: user.id,
      },
    });

    // Форматируем транзакции для фронтенда
    const formattedTransactions = recentTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      description: transaction.description,
      date: transaction.createdAt,
      formattedDate: new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      paymentMethod: transaction.payment?.paymentMethod,
      isDeposit: transaction.type === 'DEPOSIT',
    }));

    // Получаем статистику по транзакциям
    const transactionStats = await prisma.transactionHistory.aggregate({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const activeSubscription = user.subscriptions[0];

    return NextResponse.json({
      balance: user.balance,
      email: user.email,
      name: user.name,
      hasActiveSubscription: user.hasActiveSubscription,
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            plan: activeSubscription.plan.name,
            planId: activeSubscription.plan.id,
            endDate: activeSubscription.endDate,
            price: activeSubscription.plan.price,
            duration: activeSubscription.plan.duration,
            autoRenew: activeSubscription.autoRenew,
            formattedEndDate: new Date(activeSubscription.endDate).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
          }
        : null,
      // История транзакций
      recentTransactions: formattedTransactions,
      transactionStats: {
        totalCount: transactionStats._count.id,
        totalAmount: transactionStats._sum.amount || 0,
        depositCount: await prisma.transactionHistory.count({
          where: {
            userId: user.id,
            type: 'DEPOSIT',
            status: 'COMPLETED',
          },
        }),
        withdrawalCount: await prisma.transactionHistory.count({
          where: {
            userId: user.id,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
          },
        }),
      },
      // Пагинация
      pagination: {
        total: totalTransactions,
        page: historyPage,
        limit: historyLimit,
        totalPages: Math.ceil(totalTransactions / historyLimit),
        hasMore: historyPage * historyLimit < totalTransactions,
      },
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка при получении баланса',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

// Дополнительный endpoint для получения расширенной истории транзакций
export async function POST(request: Request) {
  const session = await getServerSession(options);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { page = 1, limit = 20, type, startDate, endDate, status = 'COMPLETED' } = body;

    const skip = (page - 1) * limit;

    // Строим фильтр для запроса
    const filter: any = {
      userId: session.user.id,
    };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.lte = new Date(endDate);
      }
    }

    // Получаем отфильтрованные транзакции
    const transactions = await prisma.transactionHistory.findMany({
      where: filter,
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        payment: {
          select: {
            id: true,
            yooPaymentId: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });

    // Получаем общее количество для пагинации
    const total = await prisma.transactionHistory.count({
      where: filter,
    });

    // Форматируем результат
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      typeText: getTransactionTypeText(transaction.type),
      amount: transaction.amount,
      formattedAmount: `${transaction.type === 'DEPOSIT' ? '+' : '-'}${transaction.amount} ₽`,
      currency: transaction.currency,
      status: transaction.status,
      statusText: getStatusText(transaction.status),
      description: transaction.description,
      date: transaction.createdAt,
      formattedDate: new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      shortDate: new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
      paymentMethod: transaction.payment?.paymentMethod,
      isDeposit: transaction.type === 'DEPOSIT',
    }));

    // Получаем статистику по фильтру
    const stats = await prisma.transactionHistory.aggregate({
      where: filter,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count.id,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      filter: {
        type,
        startDate,
        endDate,
        status,
      },
    });
  } catch (error) {
    console.error('Transaction history fetch error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка при получении истории транзакций',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

// Вспомогательные функции для форматирования
function getTransactionTypeText(type: string): string {
  const types: Record<string, string> = {
    DEPOSIT: 'Пополнение',
    WITHDRAWAL: 'Списание',
    SUBSCRIPTION: 'Подписка',
    PURCHASE: 'Покупка',
  };
  return types[type] || type;
}

function getStatusText(status: string): string {
  const statuses: Record<string, string> = {
    COMPLETED: 'Завершено',
    PENDING: 'В обработке',
    FAILED: 'Ошибка',
    REFUNDED: 'Возврат',
  };
  return statuses[status] || status;
}
