// app/comics/[id]/page.tsx
import Comics from '@/components/Comics';
import prisma from '@/services/prisma';
import { NextPage } from 'next';
import { getServerSession } from 'next-auth';

const getComics = async (id: string) => {
  return prisma.comics.findUnique({
    where: { id: id, isApproved: true },
    include: {
      toms: {
        include: {
          chapters: true,
        },
      },
    },
  });
};

const ComicsPage: NextPage = async ({ params }: { params: { id: string } }) => {
  if (!params?.id) {
    return <div>Комикс не найден</div>;
  }

  const data = await getComics(params.id);

  if (!data) {
    return <div>Комикс не найден</div>;
  }

  const imgs = data.toms.flatMap((el) => el.chapters.flatMap((item) => item.images));

  // Получаем информацию о закладках пользователя
  const session = await getServerSession();
  let initialBookmarked = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: user.id,
          comicsId: params.id,
        },
      });
      initialBookmarked = !!bookmark;
    }
  }

  return (
    <Comics
      title={data.title}
      imgs={imgs}
      comicsId={params.id}
      initialLikes={data.likes || []} // Убедитесь, что передается массив лайков
      initialBookmarked={initialBookmarked}
    />
  );
};

export default ComicsPage;
