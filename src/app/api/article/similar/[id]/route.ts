import prisma from '@/services/prisma';
import { NextResponse, type NextRequest } from 'next/server';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    if (!params?.id) {
      return NextResponse.json({ message: 'Id not found' }, { status: 400 });
    }

    const totalArticles = await prisma.article.count({
      where: {
        NOT: { id: params.id },
        isApproved: true,
      },
    });

    if (totalArticles === 0) {
      return NextResponse.json([]);
    }

    const randomLimit = 5;

    if (totalArticles <= randomLimit) {
      const articles = await prisma.article.findMany({
        where: {
          NOT: { id: params.id },
          isApproved: true,
        },
      });
      return NextResponse.json(articles);
    }

    const randomSkip = Math.floor(Math.random() * (totalArticles - randomLimit));

    const randomArticles = await prisma.article.findMany({
      where: {
        NOT: { id: params.id },
        isApproved: true,
      },
      skip: randomSkip,
      take: randomLimit,
    });

    return NextResponse.json(randomArticles);
  } catch (error) {
    console.error('Error fetching random articles:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
};
