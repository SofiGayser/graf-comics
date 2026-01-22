'use client';

import { ShopFilters as ShopFiltersType } from '@/app/types/shop.types';
import { ActiveFilters, Filters } from '@/components/shared';
import { ctx } from '@/context/contextProvider';
import cn from 'classnames';
import { useContext, useEffect, useState } from 'react';
import ShopCard from '../shared/ShopCard';
import styles from './index.module.scss';

// Моковые данные для фильтров (можно заменить на запрос к API)
const productTypes = [
  'стикерпаки',
  'открытки',
  'футболки',
  'наклейки',
  'скетчбук',
  'плакаты',
  'комикс (мягкая обложка)',
  'комикс (твердая обложка)',
  'пины',
  'значки',
  'аксессуары',
  'брелки',
  'акриловые фигурки',
];

const authors = [
  'автор 1',
  'автор 2',
  'автор 3',
  'автор 4',
  'автор 5',
  'автор 6',
  'автор 7',
  'автор 8',
  'автор 9',
  'автор 10',
];

const sortOptions = ['по популярности', 'по новинкам', 'по возрастанию цены', 'по убыванию цены'];

const Shop = () => {
  const { activeFilters, toggleFilters } = useContext(ctx);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<ShopFiltersType>({
    sortBy: 'popularity',
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);

  // Загрузка товаров
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Формируем query параметры
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append('tag', tag));
      }
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.isNew) params.append('isNew', 'true');
      if (filters.isFeatured) params.append('isFeatured', 'true');
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/shop/products?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка категорий и тегов (можно сделать один раз при загрузке)
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchProducts();

    // Загрузка категорий
    fetch('/api/shop/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);

    // Загрузка тегов
    fetch('/api/shop/tags')
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  }, [filters]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilters((prev) => ({
        ...prev,
        search: searchValue,
        page: 1,
      }));
    }
  };

  const handleFilterChange = (filterType: keyof ShopFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
      page: 1, // Сбрасываем на первую страницу при изменении фильтров
    }));
  };

  const applyFilters = () => {
    // Конвертируем activeFilters в фильтры магазина
    const newFilters: Partial<ShopFiltersType> = {};

    activeFilters.forEach((filter) => {
      if (filter.colorClass === 'genres') {
        newFilters.category = filter.text;
      } else if (filter.colorClass === 'tags') {
        newFilters.tags = [...(newFilters.tags || []), filter.text];
      }
    });

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      sortBy: 'popularity',
      page: 1,
      limit: 12,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="shop">
      <div className={cn(styles['shop__container'], 'container')}>
        <label htmlFor="search" className={styles['shop__search-label']}>
          <input
            type="text"
            id="search"
            placeholder="Название товара, автор..."
            className={styles['shop__search-field']}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearch}
          />
        </label>

        <Filters
          filters={[
            {
              text: 'Вид',
              colorClass: 'genres',
              filters: categories.map((cat: any) => cat.name),
              filterType: 'default',
              isActive: false,
            },
            {
              text: 'Автор',
              colorClass: 'author',
              filters: authors,
              filterType: 'search',
              isActive: false,
            },
            {
              text: 'Сортировать',
              colorClass: 'author',
              filters: sortOptions,
              filterType: 'sort',
              isActive: false,
            },
          ]}
          mixClass={[styles['shop__filter']]}
          urlFilter={filters.category || ''}
        />

        <div className={styles['shop__cards-container']}>
          <ActiveFilters
            mixClass={[styles['shop__active-filters']]}
            filters={activeFilters}
            toggleFilters={toggleFilters}
            shortMode={false}
          />
          {loading ? (
            <div className={styles['shop__loading']}>
              <div className={styles['loader']}>Загрузка...</div>
            </div>
          ) : products.length === 0 ? (
            <div className={styles['shop__empty']}>
              <p>Товары не найдены</p>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <div className={styles['achievements__cards-container']}>
                {products.map((product: any) => (
                  <ShopCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      description: product.description,
                      price: product.price,
                      comparePrice: product.comparePrice,
                      images: product.images || [],
                      slug: product.slug || `product-${product.id}`,
                    }}
                  />
                ))}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className={styles['shop__pagination']}>
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    className={styles['shop__pagination-button']}
                  >
                    ←
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (filters.page! > 3) {
                        pageNum = filters.page! - 2 + i;
                      }
                      if (pageNum > totalPages) {
                        pageNum = totalPages - (4 - i);
                      }
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(styles['shop__pagination-button'], {
                          [styles['shop__pagination-button--active']]: filters.page === pageNum,
                        })}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === totalPages}
                    className={styles['shop__pagination-button']}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={styles['shop__start-btn']}
          aria-label="Наверх"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 7.79169L18 28.2084"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28.209 18L18.0007 7.79169L7.79232 18"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Shop;
