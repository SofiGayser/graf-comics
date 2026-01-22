'use client';
import { AddComics } from '@/components/shared';
import { ctx } from '@/context/contextProvider';
import { useActions, useAppSelector } from '@/hooks/redux';
import { readFiles, readImageFile } from '@/utils/filereader';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { toast } from 'sonner';
import NewComicsTags from '../NewComicsTags';
import NewComicsToms from '../NewComicsToms';
import styles from './index.module.scss';

type FilterItem = {
  colorClass: string;
  text: string;
};

const NewComicsAllInOne: FC = () => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey) {
        setIsShiftPressed(true);
      }

      if (isShiftPressed && lastKeyPressed === 'c' && event.key === 's') {
        setLastKeyPressed('s');
      } else if (lastKeyPressed === 's' && event.key === 't') {
        alert('Satoshi and Niyar were here.');
        resetState();
      } else {
        resetState();
      }

      setLastKeyPressed(event.key);
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    const resetState = () => {
      setIsShiftPressed(false);
      setLastKeyPressed('');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isShiftPressed, lastKeyPressed]);

  const { addTitleDescription, addCover, addBanner } = useActions();
  const comics = useAppSelector((state) => state.comics);
  const { data: session } = useSession();
  const { setActiveLoader } = useContext(ctx);
  const router = useRouter();

  const cropperRef = useRef<CropperRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState('');

  // Легкий обработчик без генерации dataURL на каждом движении (ускоряет работу на слабых устройствах)
  const onCrop = useCallback(() => {
    // Ничего не делаем на каждый тик; итоговую картинку сгенерируем по кнопке "Добавить обложку"
  }, []);

  const handlerCropper = () => {
    setIsProcessing(true);
    try {
      const canvas = cropperRef.current?.getCanvas();
      if (canvas) {
        // Масштабируем до целевых размеров, чтобы убрать лишний вес и ускорить последующую работу
        const targetW = 960;
        const targetH = 1160;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = targetW;
        outCanvas.height = targetH;
        const ctx2d = outCanvas.getContext('2d');
        if (ctx2d) {
          ctx2d.imageSmoothingEnabled = true;
          ctx2d.imageSmoothingQuality = 'high';
          ctx2d.drawImage(canvas, 0, 0, targetW, targetH);
          const mime = format || 'image/jpeg';
          const dataUrl = outCanvas.toDataURL(mime, 0.85);
          addCover([dataUrl]);
          closeModal();
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addTitleDescription({
      title: e.target.value,
      description: comics.description,
      author: session?.user?.name || '',
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    addTitleDescription({
      title: comics.title,
      description: e.target.value,
      author: session?.user?.name || '',
    });
  };

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
        throw new Error('Ошибка публикации');
      }

      router.replace('/add-comics/final');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setActiveLoader(false);
    }
  }, [comics, router, setActiveLoader]);

  const isReadyToPublish =
    comics.title.trim() !== '' &&
    comics.description.trim() !== '' &&
    comics.covers.length > 0 &&
    comics.banner !== '' &&
    comics.genres.length > 0 &&
    comics.focus.length > 0 &&
    comics.tags.length > 0 &&
    comics.rating.length > 0 &&
    comics.toms.length > 0;

  return (
    <AddComics final={false}>
      <div className={styles.section}>
        <fieldset>
          <legend className="visuallyhidden">Название и описание</legend>

          <label className={styles.title} htmlFor="Title">
            Название
            <input
              className={styles.title__input}
              placeholder="Введите название"
              id="title"
              type="text"
              value={comics.title}
              onChange={handleTitleChange}
            />
          </label>

          <label className={styles.description} htmlFor="description">
            Описание
            <textarea
              value={comics.description}
              className={styles.description__input}
              placeholder="Придумайте описание"
              onChange={handleDescriptionChange}
              id="description"
              rows={4}
            />
          </label>
        </fieldset>

        <fieldset>
          <p className={styles['text-label']}>Обложка и дополнительные страницы</p>
          <div className={styles.imgs}>
            <label className={styles.cover} onClick={() => setIsModalOpen(true)}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1324_9631)">
                  <path d="M1 13H25" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M13 25L13 0.999999" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
                </g>
                <defs>
                  <clipPath id="clip0_1324_9631">
                    <rect width="26" height="26" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </label>
            <input
              type="file"
              id="covers"
              className={cn(styles.cover__input, 'myvisuallyhidden')}
              accept="image/png, image/jpeg"
              onChange={async (event) => {
                if (event.target.files && event.target.files.length > 0) {
                  const files = Array.from(event.target.files);
                  if (files.length > 4) {
                    toast.warning('Можно загрузить не более 4 изображений');
                    return;
                  }

                  const images = await readFiles(event.target.files);
                  addCover(images);
                }
              }}
              multiple
            />

            {comics.covers.map((cover, index) => (
              <div key={`cover-${index}`} className={styles['cover-img']}>
                <Image
                  width={83}
                  height={100}
                  className={styles['cover-img__item']}
                  src={cover || '/bg-default.svg'}
                  alt={`Обложка ${index + 1}`}
                />
              </div>
            ))}

            {comics.covers.length < 4 &&
              Array.from({ length: 4 - comics.covers.length }).map((_, i) => (
                <div key={`default-${i}`} className={styles['cover-img']}>
                  <Image
                    width={83}
                    height={100}
                    className={styles['cover-img__item']}
                    src="/bg-default.svg"
                    alt="Заглушка"
                  />
                </div>
              ))}
          </div>

          <p className={styles['text-label']}>Баннер(фон)</p>
          <label className={styles.banner} htmlFor="banner">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_1324_9631)">
                <path d="M1 13H25" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M13 25L13 0.999999" stroke="#7A5AF8" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              <defs>
                <clipPath id="clip0_1324_9631">
                  <rect width="26" height="26" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {comics.banner && <img className={styles['banner-img']} src={comics.banner} alt="Баннер комикса" />}
          </label>
          <input
            type="file"
            id="banner"
            className={cn(styles.cover__input, 'myvisuallyhidden')}
            accept="image/png, image/jpeg"
            onChange={async (event) => {
              if (event.target.files && event.target.files.length > 0) {
                const image = await readImageFile(event.target.files[0]);
                addBanner(image);
              }
            }}
          />
        </fieldset>
      </div>

      <NewComicsTags />

      <NewComicsToms />
      <div className={styles['view']}>
        <p className={styles['text-label']}>Тебе нужна помощь, найди помощника</p>
        <a href="#" className={styles['view__add-btn']}>
          Найти соавтора
        </a>
      </div>
      <div className={styles['viewDone']}>
        <button onClick={sendModerate} className={styles['done']} disabled={!isReadyToPublish}>
          Готово
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modal__content}>
            <span className={styles.close} onClick={closeModal}>
              &times;
            </span>
            <h1 className={styles.modal__text}>
              Добавьте изображение<span className={styles['modal__text--span']}> 960x1160 </span>
              <br />
              или отредактируйте изображение для вашей обложки
            </h1>
            <div className={styles.modal__add}>
              <label htmlFor="cropped" className={styles['modal__add--button']}>
                Выберите файл
              </label>
              <p className={styles['modal__add--text']}>Загрузить файл .png .jpeg</p>
            </div>

            {previewImage ? (
              <div className={styles.modal__wrapper}>
                <div className={styles.modal__preview}>
                  <Cropper
                    ref={cropperRef}
                    src={previewImage}
                    onChange={onCrop}
                    className={styles['modal__preview--photo']}
                    backgroundClassName="cropper-background"
                    stencilProps={{
                      aspectRatio: 960 / 1160,
                      grid: false,
                    }}
                  />
                </div>
                <button
                  onClick={handlerCropper}
                  disabled={isProcessing || !previewImage}
                  className={styles.modal__confirm}
                >
                  {isProcessing ? 'Обработка...' : 'Добавить обложку'}
                </button>
              </div>
            ) : (
              <div className={styles.modal__placeholder}>
                <p>Выберите изображение для редактирования</p>
              </div>
            )}
            <input
              type="file"
              id="cropped"
              className={cn(styles.cover__input, 'myvisuallyhidden')}
              onChange={(event) => {
                const files = event.target.files;
                if (files && files.length > 0) {
                  const imgFile = files[0];
                  setFormat(imgFile.type);
                  const imageUrl = URL.createObjectURL(imgFile);
                  setPreviewImage(imageUrl);
                }
              }}
              accept="image/png, image/jpeg"
            />
          </div>
        </div>
      )}
    </AddComics>
  );
};

export default NewComicsAllInOne;
