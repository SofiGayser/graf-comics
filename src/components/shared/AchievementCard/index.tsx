'use client';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import React, { FC, useState } from 'react';
import styles from './index.module.scss';

type Props = {
  text: string;
  description?: string;
  mixClass?: string[];
  imagePath: string;
};

const AchievementCard: FC<Props> = ({ text, description, mixClass = [], imagePath }) => {
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    router.push(
      `/achievement-detail?title=${encodeURIComponent(text)}${
        description ? `&description=${encodeURIComponent(description)}` : ''
      }&image=${encodeURIComponent(imagePath)}`,
    );
  };

  return (
    <div
      onClick={handleClick}
      className={cn(styles['achievement-card'], { [styles['achievement-card--active']]: isActive })}
    >
      <div className={cn(styles['achievement-card__container'], ...mixClass)}>
        <img src={imagePath} alt={text} className={styles['achievement-card__image']} />
      </div>

      <p className={styles['achievement-card__text']}>{text}</p>
    </div>
  );
};

export default React.memo(AchievementCard);
