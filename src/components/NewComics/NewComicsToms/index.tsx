'use client';
import Tom from '@/components/Tom';
import { useActions, useAppSelector } from '@/hooks/redux';
import { FC } from 'react';
import styles from './index.module.scss';

const NewComicsToms: FC = () => {
  const { addTom, removeTom } = useActions();
  const { toms } = useAppSelector((state) => state.comics);

  return (
    <div className="comics-toms-section">
      <div className={styles['btns__add']}>
        <p className={styles.title}>Добавьте главы и загрузите файлы</p>
        <div className={styles.btns}>
          <button onClick={() => addTom()} className={styles['btns__add-btn']}>
            Добавить том
          </button>
          <button onClick={() => removeTom()} className={styles['btns__remove-btn']}>
            Удалить том
          </button>
        </div>
      </div>
      <div className={styles['toms']}>
        {toms.map((el) => (
          <Tom tom={el} />
        ))}
      </div>
    </div>
  );
};

export default NewComicsToms;
