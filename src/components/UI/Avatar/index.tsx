'use client';
import { useGetUserByIdQuery } from '@/store/api';
import { useSession } from 'next-auth/react';
import { FC, useMemo, useState } from 'react';
import styles from './index.module.scss';

const Avatar: FC = () => {
  const { status, data } = useSession();

  const { avatar } = useGetUserByIdQuery(data?.user?.id, {
    selectFromResult: ({ data }) => ({ avatar: data?.avatar }),
    skip: status !== 'authenticated',
  });

  const [imgError, setImgError] = useState(false);

  const letter = useMemo(() => {
    const name = data?.user?.name?.trim();
    return name && name.length > 0 ? name[0].toUpperCase() : '?';
  }, [data?.user?.name]);

  if (status === 'loading') {
    return (
      <>
        <div className={styles['loader']}>
          <span className={styles['loader__round']}></span>
        </div>
      </>
    );
  }

  const canShowImage = Boolean(avatar) && !imgError;
  const src = canShowImage ? (avatar!.includes('https') ? avatar! : `data:image/jpeg;base64,${avatar}`) : undefined;

  return (
    <>
      {canShowImage ? (
        <img alt="аватарка пользователя" className={styles['avatar']} src={src} onError={() => setImgError(true)} />
      ) : (
        <div
          className={styles['fallback']}
          aria-label={`Аватар: ${letter}`}
          role="img"
          title={data?.user?.name || 'Пользователь'}
        >
          <span className={styles['fallback__letter']}>{letter}</span>
        </div>
      )}
    </>
  );
};
export default Avatar;
