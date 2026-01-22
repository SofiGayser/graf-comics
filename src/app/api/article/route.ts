import prisma from '@/services/prisma';
import { IArticle } from '@/store/article/types';
import { getServerSession } from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import { options } from '../../api/auth/[...nextauth]/options';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const categoryObj = {
  'продвижение комикса': 'PROMOTION',
  сценарий: 'SCENARIO',
  'лайфстайл художника': 'LIFESTYLE',
  персонажи: 'CHARACTERS',
  окружение: 'ENVIROMENT',
  'графическое наполнение': 'GRAPHIC',
} as const;

export const GET = async (request: NextRequest) => {
  try {
    const take = Number(request.nextUrl.searchParams.get('take'));

    const articles = await prisma.article.findMany({
      where: { isApproved: true },
      ...(take && {
        take: take,
      }),
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { message: error },
      {
        status: 500,
      },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await getServerSession(options);
    const data: IArticle = await request.json();

    const newArticle = await prisma.article.create({
      data: {
        category: categoryObj[data.category[0].text],
        content: data.article,
        isApproved: false,
        cover: data.cover,
        description: data.description,
        title: data.title,
        authorId: session.user.id,
        authorName: data.authorName,
      },
    });
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        isArticleApprove: false,
      },
    });
    return NextResponse.json(newArticle);
  } catch (error) {
    return NextResponse.json(
      {
        message: error,
      },
      {
        status: 500,
      },
    );
  }
};
