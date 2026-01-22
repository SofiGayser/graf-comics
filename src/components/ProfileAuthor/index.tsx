'use client';
import data from '@/data/data.json';
import cn from 'classnames';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC, useState } from 'react';
import Post from '../Post';
import { Cards, Tabs } from '../UI';
import { Filters, Stats } from '../shared';
import styles from './index.module.scss';
const { sort, tabs } = data;

const ProfileAuthor: FC = () => {
  const gifts = [
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
    <div className={styles['gifts__item']}>
      <img src="./gifts.png" className={styles['gifts__item-wall']} />
      <p className={styles['gifts__item-name']}>Название</p>
    </div>,
  ];

  const searchParams = useSearchParams();

  const [opened, setOpened] = useState<boolean>(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const togglePopup = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const text = opened ? 'Скрыть' : 'Показать всё';

  return (
    <>
      <section className={styles['profile-header']}>
        <div className={styles['profile__wallpaper']}>
          <img src="./profile-skeleton.svg" alt="avatar" className={styles['profile__img']} />
        </div>
        <div className={cn(styles['profile__container'], 'container')}>
          <p className={styles['profile__name']}>Никнейм</p>
          <p className={styles['profile__status']}>Статус</p>
          <div>
            <button className={styles['profile__details-btn']} onClick={togglePopup}>
              <p className={styles['profile__details']}>
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
            </button>
            {isInfoOpen && (
              <div className={styles['modal']} onClick={togglePopup}>
                <div className={styles['modal__cnt']} onClick={(e) => e.stopPropagation()}>
                  <button onClick={togglePopup} className={styles['modal__close']}>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.63086 4.37109L12.2718 12.2842"
                        stroke="#7A5AF8"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <path
                        d="M4.49512 12.1475L12.4082 4.50656"
                        stroke="#7A5AF8"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <h2 className={styles['modal__more']}>Подробнее</h2>
                  <p className={styles['modal__subtitle']}>Основная информация</p>
                  <div className={styles['modal__items']}>
                    <p className={styles['modal__item']}>Никнейм: Имя</p>
                    <p className={styles['modal__item']}>Статус: статус</p>
                    <p className={styles['modal__item']}>Рейтинг: 0.00</p>
                    <p className={styles['modal__item']}>0 подписчиков</p>
                    <p className={styles['modal__item']}>0 подписок</p>
                    <p className={styles['modal__item']}>0 комментариев</p>
                    <p className={styles['modal__item']}>0 тайтлов</p>
                  </div>
                  <p className={styles['modal__subtitle']}>Личная информация</p>

                  <div className={styles['modal__items']}>
                    <p className={styles['modal__item']}>Пол: м/ж</p>
                    <p className={styles['modal__item']}>Дата рождения: 00.00.0000</p>
                    <p className={styles['modal__item']}>Город: Название города</p>
                  </div>
                  <p className={styles['modal__subtitle']}>Ссылки</p>
                  <div className={styles['modal__items']}>
                    <Link href="/" className={styles['modal__link']}>
                      Ссылка
                    </Link>
                    <Link href="/" className={styles['modal__link']}>
                      Ссылка
                    </Link>
                    <Link href="/" className={styles['modal__link']}>
                      Ссылка
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className={styles['profile__support-btn']}>Поддержать</button>
          <Stats
            mixClass={[styles['profile__stats']]}
            stats={[
              {
                name: 'Тайтлы',
                count: 0,
              },
              {
                name: 'Подписчики',
                count: 0,
              },
              {
                name: 'Лайки',
                count: 0,
              },
            ]}
          />
        </div>
      </section>
      <section className={styles['gifts']}>
        <div className={cn(styles['gifts__container'], 'container')}>
          <header className={styles['gifts__header']}>
            <button onClick={() => setOpened(!opened)} className={styles['gifts__btn']}>
              {text}
            </button>
          </header>

          <div
            className={cn(styles['gifts__items'], {
              [styles['gifts__items--all']]: opened,
            })}
          >
            {gifts}
          </div>
        </div>
      </section>
      <section className={styles['tabs']}>
        <div className={cn(styles['tabs__container'], 'container')}>
          <Tabs mixClass={[styles['tabs__items']]} tabs={['Записи', 'Избранное', 'Закладки', 'Тайтлы']}>
            <div className="posts">
              <div className={styles['post']}>
                <div className={styles['post__text']}>
                  <textarea placeholder="Что у вас нового?" className={styles['post__text-field']} />
                  <label htmlFor="attach-image" className={styles['post__icon-btn']}>
                    <img src="./attachment_icon.svg" />
                  </label>

                  <input
                    type="file"
                    className={cn('myvisuallyhidden')}
                    accept="image/png, image/jpeg"
                    multiple
                    name="myImage"
                    id="attach-image"
                  />
                </div>

                <div className={styles['post__btn-cont']}>
                  <button className={styles['post__reset']}>Сбросить</button>
                  <button className={styles['post__send-btn']}>Опубликовать</button>
                </div>
              </div>
              <Post />
            </div>

            <>
              <div className={styles['filter']}>
                <Filters
                  filters={[
                    { text: 'Вкладки', colorClass: 'author', filters: tabs, filterType: 'default', isActive: false },
                    { text: 'Сортировать', colorClass: 'author', filters: sort, filterType: 'sort', isActive: false },
                  ]}
                  mixClass={[styles['catalog__filter']]}
                />
              </div>
              <label htmlFor="search" className={styles['tabs__search-label']}>
                <input
                  type="text"
                  id="search"
                  placeholder="Название, автор, персонаж..."
                  className={styles['tabs__search-field']}
                />
              </label>
              <Cards
                mixClass={[]}
                cards={[
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                  { id: '1', name: 'Избранное' },
                ]}
              />
            </>
            <>
              <div className={styles['filter']}>
                <Filters
                  filters={[
                    { text: 'Вкладки', colorClass: 'author', filters: tabs, filterType: 'default', isActive: false },
                    { text: 'Сортировать', colorClass: 'author', filters: sort, filterType: 'sort', isActive: false },
                  ]}
                  mixClass={[styles['catalog__filter']]}
                />
              </div>
              <label htmlFor="search" className={styles['tabs__search-label']}>
                <input
                  type="text"
                  id="search"
                  placeholder="Название, автор, персонаж..."
                  className={styles['tabs__search-field']}
                />
              </label>
              <Cards
                mixClass={[]}
                cards={[
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                  { id: '1', name: 'Закладки' },
                ]}
              />
            </>
            <>
              <div className={styles['filter']}>
                <Filters
                  filters={[
                    { text: 'Вкладки', colorClass: 'author', filters: tabs, filterType: 'default', isActive: false },
                    { text: 'Сортировать', colorClass: 'author', filters: sort, filterType: 'sort', isActive: false },
                  ]}
                  mixClass={[styles['catalog__filter']]}
                />
              </div>
              <label htmlFor="search" className={styles['tabs__search-label']}>
                <input
                  type="text"
                  id="search"
                  placeholder="Название, автор, персонаж..."
                  className={styles['tabs__search-field']}
                />
              </label>
              <button className={styles['tabs__public-btn']}>Опубликовать</button>
              <Cards
                mixClass={[]}
                cards={[
                  { id: '1', name: 'Название', type: 'moder' },
                  { id: '1', name: 'Название', type: 'edit' },
                  { id: '1', name: 'Название', type: 'new' },
                  { id: '1', name: 'Название' },
                  { id: '1', name: 'Название' },
                  { id: '1', name: 'Название' },
                  { id: '1', name: 'Название' },
                  { id: '1', name: 'Название' },
                  { id: '1', name: 'Название' },
                ]}
              />
            </>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default ProfileAuthor;
