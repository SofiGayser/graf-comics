'use client';
import { ActiveFilters } from '@/components/shared/index';
import { ctx } from '@/context/contextProvider';
import data from '@/data/data.json';
import cn from 'classnames';
import { useSearchParams } from 'next/navigation';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Cards } from '../UI';
import { Filters } from '../shared';
import styles from './index.module.scss';

const { focus, genres, rating, size, status, tags, viewCounts, sort } = data;

interface Comics {
  id: string;
  title: string;
  description: string;
  covers: string[];
  banner: string;
  rating: string;
  status: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  toms: {
    chapters: {
      id: string;
      name: string;
    }[];
  }[];
  _count: {
    likes: number;
  };
}

interface ComicCard {
  id: string;
  name: string;
  description: string;
  cover?: string; // Одиночная обложка
  covers?: string[]; // Массив обложек (добавляем)
  author: string;
  authorAvatar?: string;
  rating: string;
  status: string;
  chaptersCount: number;
  likes: number;
  comicsId: string; // Добавляем comicsId
}

const Catalog: FC = () => {
  const searchParams = useSearchParams();
  const [scroll, setScroll] = useState<number>(0);
  const [comics, setComics] = useState<Comics[]>([]);
  const [loading, setLoading] = useState(true);

  const { activeFilters, toggleFilters } = useContext(ctx);

  // Функция загрузки комиксов
  const fetchComics = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      activeFilters.forEach((filter) => {
        if (filter.colorClass === 'genres') {
          params.append('genre', filter.text);
        } else if (filter.colorClass === 'naprav') {
          params.append('focus', filter.text);
        } else if (filter.colorClass === 'tags') {
          params.append('tag', filter.text);
        } else if (filter.colorClass === 'status') {
          params.append('status', filter.text);
        } else if (filter.colorClass === 'rating') {
          params.append('rating', filter.text);
        }
      });

      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/comics?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      if (Array.isArray(data)) {
        setComics(data);
      } else {
        console.error('Expected array but got:', data);
        setComics([]);
      }
    } catch (error) {
      console.error('Error fetching comics:', error);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, [activeFilters, searchParams]);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleScroll = useCallback(() => {
    setScroll(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Преобразуем комиксы в формат для Cards компонента
  const comicCards: ComicCard[] = comics.map((comic) => ({
    id: comic.id,
    name: comic.title,
    description: comic.description,
    cover: comic.covers?.[0] || '', // Оставляем cover для обратной совместимости
    covers: comic.covers, // Добавляем полный массив covers
    author: comic.author?.name || 'Неизвестный автор',
    authorAvatar: comic.author?.avatar,
    rating: comic.rating,
    status: comic.status,
    chaptersCount: comic.toms?.reduce((total, tom) => total + (tom.chapters?.length || 0), 0) || 0,
    likes: comic._count?.likes || 0,
    comicsId: comic.id, // Добавляем comicsId для ссылки
  }));

  return (
    <section className="catalog">
      <div className={cn(styles['catalog__container'], 'container')}>
        <label htmlFor="search" className={styles['catalog__search-label']}>
          <input
            type="text"
            id="search"
            placeholder="Название, автор, персонаж..."
            className={styles['catalog__search-field']}
            defaultValue={searchParams.get('search') || ''}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const searchValue = (e.target as HTMLInputElement).value;
                window.history.pushState({}, '', `?search=${encodeURIComponent(searchValue)}`);
                fetchComics();
              }
            }}
          />
        </label>

        <Filters
          filters={[
            { text: 'Жанры', colorClass: 'genres', filters: genres, filterType: 'default', isActive: false },
            { text: 'Направленность', colorClass: 'naprav', filters: focus, filterType: 'default', isActive: false },
            { text: 'Размер', colorClass: 'size', filters: size, filterType: 'default', isActive: false },
            { text: 'Включить метки', colorClass: 'tags', filters: tags, filterType: 'search', isActive: false },
            {
              text: 'Количество оценок',
              colorClass: 'viewcounts',
              filters: viewCounts,
              filterType: 'default',
              isActive: false,
            },
            { text: 'Рейтинг', colorClass: 'rating', filters: rating, filterType: 'default', isActive: false },
            { text: 'Статус', colorClass: 'status', filters: status, filterType: 'default', isActive: false },
            { text: 'Сортировать', colorClass: 'author', filters: sort, filterType: 'sort', isActive: false },
          ]}
          mixClass={[styles['catalog__filter']]}
          urlFilter={searchParams.get('genre') ?? ''}
        />

        <div className={styles['catalog__cards-container']}>
          <ActiveFilters
            mixClass={[styles['catalog__active-filters']]}
            filters={activeFilters}
            toggleFilters={toggleFilters}
            shortMode={false}
          />

          {loading ? (
            <div>Загрузка...</div>
          ) : comicCards.length === 0 ? (
            <div>Комиксы не найдены</div>
          ) : (
            <Cards mixClass={[styles['catalog__cards']]} cards={comicCards} />
          )}
        </div>

        <CSSTransition
          timeout={200}
          in={scroll > 80}
          unmountOnExit
          classNames={{
            enter: styles['catalog__start-btn-enter'],
            enterActive: styles['catalog__start-btn-enter-active'],
            exit: styles['catalog__start-btn-exit'],
            exitActive: styles['catalog__start-btn-exit-active'],
          }}
        >
          <button onClick={() => handleClick()} className={styles['catalog__start-btn']}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 7.79169L18 28.2084"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28.209 18L18.0007 7.79169L7.79232 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </CSSTransition>
      </div>
    </section>
  );
};

export default Catalog;
