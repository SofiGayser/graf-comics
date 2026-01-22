'use client';
import { useTheme } from '@/context/themeProvider';
import cn from 'classnames';
import { FC } from 'react';
import PopularComics from '../PopularComics';
import styles from './index.module.scss';
import { PopularCardsProps } from './types';

const PopularCards: FC<PopularCardsProps> = ({ titleText, iconSrc }) => {
  // меняем Icon на iconSrc
  const { theme } = useTheme();

  return (
    <section className={styles['section']}>
      <div className={styles['container']}>
        <h1 className={styles['container__slogan']}>
          <img
            src={iconSrc}
            alt=""
            className={cn(styles['icon'], {
              [styles['icon--dark']]: theme === 'dark',
            })}
          />
          {titleText}
        </h1>
        <div className={styles['popular-cards']}>
          <PopularComics />
        </div>
      </div>
    </section>
  );
};
export default PopularCards;
