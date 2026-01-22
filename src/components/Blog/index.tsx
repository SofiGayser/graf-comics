'use client';
import { ctx } from '@/context/contextProvider';
import data from '@/data/data.json';
import cn from 'classnames';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useContext } from 'react';
import Articles from '../Articles';
import { Button, SliderArticles } from '../UI';
import { ActiveFilters, ArrowLink } from '../shared';
import styles from './index.module.scss';
const { author, sortSmall, theme } = data;

const Filters = dynamic(() => import('@/components/shared/Filters/index'), {
  ssr: false,
});

const linkCreateArticle = '/add-article/images';

const Blog: FC = () => {
  const { activeFilters, toggleFilters } = useContext(ctx);

  const { push } = useRouter();

  return (
    <>
      <section className={styles['blog']}>
        <section className={styles['image-section']}>
          <div className={styles['cards']}></div>
          <div className={styles['image-container']}>
            <div className={styles['image-container__text-container']}>
              <h1 className={styles['image-container__slogan']}>Есть чем поделиться с миром?</h1>
              <p className={styles['image-container__text']}>
                Знаешь интересные <span>факты о комиксах?</span> Не стесняйся!
              </p>
              <div className={styles['image-container__btn']}>
                <Button onClick={() => push(linkCreateArticle)} mixClass={[styles['image-container__btn']]}>
                  Напиши статью
                </Button>
              </div>
            </div>
          </div>

          <div className={styles['cards-pc']}></div>
          <div className={styles['cards']}></div>
        </section>
        <div className={styles['blog__search--mobile']}>
          <label htmlFor="search" className={styles['blog__search-label']}>
            <input
              type="text"
              id="search"
              placeholder="Название, автор, персонаж..."
              className={styles['blog__search-field']}
            />
          </label>
          <ActiveFilters
            mixClass={[styles['active-filters']]}
            filters={activeFilters}
            toggleFilters={toggleFilters}
            shortMode={false}
          />
        </div>
        <div className={cn(styles['blog__container'], 'container')}>
          <header className={styles['blog__header']}>
            <p className={styles['blog__header-text']}>
              Есть чем поделиться с миром? Знаешь интересные <span>факты о комиксах?</span>
            </p>
            <Link className={styles['blog__header-link']} href={linkCreateArticle}>
              Напиши статью
            </Link>
          </header>
          <header className={styles['blog__header--mobile']}>
            <p className={styles['blog__header-text']}>Есть чем поделиться?</p>
            <Link className={styles['blog__header-link']} href={linkCreateArticle}>
              Напиши статью
            </Link>
          </header>
          <ArrowLink mixClass={[styles['blog__link']]} text="Новости" url="/news" />
          <SliderArticles slides={['Статья №1', 'Статья №2', 'Статья №3']} />
        </div>
      </section>
      <section className={styles['blog-articles']}>
        <div className={styles['container']}>
          <ArrowLink mixClass={[styles['blog__link']]} text="Популярные статьи" url="/popular-article" />
          <Articles />
        </div>
      </section>
      <section className={styles['filter-section']}>
        <div className={styles['container-articles']}>
          <div className={styles['container-filter']}>
            <div className={styles['blog__search--pc']}>
              <label htmlFor="search" className={styles['blog__search-label']}>
                <input
                  type="text"
                  id="search"
                  placeholder="Название, автор, персонаж..."
                  className={styles['blog__search-field']}
                />
              </label>
              <ActiveFilters
                mixClass={[styles['active-filters']]}
                filters={activeFilters}
                toggleFilters={toggleFilters}
                shortMode={false}
              />
            </div>

            <div className={styles['articles-card']}>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
              <div className={styles['articles__item-card']}>
                <header className={styles['articles__header']}>Название статьи</header>
                <p className={styles['articles__short']}>Кратко о статье</p>
                <div className={styles['articles__img']}>
                  <img src="" alt="" />
                </div>
                <Link className={styles['articles__link']} href={'/article/1'}>
                  Читать статью
                </Link>
              </div>
            </div>
          </div>
          <div className={styles['articles-filter']}>
            <Filters
              filters={[
                { text: 'Тема', colorClass: 'theme', filters: theme, filterType: 'default', isActive: false },
                { text: 'Автор', colorClass: 'author', filters: author, filterType: 'search', isActive: false },
                { text: 'Сортировать', colorClass: 'violet', filters: sortSmall, filterType: 'sort', isActive: false },
              ]}
              mixClass={[styles['catalog__filter']]}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
