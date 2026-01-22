'use client';
import { ctx } from '@/context/contextProvider';
import { useComicsActions } from '@/hooks/useComicsActions';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { IChapter } from '../Chapter/types';
import ComicsFooter from '../ComicsFooter';
import ComicsHeader from '../ComicsHeader';
import ComicsPage from '../ComicsPage';
import CommentsSection from '../CommentsSection';
import { ChaptersButton } from '../UI';
import styles from './index.module.scss';

type Props = {
  imgs: string[];
  title: string;
  comicsId: string;
  initialLikes: string[];
  initialBookmarked: boolean;
};

const chapters: IChapter[] = [
  {
    chapterId: '5',
    timeCode: '00.00.00',
    images: [],
    isRead: false,
    title: 'глава 0',
    likes: 5,
  },
  {
    chapterId: '8',
    timeCode: '00.00.00',
    images: [],
    isRead: false,
    title: 'глава 1',
    likes: 5,
  },
  {
    chapterId: '4',
    timeCode: '00.00.00',
    images: [],
    isRead: false,
    title: 'глава 2',
    likes: 5,
  },
];

const Comics: FC<Props> = ({ imgs, title, comicsId, initialLikes, initialBookmarked }) => {
  const { visibleMenu } = useContext(ctx);
  const [currentPage, setCurrentPage] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [comicsStats, setComicsStats] = useState({
    views: 0,
    likes: initialLikes.length,
    bookmarks: 0,
  });

  const { likes, isLiked, isBookmarked, toggleLike, toggleBookmark, addComment, canInteract } = useComicsActions({
    comicsId,
    initialLikes,
    initialBookmarked,
  });

  // Более надежное отслеживание просмотра
  const trackView = useCallback(async () => {
    if (!comicsId || hasTrackedView) return;

    console.log('🔄 Tracking view for comics:', comicsId);

    try {
      const response = await fetch(`/api/comics/${comicsId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ View tracked successfully:', data);
        setHasTrackedView(true);

        // После успешного отслеживания обновляем статистику
        fetchComicsStats();
      } else {
        console.error('❌ View tracking failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error tracking view:', error);
    }
  }, [comicsId, hasTrackedView]);

  // Функция для загрузки статистики комикса
  const fetchComicsStats = async () => {
    try {
      const response = await fetch(`/api/comics/${comicsId}/stats`);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Stats loaded:', data);
        setComicsStats(data);
      } else {
        console.error('❌ Stats loading failed');
        // Fallback данные
        setComicsStats({
          views: 1250,
          likes: likes.length,
          bookmarks: 42,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching comics stats:', error);
      setComicsStats({
        views: 1250,
        likes: likes.length,
        bookmarks: 42,
      });
    }
  };

  // Первый useEffect - отслеживание просмотра
  useEffect(() => {
    if (comicsId) {
      const timer = setTimeout(() => {
        trackView();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [comicsId, trackView]);

  // Второй useEffect - загрузка статистики при изменении лайков
  useEffect(() => {
    if (comicsId) {
      fetchComicsStats();
    }
  }, [comicsId, likes.length]); // Обновляем при изменении количества лайков

  // Также отслеживаем когда пользователь начинает читать
  useEffect(() => {
    if (currentPage > 0 && !hasTrackedView) {
      trackView();
    }
  }, [currentPage, hasTrackedView, trackView]);

  const fetchCommentsCount = async () => {
    try {
      const response = await fetch(`/api/comics/${comicsId}/comments/count`);
      if (response.ok) {
        const data = await response.json();
        setCommentsCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching comments count:', error);
    }
  };

  const handleAddComment = async (text: string, replyId?: string) => {
    const comment = await addComment(text, replyId);
    if (comment) {
      fetchCommentsCount();
    }
    return comment;
  };

  useEffect(() => {
    if (comicsId) {
      fetchCommentsCount();
    }
  }, [comicsId]);

  const handleLikeClick = () => {
    if (!canInteract) {
      console.log('Please login to like');
      return;
    }
    toggleLike();
  };

  const handleBookmarkClick = () => {
    if (!canInteract) {
      console.log('Please login to bookmark');
      return;
    }
    toggleBookmark();
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
    window.scrollTo(0, 0);
  };

  const goToNextPage = () => {
    if (currentPage < imgs.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '1', 10);
          setCurrentPage(index + 1);
        }
      });
    }, options);

    const elements = containerRef.current?.querySelectorAll('[data-index]');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, [imgs]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  return (
    <>
      {isMobile ? (
        <>
          {visibleMenu && <ComicsHeader title={title} />}
          <div className={styles['comics']} ref={containerRef}>
            {imgs.map((url, i) => (
              <ComicsPage key={i} index={i} image={url} />
            ))}
          </div>
          {visibleMenu && (
            <>
              <ComicsFooter
                currentPage={currentPage}
                maxPage={imgs.length}
                onLike={handleLikeClick}
                onBookmark={handleBookmarkClick}
                onComment={() => setShowComments(true)}
                isLiked={isLiked}
                isBookmarked={isBookmarked}
                likesCount={likes.length}
                commentsCount={commentsCount}
              />
              {showComments && (
                <CommentsSection
                  comicsId={comicsId}
                  onAddComment={handleAddComment}
                  onClose={() => setShowComments(false)}
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className={styles['comics-pc']} ref={containerRef}>
            <div className="">
              <div className={styles['comics-pc__slideView']}>
                <h1 className={styles['comics-pc__slidePage']} onClick={goToPreviousPage}>
                  &lt;
                </h1>
                <h1 className={styles['comics-pc__slideText']}>
                  {currentPage + 1} - {imgs.length}
                </h1>
                <h1 className={styles['comics-pc__slidePage']} onClick={goToNextPage}>
                  &gt;
                </h1>
              </div>
              <div className="">
                <div className={styles['comics-pc__button']}>
                  <ChaptersButton chapters={chapters} />

                  {/* Кнопка комментариев */}
                  <h1 className={styles['buttons__item']} onClick={() => setShowComments(true)}>
                    <svg width="auto" height="auto" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  </h1>
                  <p>{commentsCount}</p>

                  {/* Кнопка лайка */}
                  <h1
                    className={`${styles['buttons__item']} ${isLiked ? styles['buttons__item--active'] : ''}`}
                    onClick={handleLikeClick}
                  >
                    <svg width="auto" height="auto" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39465C21.7563 5.72719 21.351 5.12083 20.84 4.61Z"
                        stroke="#7A5AF8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={isLiked ? '#7A5AF8' : 'none'}
                      />
                    </svg>
                  </h1>
                  <p>{likes.length}</p>

                  {/* Кнопка закладки */}
                  <h1
                    className={`${styles['buttons__item']} ${isBookmarked ? styles['buttons__item--active'] : ''}`}
                    onClick={handleBookmarkClick}
                  >
                    <svg width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                        stroke="#7A5AF8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill={isBookmarked ? '#7A5AF8' : 'none'}
                      />
                    </svg>
                  </h1>
                </div>
                <div className={styles['comics-pc__pages']}>
                  <ComicsPage index={currentPage} image={imgs[currentPage]} className={styles['comics-pc__page']} />
                  <div className={styles['comics-pc__slide']}>
                    <div className={styles['comics-pc__slide--back']} onClick={goToPreviousPage}></div>
                    <div className={styles['comics-pc__slide--next']} onClick={goToNextPage}></div>
                  </div>
                </div>
              </div>
              <div className={styles['comics-pc__slideView']}>
                <h1 className={styles['comics-pc__slidePage']} onClick={goToPreviousPage}>
                  &lt;
                </h1>
                <h1 className={styles['comics-pc__slideText']}>
                  {currentPage + 1} - {imgs.length}
                </h1>
                <h1 className={styles['comics-pc__slidePage']} onClick={goToNextPage}>
                  &gt;
                </h1>
              </div>
            </div>
          </div>

          {showComments && (
            <CommentsSection
              comicsId={comicsId}
              onAddComment={handleAddComment}
              onClose={() => setShowComments(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Comics;
