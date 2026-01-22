'use client';
import { BackLink } from '@/components/shared';
import cn from 'classnames';
import { FC } from 'react';
import styles from './index.module.scss';

type Props = {
  title?: string;
  description?: string;
  image?: string;
};

const AchievementDetail: FC<Props> = ({ title, description, image }) => {
  const displayTitle = title && title.trim().length > 0 ? title : 'Достижение';
  const displayDescription =
    typeof description === 'string' && description.trim().length > 0 ? description : 'Описание достижения';
  const displayImage = typeof image === 'string' && image.trim().length > 0 ? image : '/post.svg';

  return (
    <section className={cn(styles['achievement-detail'], 'container')}>
      <BackLink mixClass={[styles['achievement-detail__backlink']]} />

      <section className={styles['achievement-detail__main-content']}>
        <img src={displayImage} alt="Иконка достижения" className={styles['achievement-detail__img']} />
        <div className={styles['achievement-detail--view']}>
          <p className={styles['achievement-detail__title']}>{displayTitle}</p>
          <p className={styles['achievement-detail__description']}>{displayDescription}</p>
        </div>
      </section>
    </section>
  );
};

export default AchievementDetail;
