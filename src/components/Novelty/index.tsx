'use client';
import cn from 'classnames';
import { FC } from 'react';
import { Cards } from '../UI';
import BackLink from '../shared/BackLink';
import styles from './index.module.scss';

const Novelty: FC = () => {
  return (
    <div className={styles['novetly__container']}>
      <div className={'container'}>
        <BackLink mixClass={[styles['novelty__backLink']]} />
      </div>
      <div className={styles['novelty__container']}>
        <section className={cn(styles['novelty'], 'container')}>
          <div className={styles['novetly__cards-container']}>
            <Cards
              mixClass={[styles['novetly__cards']]}
              cards={[
                { id: '1', name: 'Название', type: 'new' },
                { id: '2', name: 'Название', type: 'new' },
                { id: '3', name: 'Название', type: 'new' },
                { id: '4', name: 'Название', type: 'new' },
                { id: '5', name: 'Название', type: 'new' },
                { id: '6', name: 'Название', type: 'new' },
                { id: '7', name: 'Название', type: 'new' },
                { id: '8', name: 'Название', type: 'new' },
                { id: '9', name: 'Название', type: 'new' },
                { id: '10', name: 'Название', type: 'new' },
                { id: '11', name: 'Название', type: 'new' },
                { id: '12', name: 'Название', type: 'new' },
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Novelty;
