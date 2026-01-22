'use client';
import { useTheme } from '@/context/themeProvider';
import { FC, useEffect, useState } from 'react';
import PopularCards from '../PopularCards';
import { BackLink } from '../shared';
import styles from './index.module.scss';

const Popular: FC = () => {
  const { theme } = useTheme();
  const [rating, setRating] = useState<string>('');
  const [vector, setVector] = useState<string>('');
  const [cup, setCup] = useState<string>('');

  useEffect(() => {
    if (theme === 'light') {
      setRating('/rating.svg');
      setVector('/Vector.svg');
      setCup('/cup.svg');
    } else {
      setRating('/ratingWhite.svg');
      setVector('/VectorWhite.svg');
      setCup('/cupWhite.svg');
    }
  }, [theme]);

  return (
    <div>
      <div className={'container'}>
        <BackLink mixClass={[styles['popular__backLink']]} />
      </div>
      <div className={styles['container']}>
        <PopularCards iconSrc={rating} titleText="Топ рейтинга (месяц)" />
        <PopularCards iconSrc={vector} titleText="Топ просмотров (месяц)" />
        <PopularCards iconSrc={cup} titleText="Лучшее за все время" />
      </div>
    </div>
  );
};
export default Popular;
