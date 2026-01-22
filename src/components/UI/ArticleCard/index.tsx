import { Article } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';
import styles from './index.module.scss';

type Props = Pick<Article, 'description' | 'title' | 'id'>;

const ArticleCard: FC<Props> = ({ description, title, id }) => {
  return (
    <div className={styles['article']}>
      <div className={styles['article__container-text']}>
        <header className={styles['article__header']}>{title}</header>
        <p className={styles['article__short']}>{description}</p>
      </div>
      <div className={styles['article__img']}></div>
      <Link className={styles['article__link']} href={`/article/${id}`}>
        Читать статью
      </Link>
    </div>
  );
};
export default ArticleCard;
