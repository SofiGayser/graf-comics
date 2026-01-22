'use client';
import { FC, useEffect, useState } from 'react';

import styles from './index.module.scss';

import { useTheme } from '@/context/themeProvider';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Articles from '../Articles';
import PopularComics from '../PopularComics';
import { Badge, Button, SliderArticles } from '../UI';
import { ArrowLink } from '../shared/index';
import { genresRoutes } from './constants';
const Home: FC = () => {
  const { data, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [img, setImg] = useState<string>();
  useEffect(() => {
    const selectedGenre = genresRoutes.find((genre) => genre.src === img || genre.darkimg === img);
    if (selectedGenre) {
      setImg(theme === 'light' ? selectedGenre.src : selectedGenre.darkimg);
    }
  }, [theme]);

  const router = useRouter();

  return (
    <>
      <section className={styles['image-section']}>
        <div className={styles['cards']}>
          <div className={styles['cards__item']}>
            <img src={'/homePage6.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img className={styles['cards__item--right']} src={'/homePage3.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img src={'/homePage4.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img src={'/homePage5.svg'} alt="" />
          </div>
        </div>
        <div className={styles['image-container']}>
          <div className={styles['image-container__text-container']}>
            <h1 className={styles['image-container__slogan']}>Создаем вселенную комиксов вместе</h1>
            <p className={styles['image-container__text']}>Здесь каждый комикс находит своего читателя</p>
            <div className={styles['image-container__btn']}>
              <Button onClick={() => router.push('/add-comics/images')} mixClass={[styles['image-container__btn']]}>
                Добавить комикс
              </Button>
            </div>
          </div>
        </div>

        <div className={styles['cards-pc']}>
          <div className={styles['cards-pc__item']}>
            <img src={'/homePage2.svg'} alt="Card 2" />
          </div>

          <div className={styles['cards-pc__item']}>
            <img src={'/homePage1.svg'} alt="Card 1" />
          </div>

          <div className={styles['cards-pc__item']}>
            <img src={'/homePage3.svg'} alt="Card 3" />
          </div>

          <div className={styles['cards-pc__item']}>
            <img src={'/homePage7.svg'} alt="Card 7" />
          </div>

          <div className={styles['cards-pc__item']}>
            <img src={'/homePage4.svg'} alt="Card 4" />
          </div>

          <div className={styles['cards-subgrid']}>
            <div className={styles['cards-subgrid__item']}>
              <img src={'/homePage5.svg'} alt="Card 5" />
            </div>
            <div className={styles['cards-subgrid__item']}>
              <img src={'/homePage6.svg'} alt="Card 6" />
            </div>
          </div>

          <div className={styles['cards-subgrid-bottom']}>
            <div className={styles['cards-subgrid-bottom__item']}>
              <img src={'/homePage8.svg'} alt="Card 8" />
            </div>
            <div className={styles['cards-subgrid-bottom__item']}>
              <img src={'/homePage9.svg'} alt="Card 9" />
            </div>
          </div>
        </div>
        <div className={styles['cards']}>
          <div className={styles['cards__item']}>
            <img src={'/homePage9.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img src={'/homePage1.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img src={'/homePage7.svg'} alt="" />
          </div>
          <div className={styles['cards__item']}>
            <img className={styles['cards__item--left']} src={'/homePage8.svg'} alt="" />
          </div>
        </div>
      </section>
      {
        //**
        // TODO: доделать */
      }
      <section className={styles['co-author-section']}>
        <div className={cn('container', styles['co-author__container'])}>
          <p className={styles['co-author__text']}>
            Хочешь помочь с <span className={styles['co-author__idea']}>идеей</span> или есть своя?
          </p>
          <Link href="/co-author" className={styles['co-author__link']}>
            Стать соавтором
          </Link>
        </div>
      </section>
      <section className={styles['popular-section']}>
        <div className={cn(styles['popular-container'], 'container')}>
          <ArrowLink mixClass={[styles['popular-container__link']]} text="Популярные" url="/popular" />

          <PopularComics />
        </div>
      </section>
      <section className={styles['novelty-section']}>
        <div className={cn(styles['novelty-container'], 'container')}>
          <ArrowLink mixClass={[styles['novelty-container__link']]} text="Новинки" url="/novelty" />

          <PopularComics />
        </div>
      </section>
      <section className={styles['genre-section']}>
        <ArrowLink mixClass={[styles['genre-container__link']]} text="Жанры" url="/catalog" />
        <div className={styles['genres']}>
          {genresRoutes.map(({ src, text, url }) => (
            <Badge mixClass={[styles['genres__badge']]} text={text} url={url} />
          ))}

          {genresRoutes.map(({ src, darkimg, text, url }) => (
            <Link key={text} className={styles['genres__card']} href={url}>
              <Image src={theme === 'light' ? src : darkimg} height={200} width={290} alt={text} />
            </Link>
          ))}
        </div>
      </section>
      <section className={styles['slider-section']}>
        <div className={cn(styles['slider-container'], 'container')}>
          <ArrowLink mixClass={[styles['slider-container__link']]} text="Новости" url="/news" />
          <SliderArticles className={styles['slider']} slides={['Статья №1', 'Статья №2', 'Статья №3']} />
        </div>
      </section>
      <section className={styles['co-author-section']}>
        <div className={cn('container', styles['co-author__container'])}>
          <p className={styles['co-author__text']}>
            Есть чем поделиться с миром? Знаешь интересные{' '}
            <span className={styles['co-author__idea']}>факты о комиксах</span>?
          </p>
          <Link href="/add-article/images" className={styles['co-author__link']}>
            Напиши статью
          </Link>
        </div>
      </section>
      <section className="article-section">
        <div className="container">
          <ArrowLink mixClass={[styles['slider-container__link']]} text="Полезные статьи" url="/articles" />
          <Articles />
        </div>
      </section>
    </>
  );
};

export default Home;
