'use client';
import cn from 'classnames';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import type { MixClass } from '../../../types/mixClass.type';
import styles from './index.module.scss';

type Props = {
  tabs: string[];
  children: React.ReactNode;
} & MixClass;

type ScrollActive = {
  left: number;
  width: number;
};

const TabsAuthorship: FC<Props> = ({ tabs, children, mixClass }) => {
  const [numActive, setNumActive] = useState<number>(0);
  const [scrollActive, setScrollActive] = useState<ScrollActive>({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver>();

  const updateIndicator = useCallback((index: number) => {
    if (!tabsRef.current) return;

    const buttons = tabsRef.current.querySelectorAll(`.${styles['btns__item']}`);
    if (index >= buttons.length) return;

    const button = buttons[index] as HTMLElement;
    setScrollActive({
      left: button.offsetLeft,
      width: button.offsetWidth,
    });
  }, []);

  useEffect(() => {
    updateIndicator(numActive);
  }, [numActive, updateIndicator]);

  useEffect(() => {
    if (!tabsRef.current) return;

    const handleResize = () => updateIndicator(numActive);
    observerRef.current = new ResizeObserver(handleResize);

    const buttons = tabsRef.current.querySelectorAll(`.${styles['btns__item']}`);
    buttons.forEach((btn) => observerRef.current?.observe(btn));

    return () => {
      buttons.forEach((btn) => observerRef.current?.unobserve(btn));
      observerRef.current?.disconnect();
    };
  }, [numActive, updateIndicator]);

  const changeActive = (index: number) => {
    setNumActive(index);
  };

  return (
    <div className={styles.tabs}>
      <div className={cn(styles['tabs__scroller'], ...mixClass)} ref={tabsRef}>
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
          <span
            style={{
              left: `${scrollActive.left}px`,
              width: `${scrollActive.width}px`,
            }}
            className={styles['tabs__active']}
          ></span>
        </div>
      </div>

      <div className={styles['tabs__content-wrapper']}>
        <div className={styles['tabs__content']}>{children[numActive]}</div>
      </div>
    </div>
  );
};

export default TabsAuthorship;
