'use client';

import { MixClass } from '@/types/mixClass.type';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';

type Props = {
  tabArray: string[];
  sortArray: string[];
  isOpen: boolean;
  onClose: () => void;
  // Новые опциональные пропсы для универсальности
  selectedTab?: string | null;
  selectedSort?: string | null;
  onTabChange?: (tab: string) => void;
  onSortChange?: (sort: string) => void;
  onApply?: (selectedTab: string | null, selectedSort: string | null) => void;
  onReset?: () => void;
  showCreateTab?: boolean;
  createTabText?: string;
  applyText?: string;
  resetText?: string;
} & MixClass;

const ProfileFilters: FC<Props> = ({
  tabArray,
  isOpen,
  onClose,
  sortArray,
  mixClass,
  // Новые пропсы
  selectedTab: externalSelectedTab,
  selectedSort: externalSelectedSort,
  onTabChange,
  onSortChange,
  onApply,
  onReset,
  showCreateTab = false,
  createTabText = 'Создать вкладку',
  applyText = 'Применить',
  resetText = 'Сбросить',
}) => {
  // Внутреннее состояние, если внешнее не передано
  const [internalSelectedTab, setInternalSelectedTab] = useState<string | null>(null);
  const [internalSelectedSort, setInternalSelectedSort] = useState<string | null>(null);

  // Используем внешнее состояние если передано, иначе внутреннее
  const selectedTab = externalSelectedTab !== undefined ? externalSelectedTab : internalSelectedTab;
  const selectedSort = externalSelectedSort !== undefined ? externalSelectedSort : internalSelectedSort;

  // Синхронизируем внутреннее состояние при изменении внешнего
  useEffect(() => {
    if (externalSelectedTab !== undefined) {
      setInternalSelectedTab(externalSelectedTab);
    }
  }, [externalSelectedTab]);

  useEffect(() => {
    if (externalSelectedSort !== undefined) {
      setInternalSelectedSort(externalSelectedSort);
    }
  }, [externalSelectedSort]);

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalSelectedTab(tab);
    }
  };

  const handleSortChange = (sortOption: string) => {
    if (onSortChange) {
      onSortChange(sortOption);
    } else {
      setInternalSelectedSort(sortOption);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedTab, selectedSort);
    }
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setInternalSelectedTab('Все');
      setInternalSelectedSort(null);
    }
  };

  return (
    <div>
      {isOpen && <div className={cn(styles['profile-filters__overlay'])} onClick={onClose}></div>}

      <div className={cn(styles['profile-filters'], { [styles.open]: isOpen }, ...mixClass)}>
        <button className={styles['profile-filters__close-popup-btn']} onClick={onClose}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.62891 4.2666L12.2698 12.8026" stroke="#7A5AF8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4.49219 12.6553L12.4053 4.41285" stroke="#7A5AF8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles['profile-filters__tabs-section']}>
          <p className={styles['profile-filters__tabs']}>Вкладки</p>
          <ul>
            {tabArray.map((tab, index) => (
              <li key={index}>
                <input
                  type="radio"
                  id={`tab-${index}`}
                  name="tabs"
                  checked={selectedTab === tab}
                  onChange={() => handleTabChange(tab)}
                />
                <label htmlFor={`tab-${index}`} className={styles['profile-filters__option-p']}>
                  {tab}
                </label>
              </li>
            ))}
          </ul>
          {showCreateTab && (
            <a href="#" className={styles['create-tab-link']}>
              {createTabText}
            </a>
          )}
        </div>

        <div className={styles['profile-filters__sort-section']}>
          <p className={styles['profile-filters__sort']}>Сортировать</p>
          <ul>
            {sortArray.map((sortOption, index) => (
              <li key={index}>
                <input
                  type="radio"
                  id={`sort-${index}`}
                  name="sort"
                  checked={selectedSort === sortOption}
                  onChange={() => handleSortChange(sortOption)}
                />
                <label htmlFor={`sort-${index}`} className={styles['profile-filters__option-p']}>
                  {sortOption}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles['profile-filters__action-buttons']}>
          <button
            className={`${styles['profile-filters__btn']} ${styles['profile-filters__btn--apply-btn']}`}
            onClick={handleApply}
          >
            {applyText}
          </button>
          <button
            className={`${styles['profile-filters__btn']} ${styles['profile-filters__btn--reset-btn']}`}
            onClick={handleReset}
          >
            {resetText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileFilters;
