import prisma from '@/services/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Получаем историю транзакций пользователя
    const transactions = await prisma.transactionHistory.findMany({
      where: {
        userId: session.user.id,
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
      where: {
        userId: session.user.id,
      },
    });

    // Форматируем дату в нужный формат
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      formattedDate: new Date(transaction.createdAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
      date: transaction.createdAt,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json({ error: 'Ошибка при получении истории операций' }, { status: 500 });
  }
}
