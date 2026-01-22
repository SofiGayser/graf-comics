'use client';
import { SearchSelect } from '@/components/UI';
import data from '@/data/data.json';
import { useActions, useAppSelector } from '@/hooks/redux';
import { FilterItem } from '@/types/filter.type';
import { FC } from 'react';
const { focus, genres, rating, tags } = data;
const genresData = genres.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);
const focusData = focus.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);
const tagsData = tags.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);
const ratingData = rating.map((v, i) => ({ colorClass: 'violet', text: v }) as FilterItem);

const NewComicsTags: FC = () => {
  const { focus, genres, rating, tags } = useAppSelector((state) => state.comics);
  const { toggleFilters } = useActions();

  return (
    <div className="comics-tags-section">
      <SearchSelect
        multiple={true}
        title="Выберите жанры"
        searchTitle="Поиск жанра"
        data={genresData}
        state={genres}
        toggleFilters={(el) => toggleFilters({ type: 'genres', element: el })}
      />
      <SearchSelect
        multiple={true}
        title="Выберите направленность"
        searchTitle="Поиск направленности"
        data={focusData}
        state={focus}
        toggleFilters={(el) => toggleFilters({ type: 'focus', element: el })}
      />
      <SearchSelect
        multiple={true}
        title="Выберите метки"
        searchTitle="Поиск метки"
        data={tagsData}
        state={tags}
        toggleFilters={(el) => toggleFilters({ type: 'tags', element: el })}
      />
      <SearchSelect
        multiple={false}
        title="Выберите рейтинг"
        searchTitle="Поиск рейтинга"
        data={ratingData}
        state={rating}
        toggleFilters={(el) => toggleFilters({ type: 'rating', element: el })}
      />
    </div>
  );
};

export default NewComicsTags;
