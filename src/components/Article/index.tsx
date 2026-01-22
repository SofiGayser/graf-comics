'use client';
import { useGetArticleByIdQuery } from '@/store/api/articles';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { FC } from 'react';
import { ComicsComment } from '../ComicsPreview/components';
import { comments } from '../ComicsPreview/data';
import { Avatar } from '../UI';
import { ArticleView, BackLink } from '../shared';
import { ShareButton } from '../shared/ShareButton';
import { LikeButton, SimilarArticles, Skeleton } from './components';
import styles from './index.module.scss';

// prettier-ignore
const categoryObj = {
  "PROMOTION": "продвижение комикса", 
  "SCENARIO": "сценарий",
  "LIFESTYLE": "лайфстайл художника",
  "CHARACTERS": "персонажи",
  "ENVIROMENT": "окружение",
  "GRAPHIC": "графическое наполнение",
};

const Article: FC = () => {
  const obj = useParams<{ id: string }>();

  const { data, isLoading, isError } = useGetArticleByIdQuery(obj?.id, {
    refetchOnFocus: false,
  });

  const { data: userData } = useSession();

  if (isError) {
    return (
      <div className="contaner">
        <p>Ошибка...</p>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton />;
  }

  //@ts-ignore
  const dataJson = JSON.parse(data.content);
  return (
    <section
      className="article"
      style={{
        backgroundImage: 'url(/bg-article.jpg)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100%',
      }}
    >
      <div className={cn('container', styles['padding'])}>
        <BackLink mixClass={[styles['link']]} />
        <div className={styles['inner-container']}>
          {data.cover && <img alt="article cover" className={styles['article__cover']} src={data.cover} />}
          <div className={styles['article__container']}>
            <h2 className={styles['article__title']}>{data.title}</h2>
            <p className={styles['article__category']}>{categoryObj[data.category]}</p>
            <div className={styles['data-container']}>
              <div className={styles['data-flex']}>
                <Avatar />
                <p className={styles['article__author']}>{data.authorName}</p>
              </div>
              <p className={styles['article__data']}>{new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
            <ArticleView data={dataJson} />
            <div className={styles['buttons']}>
              <LikeButton
                isLiked={data?.likes.includes(userData?.user?.id)}
                count={data?.likes.length}
                userId={userData?.user?.id}
                articleId={data.id}
              />

              <ShareButton url={window.location.href} />
            </div>
          </div>
        </div>
        <div className={styles['comments-container']}>
          {comments.map((comment) => (
            <>
              <ComicsComment key={comment.id} comment={comment} />
            </>
          ))}
        </div>
        <p className={styles['similar__text']}>Читайте также</p>
        <SimilarArticles id={obj?.id} />
      </div>
    </section>
  );
};
export default Article;
