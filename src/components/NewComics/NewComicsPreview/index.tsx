'use client';
import ComicsPreview from '@/components/ComicsPreview';
import { ctx } from '@/context/contextProvider';
import { useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import styles from './index.module.scss';

const NewComicsPreview: FC = () => {
  const comics = useAppSelector((state) => state.comics);
  const router = useRouter();
  const { setActiveLoader } = useContext(ctx);
  console.log(comics);
  const sendModerate = useCallback(async () => {
    setActiveLoader(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AXIOS_URL}/api/comics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comics),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании комикса');
      }

      toast.success('Комикс успешно отправлен на модерацию!');
      router.replace('/add-comics/final');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setActiveLoader(false);
    }
  }, [comics, router, setActiveLoader]);
  return (
    <>
      <p className={styles['preview-text']}>Предпросмотр</p>

      <ComicsPreview comics={comics} />
      <div className={styles['btns-container']}>
        <button onClick={() => router.back()} className={styles['btns-container__back-btn']}>
          Редактировать
        </button>
        <button onClick={sendModerate} className={styles['btns-container__next-btn']}>
          Опубликовать
        </button>
      </div>
    </>
  );
};

export default NewComicsPreview;
