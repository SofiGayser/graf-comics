'use client';
import { FilterItem } from '@/types/filter.type';
import React, { FC, useMemo, useState } from 'react';

interface IContext {
  activeLoader: boolean;
  setActiveLoader: React.Dispatch<React.SetStateAction<boolean>>;

  activeBurger: boolean;
  setActiveBurger: React.Dispatch<React.SetStateAction<boolean>>;

  activeAvatar: boolean;
  setActiveAvatar: React.Dispatch<React.SetStateAction<boolean>>;

  activeModal: boolean;
  setActiveModal: React.Dispatch<React.SetStateAction<boolean>>;

  activeFilters: FilterItem[];
  setFilters: React.Dispatch<React.SetStateAction<FilterItem[]>>;

  visibleMenu: boolean;
  setVisibleMenu: React.Dispatch<React.SetStateAction<boolean>>;

  toggleFilters: (val: FilterItem) => void;

  activeBookMarks: boolean;
  setActiveBookMarks: React.Dispatch<React.SetStateAction<boolean>>;

  currentComicsId: string | null;
  setCurrentComicsId: React.Dispatch<React.SetStateAction<string | null>>;

  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

export const ctx = React.createContext<IContext>({} as IContext);

type Props = {
  children: React.ReactNode;
};

const ContextProvider: FC<Props> = ({ children }) => {
  // loader сайта
  const [activeLoader, setActiveLoader] = useState<boolean>(false);

  // burger меню
  const [activeBurger, setActiveBurger] = useState<boolean>(false);

  // модалка авторизации/регистрации
  const [activeModal, setActiveModal] = useState<boolean>(false);

  // правое боковое меню под телефоны
  const [activeAvatar, setActiveAvatar] = useState<boolean>(false);

  // примененные фильтры
  const [activeFilters, setFilters] = useState<FilterItem[]>([]);

  // видимость меню в режиме чтения
  const [visibleMenu, setVisibleMenu] = useState<boolean>(true);

  // меню закладок
  const [activeBookMarks, setActiveBookMarks] = useState<boolean>(false);

  // текущий comicsId для закладок
  const [currentComicsId, setCurrentComicsId] = useState<string | null>(null);

  // тема
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleFilters = (val: FilterItem) => {
    const ind = activeFilters.findIndex((e) => e.text === val.text);
    if (ind === -1) {
      setFilters((prev) => [val, ...prev]);
    } else {
      setFilters((prev) => prev.filter((el) => el.text !== val.text));
    }
  };

  const obj = useMemo(
    () => ({
      activeLoader,
      setActiveLoader,
      activeBurger,
      setActiveBurger,
      activeModal,
      setActiveModal,
      activeAvatar,
      setActiveAvatar,
      activeFilters,
      setFilters,
      visibleMenu,
      setVisibleMenu,
      toggleFilters,
      activeBookMarks,
      setActiveBookMarks,
      currentComicsId,
      setCurrentComicsId,
      theme,
      setTheme,
    }),
    [
      activeLoader,
      activeBurger,
      activeModal,
      activeAvatar,
      activeFilters,
      visibleMenu,
      activeBookMarks,
      currentComicsId,
      theme,
    ],
  );

  return <ctx.Provider value={obj}>{children}</ctx.Provider>;
};

export default ContextProvider;
