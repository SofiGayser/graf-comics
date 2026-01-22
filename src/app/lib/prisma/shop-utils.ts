// Генерация slug для товаров
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Форматирование цены
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Расчет скидки
export function calculateDiscount(price: number, comparePrice?: number): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// Фильтр товаров для клиента
export function filterProducts(products: any[], filters: any) {
  return products.filter((product) => {
    // Фильтр по категории
    if (filters.category && product.category?.slug !== filters.category) {
      return false;
    }

    // Фильтр по тегам
    if (filters.tags && filters.tags.length > 0) {
      const productTags = product.tags.map((tag: any) => tag.slug);
      if (!filters.tags.some((tag: string) => productTags.includes(tag))) {
        return false;
      }
    }

    // Фильтр по цене
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }

    // Фильтр по наличию
    if (filters.inStock && product.quantity <= 0) {
      return false;
    }

    // Фильтр по новинкам
    if (filters.isNew && !product.isNew) {
      return false;
    }

    // Фильтр по рекомендуемым
    if (filters.isFeatured && !product.isFeatured) {
      return false;
    }

    return true;
  });
}

// Сортировка товаров
export function sortProducts(products: any[], sortBy: string) {
  const sorted = [...products];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popularity':
    default:
      return sorted.sort((a, b) => b.viewsCount - a.viewsCount);
  }
}
