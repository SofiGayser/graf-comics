'use client';
import MoreDetailsPopup from '@/components/shared/MoreDetailsPopup';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { Cards, Tabs } from '../UI';
import { ProfileFilters, Stats } from '../shared';
import styles from './index.module.scss';

// Обновляем интерфейс Bookmark для включения статуса
interface Bookmark {
  id: string;
  userId: string;
  comicsId: string;
  status: 'READING' | 'PLANNED' | 'COMPLETED' | 'DROPPED';
  createdAt: Date;
  updatedAt: Date;
  comics: {
    id: string;
    title: string;
    covers: string[];
    description: string;
    genres: string[];
    status: string;
  };
}

interface ICard {
  id: string;
  name: string;
  type?: string;
  cover?: string;
  comicsId?: string;
  bookmarkStatus?: string;
}

const ProfileReader: FC = () => {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('Читаю');
  const [error, setError] = useState<string | null>(null);
  const [isOpenFilters, setIsOpenFilters] = useState(false);
  const handleOpenFiltersPopup = () => {
    setIsOpenFilters(true);
  };
  const handleCloseFiltersPopup = () => setIsOpenFilters(false);

  const [isOpenMoreDetailsPopup, setIsOpenMoreDetailsPopup] = useState(false);
  const handleOpenMoreDetailsPopup = () => {
    setIsOpenMoreDetailsPopup(true);
  };
  const handleCloseMoreDetailsPopup = () => {
    setIsOpenMoreDetailsPopup(false);
  };

  // Функция для получения закладок с фильтрацией по статусу
  // Временная версия для тестирования
  const fetchBookmarks = async (status: string = 'Все') => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Fetching bookmarks with status:', status);

      // Преобразуем русские названия в значения enum
      const statusMap: { [key: string]: string } = {
        Все: 'ALL',
        Читаю: 'READING',
        'В планах': 'PLANNED',
        Прочитано: 'COMPLETED',
        Брошено: 'DROPPED',
      };

      const statusValue = statusMap[status] || 'ALL';

      // Формируем URL с параметром status
      const url = `/api/bookmarks${statusValue !== 'ALL' ? `?status=${statusValue}` : ''}`;

      console.log('📡 Making request to:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Bookmarks received:', data.length);

      setBookmarks(data);
    } catch (error) {
      console.error('❌ Error fetching bookmarks:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке закладок');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchBookmarks(selectedStatus);
    }
  }, [session]);

  // Обработчик выбора статуса из фильтров
  const handleStatusChange = (status: string) => {
    console.log('🎯 Status changed to:', status);
    setSelectedStatus(status);
    fetchBookmarks(status);
  };

  const handleResetFilters = () => {
    setSelectedStatus('Все');
    fetchBookmarks('Все');
  };

  // Функция для удаления закладки
  const handleRemoveBookmark = async (comicsId: string) => {
    try {
      const response = await fetch(`/api/comics/${comicsId}/bookmark`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Обновляем список закладок
        fetchBookmarks(selectedStatus);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Функция для изменения статуса закладки
  const handleUpdateBookmarkStatus = async (comicsId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/comics/${comicsId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Обновляем список закладок
        fetchBookmarks(selectedStatus);
      }
    } catch (error) {
      console.error('Error updating bookmark status:', error);
    }
  };

  // Преобразуем закладки в формат для Cards компонента
  const bookmarkCards = bookmarks.map((bookmark) => ({
    id: bookmark.id,
    name: bookmark.comics.title,
    image: bookmark.comics.covers[0] || '/default-comics-cover.png',
    description: bookmark.comics.description,
    genres: bookmark.comics.genres,
    status: bookmark.comics.status,
    comicsId: bookmark.comics.id,
    cover: bookmark.comics.covers[0],
    bookmarkStatus: bookmark.status,
    onRemove: () => handleRemoveBookmark(bookmark.comics.id),
  }));

  return (
    <>
      <MoreDetailsPopup mixClass={[]} isOpen={isOpenMoreDetailsPopup} onClose={handleCloseMoreDetailsPopup} />

      <section className={styles['profile-header']}>
        <div className={styles['profile__wallpaper']}>
          <img src="./profile-skeleton.svg" alt="avatar" className={styles['profile__img']} />
        </div>
        <div className={cn(styles['profile__container'], 'container')}>
          <p className={styles['profile__name']}>{session?.user?.name || 'Никнейм'}</p>
          <p className={styles['profile__status']}>Статус</p>
          <p className={styles['profile__details']} onClick={handleOpenMoreDetailsPopup}>
            Подробнее
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="circle_customer_help_info_information_service_support_icon_123208 1">
                <g id="Layer 2">
                  <path
                    id="Vector"
                    d="M5.875 4.375C5.72666 4.375 5.58166 4.33101 5.45832 4.2486C5.33499 4.16619 5.23886 4.04906 5.18209 3.91201C5.12532 3.77497 5.11047 3.62417 5.13941 3.47868C5.16835 3.3332 5.23978 3.19956 5.34467 3.09467C5.44956 2.98978 5.5832 2.91835 5.72868 2.88941C5.87417 2.86047 6.02497 2.87532 6.16201 2.93209C6.29906 2.98886 6.41619 3.08499 6.4986 3.20832C6.58101 3.33166 6.625 3.47666 6.625 3.625C6.625 3.82391 6.54598 4.01468 6.40533 4.15533C6.26468 4.29598 6.07391 4.375 5.875 4.375Z"
                    fill="#7A5AF8"
                  />
                  <path
                    id="Vector_2"
                    d="M5.875 10.75C4.91082 10.75 3.96829 10.4641 3.1666 9.92842C2.36491 9.39275 1.74007 8.63137 1.37109 7.74058C1.00211 6.84979 0.905571 5.8696 1.09367 4.92394C1.28178 3.97828 1.74608 3.10964 2.42786 2.42786C3.10964 1.74608 3.97828 1.28178 4.92394 1.09367C5.8696 0.905571 6.84979 1.00211 7.74058 1.37109C8.63137 1.74007 9.39275 2.36491 9.92842 3.1666C10.4641 3.96829 10.75 4.91082 10.75 5.875C10.75 7.16793 10.2364 8.40791 9.32215 9.32215C8.40791 10.2364 7.16793 10.75 5.875 10.75ZM5.875 1.75C5.05915 1.75 4.26163 1.99193 3.58328 2.44519C2.90492 2.89845 2.37621 3.54269 2.064 4.29643C1.75179 5.05018 1.6701 5.87958 1.82926 6.67975C1.98843 7.47992 2.3813 8.21493 2.95819 8.79182C3.53508 9.36871 4.27008 9.76158 5.07026 9.92074C5.87043 10.0799 6.69983 9.99822 7.45357 9.68601C8.20732 9.37379 8.85155 8.84508 9.30482 8.16673C9.75808 7.48838 10 6.69085 10 5.875C10 4.78098 9.56541 3.73177 8.79182 2.95819C8.01823 2.1846 6.96902 1.75 5.875 1.75Z"
                    fill="#7A5AF8"
                  />
                  <path
                    id="Vector_3"
                    d="M5.875 8.875C5.67609 8.875 5.48532 8.79598 5.34467 8.65533C5.20402 8.51468 5.125 8.32391 5.125 8.125V5.875C5.125 5.67609 5.20402 5.48532 5.34467 5.34467C5.48532 5.20402 5.67609 5.125 5.875 5.125C6.07391 5.125 6.26468 5.20402 6.40533 5.34467C6.54598 5.48532 6.625 5.67609 6.625 5.875V8.125C6.625 8.32391 6.54598 8.51468 6.40533 8.65533C6.26468 8.79598 6.07391 8.875 5.875 8.875Z"
                    fill="#7A5AF8"
                  />
                </g>
              </g>
            </svg>
          </p>
          <Link className={styles['profile_edit']} href={'/profile/edit'}>
            Редактировать
          </Link>
          <Stats
            mixClass={[styles['profile__stats']]}
            itemClassName={styles['profile__stats-items']}
            stats={[
              {
                name: 'Подписчики',
                count: 0,
              },
              {
                name: 'Комментарии',
                count: 0,
              },
              {
                name: 'Закладки',
                count: bookmarks.length,
              },
            ]}
          />
        </div>
      </section>

      <div className={styles['profile-sections']}>
        <section className={styles['tabs']}>
          <div className={cn(styles['tabs__container'], 'container')}>
            <Tabs mixClass={[styles['tabs__items']]} tabs={['Избранное', 'Закладки', 'Тайтлы']}>
              {/* Вкладка "Избранное" с фильтрацией по статусам */}
              <div>
                <div className={styles['profile__input-search-container']}>
                  <svg
                    className={styles['profile__input-search-img']}
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="#7A5AF8"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_114_272)">
                      <path
                        d="M27.6584 26.0085L20.6946 19.0447C22.5923 16.7237 23.5253 13.7621 23.3007 10.7725C23.0761 7.78286 21.711 4.99394 19.4878 2.9826C17.2645 0.971252 14.3533 -0.108636 11.3562 -0.0336988C8.35904 0.0412383 5.50539 1.26527 3.38545 3.38521C1.26551 5.50514 0.0414824 8.3588 -0.0334547 11.3559C-0.108392 14.353 0.971496 17.2643 2.98284 19.4875C4.99419 21.7107 7.7831 23.0759 10.7727 23.3005C13.7623 23.5251 16.7239 22.5921 19.0449 20.6943L26.0087 27.6582C26.2288 27.8707 26.5235 27.9883 26.8294 27.9856C27.1353 27.983 27.4279 27.8603 27.6442 27.6439C27.8605 27.4276 27.9832 27.135 27.9859 26.8291C27.9885 26.5232 27.8709 26.2285 27.6584 26.0085ZM11.6669 21C9.82094 21 8.01644 20.4526 6.48158 19.427C4.94672 18.4015 3.75044 16.9438 3.04402 15.2384C2.33761 13.5329 2.15278 11.6563 2.5129 9.84581C2.87303 8.03533 3.76195 6.37228 5.06724 5.06699C6.37253 3.7617 8.03557 2.87279 9.84606 2.51266C11.6565 2.15253 13.5332 2.33736 15.2386 3.04378C16.9441 3.7502 18.4017 4.94648 19.4273 6.48133C20.4528 8.01619 21.0002 9.8207 21.0002 11.6667C20.9975 14.1412 20.0132 16.5135 18.2635 18.2633C16.5138 20.013 14.1414 20.9972 11.6669 21Z"
                        fill="#7A5AF8"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_114_272">
                        <rect width="28" height="28" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <input type="text" placeholder={'Поиск...'} className={styles['profile__input-search']} />
                </div>

                <button className={styles['profile__open-filters-btn']} onClick={handleOpenFiltersPopup}>
                  <svg width="22" height="7" viewBox="0 0 22 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="3.89063"
                      cy="3.12099"
                      r="2.20703"
                      transform="rotate(-44.5 3.89063 3.12099)"
                      fill="#7A5AF8"
                    />
                    <circle
                      cx="11.2461"
                      cy="3.12099"
                      r="2.20703"
                      transform="rotate(-44.5 11.2461 3.12099)"
                      fill="#7A5AF8"
                    />
                    <circle
                      cx="18.6055"
                      cy="3.12099"
                      r="2.20703"
                      transform="rotate(-44.5 18.6055 3.12099)"
                      fill="#7A5AF8"
                    />
                  </svg>
                  {/* Показываем текущий выбранный статус на кнопке */}
                  {selectedStatus !== 'Все' && ` • ${selectedStatus}`}
                </button>

                {isLoading ? (
                  <div className={styles['loading']}>Загрузка закладок...</div>
                ) : bookmarks.length === 0 ? (
                  <div className={styles['empty-state']}>
                    <p>
                      {selectedStatus === 'Все'
                        ? 'У вас пока нет закладок'
                        : `Нет закладок в категории "${selectedStatus}"`}
                    </p>
                    <Link href="/catalog" className={styles['browse-link']}>
                      Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  <Cards mixClass={[styles['profile__cards']]} cards={bookmarkCards} />
                )}
              </div>
              <div>
                <div className={styles['profile__input-search-container']}>
                  <svg
                    className={styles['profile__input-search-img']}
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="#7A5AF8"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_114_272)">
                      <path
                        d="M27.6584 26.0085L20.6946 19.0447C22.5923 16.7237 23.5253 13.7621 23.3007 10.7725C23.0761 7.78286 21.711 4.99394 19.4878 2.9826C17.2645 0.971252 14.3533 -0.108636 11.3562 -0.0336988C8.35904 0.0412383 5.50539 1.26527 3.38545 3.38521C1.26551 5.50514 0.0414824 8.3588 -0.0334547 11.3559C-0.108392 14.353 0.971496 17.2643 2.98284 19.4875C4.99419 21.7107 7.7831 23.0759 10.7727 23.3005C13.7623 23.5251 16.7239 22.5921 19.0449 20.6943L26.0087 27.6582C26.2288 27.8707 26.5235 27.9883 26.8294 27.9856C27.1353 27.983 27.4279 27.8603 27.6442 27.6439C27.8605 27.4276 27.9832 27.135 27.9859 26.8291C27.9885 26.5232 27.8709 26.2285 27.6584 26.0085ZM11.6669 21C9.82094 21 8.01644 20.4526 6.48158 19.427C4.94672 18.4015 3.75044 16.9438 3.04402 15.2384C2.33761 13.5329 2.15278 11.6563 2.5129 9.84581C2.87303 8.03533 3.76195 6.37228 5.06724 5.06699C6.37253 3.7617 8.03557 2.87279 9.84606 2.51266C11.6565 2.15253 13.5332 2.33736 15.2386 3.04378C16.9441 3.7502 18.4017 4.94648 19.4273 6.48133C20.4528 8.01619 21.0002 9.8207 21.0002 11.6667C20.9975 14.1412 20.0132 16.5135 18.2635 18.2633C16.5138 20.013 14.1414 20.9972 11.6669 21Z"
                        fill="#7A5AF8"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_114_272">
                        <rect width="28" height="28" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <input type="text" placeholder={'Поиск закладок...'} className={styles['profile__input-search']} />
                </div>

                {isLoading ? (
                  <div className={styles['loading']}>Загрузка закладок...</div>
                ) : bookmarks.length === 0 ? (
                  <div className={styles['empty-state']}>
                    <p>У вас пока нет закладок</p>
                    <Link href="/catalog" className={styles['browse-link']}>
                      Перейти в каталог
                    </Link>
                  </div>
                ) : (
                  <Cards mixClass={[styles['profile__cards']]} cards={bookmarkCards} />
                )}
              </div>

              <button className={styles['tabs__public-btn']}>Опубликовать</button>
            </Tabs>
          </div>
        </section>

        <section className={styles['filtration']}>
          <ProfileFilters
            mixClass={[]}
            isOpen={isOpenFilters}
            onClose={handleCloseFiltersPopup}
            tabArray={['Все', 'Читаю', 'В планах', 'Прочитано', 'Брошено']}
            sortArray={[
              'по названию (А-Я)',
              'по дате добавления',
              'по дате обновления глав',
              'по дате чтения',
              'по количеству глав (по возрастанию)',
              'по количеству глав (по убыванию)',
              'по рейтингу',
              'по просмотрам',
              'по количеству лайков',
            ]}
            selectedTab={selectedStatus}
            onTabChange={handleStatusChange}
            onReset={handleResetFilters}
            showCreateTab={false}
          />
        </section>
      </div>
    </>
  );
};

export default ProfileReader;
