export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  viewsCount: number;
  category?: ProductCategory;
  tags: ProductTag[];
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isMain: boolean;
}

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  sku?: string;
  price?: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface ShopFilters {
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface ShopResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    categories: ProductCategory[];
    tags: ProductTag[];
    minPrice: number;
    maxPrice: number;
  };
}
