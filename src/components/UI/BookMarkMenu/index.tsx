'use client';
import { ctx } from '@/context/contextProvider';
import { useActions, useAppSelector } from '@/hooks/redux';
import cn from 'classnames';
import { FC, useContext, useState } from 'react';
import styles from './index.module.scss';

const BookMarkMenu: FC = () => {
  const { activeBookMarks, setActiveBookMarks, currentComicsId } = useContext(ctx);
  const { bookmarks } = useAppSelector((state) => state.user);
  const { addBookMark } = useActions();
  const [add, setAdd] = useState(false);
  const [addValue, setAddValue] = useState('');

  // Статусы для закладок
  const bookmarkStatuses = [
    { value: 'READING', label: 'Читаю' },
    { value: 'PLANNED', label: 'В планах' },
    { value: 'COMPLETED', label: 'Прочитано' },
    { value: 'DROPPED', label: 'Брошено' },
  ];

  // Функция для добавления/обновления закладки
  const handleAddBookmark = async (status: string) => {
    if (!currentComicsId) return;

    try {
      const response = await fetch(`/api/comics/${currentComicsId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        console.log(`Добавлено в "${status}"`);
        setActiveBookMarks(false);
        // Можно добавить уведомление об успехе
      } else {
        console.error('Ошибка при добавлении в закладки');
      }
    } catch (error) {
      console.error('Ошибка при добавлении в закладки:', error);
    }
  };

  // Функция для удаления закладки
  const handleRemoveBookmark = async () => {
    if (!currentComicsId) return;

    try {
      const response = await fetch(`/api/comics/${currentComicsId}/bookmark`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Удалено из избранного');
        setActiveBookMarks(false);
        // Можно добавить уведомление об успехе
      } else {
        console.error('Ошибка при удалении из закладок');
      }
    } catch (error) {
      console.error('Ошибка при удалении из закладок:', error);
    }
  };

  // Если comicsId не установлен, не показываем меню
  if (!currentComicsId) return null;

  return (
    <>
      {activeBookMarks && (
        <div className={styles['bg']} onClick={() => setActiveBookMarks(false)}>
          <div
            className={styles['bookmarkmenu']}
            onClick={(e) => {
              e.stopPropagation();
              setAdd(false);
            }}
          >
            <div className={styles['bookmarkmenu__container']}>
              <p className={styles['bookmarkmenu__title']}>Добавить в избранное</p>
              <button onClick={() => setActiveBookMarks(false)} className={styles['bookmarkmenu__close-btn']}>
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
            </div>

            <div className={styles['bookmarks']}>
              {/* Статусы закладок */}
              {bookmarkStatuses.map((status) => (
                <button
                  key={status.value}
                  className={styles['bookmarks__item']}
                  onClick={() => handleAddBookmark(status.value)}
                >
                  {status.label}
                </button>
              ))}

              {add ? (
                <div onClick={(e) => e.stopPropagation()} className={styles['bookmarks__container']}>
                  <input
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    className={styles['bookmarks__input']}
                    placeholder="Создать вкладку"
                    type="text"
                  />
                  <button
                    onClick={() => {
                      addBookMark(addValue);
                      setAddValue('');
                    }}
                    className={styles['add-btn']}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4.5H8" stroke="#7A5AF8" stroke-width="1.2" stroke-linecap="round" />
                      <path d="M4.5 8V1" stroke="#7A5AF8" stroke-width="1.2" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAdd(true);
                  }}
                  className={cn(styles['bookmarks__item'], styles['bookmarks__item--add'])}
                >
                  Создать вкладку
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5H8" stroke="#7A5AF8" stroke-width="1.2" stroke-linecap="round" />
                    <path d="M4.5 8V1" stroke="#7A5AF8" stroke-width="1.2" stroke-linecap="round" />
                  </svg>
                </button>
              )}

              <button
                className={cn(styles['bookmarks__item'], styles['bookmarks__item--remove'])}
                onClick={handleRemoveBookmark}
              >
                Удалить из избранного
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookMarkMenu;
