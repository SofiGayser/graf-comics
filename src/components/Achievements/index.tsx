'use client';
import { AchievementCard, BackLink } from '@/components/shared';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { FC } from 'react';
import styles from './index.module.scss';

const ProfileReader: FC = () => {
  const { data } = useSession();

  const achievementItems = [
    {
      title: 'Благотворительный Фонд',
      imagePath: '/achievement/Благотворительный Фонд.png',
      description: 'Дается пользователю за отправку доната суммой XXXX',
    },
    {
      title: 'На связи',
      imagePath: '/achievement/На связи.png',
      description: 'дается за активное использование системы поиска соавторов',
    },
    { title: 'Подарочки', imagePath: '/achievement/подарочки.png', description: '' },
    {
      title: 'Прости. Прощай',
      imagePath: '/achievement/Прости. Прощай.png',
      description: 'За удаление своего комикса в первый раз',
    },
    {
      title: 'Сын маминой подруги',
      imagePath: '/achievement/сын маминой подруги.png',
      description: 'За участие в конкурсах сайта на постоянной основе',
    },
    {
      title: 'Happy Birthday',
      imagePath: '/achievement/Happy Birthday.png',
      description: 'На день рождение пользователя',
    },
  ];
  const achievementItemsauthor = [
    {
      title: 'Дебютант',
      imagePath: '/achievement/Дебютант.png',
      description: 'Пользователь первый раз выложил статью',
    },
    {
      title: 'Прости. Прощай',
      imagePath: '/achievement/Прости. Прощай.png',
      description: 'За удаление своего комикса в первый раз',
    },
    {
      title: 'Сын маминой подруги',
      imagePath: '/achievement/сын маминой подруги.png',
      description: 'За участие в конкурсах сайта на постоянной основе',
    },
    {
      title: 'Happy Birthday',
      imagePath: '/achievement/Happy Birthday.png',
      description: 'На день рождение пользователя',
    },
  ];
  return (
    <div className={'container'}>
      <section className={styles['achievements']}>
        <section className={styles['achievements__heading']}>
          <BackLink mixClass={[styles['achievements__backlink']]} />
          <p className={styles['achievements__counter']}>00/00</p>
        </section>

        <div className={styles['achievements__section']}>
          <p className={styles['achievements__title']}>Достижения</p>
          <p className={styles['achievements__subtitle']}>Достижения читателя</p>
          <div className={styles['achievements__cards-container']}>
            {achievementItems.map((item, index) => (
              <AchievementCard
                key={index}
                text={item.title}
                imagePath={item.imagePath}
                description={item.description}
              />
            ))}
          </div>

          <p className={cn(styles['achievements__subtitle'], styles['achievements__subtitle--author'])}>
            Достижения автора
          </p>
          <div className={styles['achievements__cards-container']}>
            {achievementItemsauthor.map((item, index) => (
              <AchievementCard
                key={index + achievementItemsauthor.length}
                text={item.title}
                imagePath={item.imagePath}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileReader;
