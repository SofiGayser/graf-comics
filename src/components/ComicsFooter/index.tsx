import cn from 'classnames';
import { FC } from 'react';
import { Progress } from '../UI';
import styles from './index.module.scss';

interface ComicsFooterProps {
  currentPage: number;
  maxPage: number;
  onLike: () => void;
  onBookmark: () => void;
  onComment: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  commentsCount: number; // Добавьте это
}

const ComicsFooter: FC<ComicsFooterProps> = ({
  currentPage,
  maxPage,
  onLike,
  onBookmark,
  onComment,
  isLiked,
  isBookmarked,
  likesCount,
}) => {
  return (
    <div className={cn('container', styles['comics-footer'])}>
      <div className="progress-container">
        <p className={styles['progress-container__text']}>
          Страниц {currentPage} из {maxPage}
        </p>
        <Progress value={currentPage} maxValue={maxPage} />
      </div>
      <div className={styles['buttons']}>
        {/* Кнопка закладки */}
        <button
          className={`${styles['buttons__item']} ${isBookmarked ? styles['buttons__item--active'] : ''}`}
          onClick={onBookmark}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 4H10C8.89543 4 8 4.89543 8 6V31L17 26.5L26 31V6C26 4.89543 25.1046 4 24 4Z"
              stroke="#EE46BC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Кнопка комментариев */}
        <button className={styles['buttons__item']} onClick={onComment}>
          <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17 29.7499C24.0416 29.7499 29.75 24.0416 29.75 16.9999C29.75 9.95831 24.0416 4.24994 17 4.24994C9.95837 4.24994 4.25 9.95831 4.25 16.9999C4.25 19.1074 4.76132 21.0955 5.66667 22.8468L4.25 29.7499L11.1531 28.3333C12.9045 29.2386 14.8925 29.7499 17 29.7499Z"
              stroke="#7A5AF8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10 13.9999L23 13.9999" stroke="#7A5AF8" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 17.9999H14H18" stroke="#7A5AF8" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 21.9999H15H20" stroke="#7A5AF8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Кнопка лайка с счетчиком */}
        <button
          onClick={onLike}
          className={`${styles['buttons__item']} ${isLiked ? styles['buttons__item--active'] : ''}`}
        >
          <svg width="34" height="34" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39465C21.7563 5.72719 21.351 5.12083 20.84 4.61Z"
              stroke="#7A5AF8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isLiked ? '#7A5AF8' : 'none'}
            />
          </svg>
          {likesCount > 0 && <span className={styles['buttons__count']}>{likesCount}</span>}
        </button>
      </div>
    </div>
  );
};

export default ComicsFooter;
