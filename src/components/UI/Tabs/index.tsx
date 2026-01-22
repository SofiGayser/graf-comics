'use client';
import cn from 'classnames';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import type { MixClass } from '../../../types/mixClass.type';
import styles from './index.module.scss';

type Props = {
  tabs: string[];
  children: React.ReactNode;
} & MixClass;

const Tabs: FC<Props> = ({ tabs, children, mixClass }) => {
  const [numActive, setNumActive] = useState<number>(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<ResizeObserver>();

  // Обновление позиции индикатора
  const updateIndicatorPosition = useCallback(() => {
    if (!tabsContainerRef.current || numActive >= tabs.length) return;

    const buttons = tabsContainerRef.current.querySelectorAll(`.${styles['btns__item']}`);
    if (buttons.length === 0) return;

    const activeButton = buttons[numActive] as HTMLElement;
    const containerRect = tabsContainerRef.current.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const left = buttonRect.left - containerRect.left;
    const width = buttonRect.width;

    if (indicatorRef.current) {
      indicatorRef.current.style.left = `${left}px`;
      indicatorRef.current.style.width = `${width}px`;
    }
  }, [numActive, tabs.length]);

  // Обработчик смены вкладки
  const changeActive = (index: number) => {
    setNumActive(index);
  };

  // Инициализация и обновление при изменениях
  useEffect(() => {
    updateIndicatorPosition();

    // Наблюдатель за изменениями размеров
    const resizeObserver = new ResizeObserver(() => {
      updateIndicatorPosition();
    });

    if (tabsContainerRef.current) {
      resizeObserver.observe(tabsContainerRef.current);
      tabsContainerRef.current.querySelectorAll(`.${styles['btns__item']}`).forEach((btn) => {
        resizeObserver.observe(btn);
      });
    }

    observerRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
    };
  }, [numActive, tabs, updateIndicatorPosition]);

  return (
    <div className={'tabs'}>
      <div ref={tabsContainerRef} className={cn(styles['tabs__scroller'], ...mixClass)}>
        <div className={cn(styles['tabs__btns'], styles['btns'])}>
          {tabs.map((value, index) => (
            <button
              onClick={() => changeActive(index)}
              key={index}
              type="button"
              className={cn(styles['btns__item'], {
                [styles['btns__item--active']]: numActive === index,
              })}
            >
              {value}
            </button>
          ))}
        </div>
        <span ref={indicatorRef} className={styles['tabs__active']}></span>
      </div>

      <div className={styles['tabs__content']}>{children[numActive]}</div>
    </div>
  );
};

export default Tabs;
