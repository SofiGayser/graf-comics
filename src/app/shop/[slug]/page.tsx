'use client';

import cn from 'classnames';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';
interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  category?: {
    name: string;
  };
  tags: Array<{ name: string }>;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  specifications: Array<{
    key: string;
    value: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    value: string;
    price?: number;
    quantity: number;
  }>;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  // Загрузка товара
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/shop/products/${slug}`);

        if (!response.ok) {
          throw new Error('Товар не найден');
        }

        const data = await response.json();
        setProduct(data);

        // Найти главное изображение или первое
        const mainImageIndex = data.images.findIndex((img: any) => img.isMain) || 0;
        setSelectedImageIndex(mainImageIndex);

        // Проверяем наличие товара в корзине
        checkCartStatus(data.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const checkCartStatus = async (productId: string) => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        const cartItem = data.items?.find(
          (item: any) => item.productId === productId && (!selectedVariant || item.variantId === selectedVariant),
        );
        if (cartItem) {
          setIsInCart(true);
          setCartQuantity(cartItem.quantity);
        } else {
          setIsInCart(false);
          setCartQuantity(0);
        }
      }
    } catch (error) {
      console.error('Error checking cart status:', error);
    }
  };
  // Обработчики
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(value, product?.quantity || 1));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.id,
          variantId: selectedVariant,
          quantity: quantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsInCart(true);
        setCartQuantity(quantity);
        alert(`Товар "${product?.title}" добавлен в корзину!`);
      } else {
        alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Ошибка при добавлении в корзину');
    }
  };
  const handleGoToCart = () => {
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}>Загрузка товара...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.error}>
        <h2>Товар не найден</h2>
        <p>{error || 'Произошла ошибка при загрузке товара'}</p>
      </div>
    );
  }

  const selectedImage = product.images[selectedImageIndex];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className={styles.productPage}>
      <div className={cn(styles.productContainer, 'container')}>
        {/* Основной контейнер товара */}
        <div className={styles.productContent}>
          {/* Левая часть - информация о товаре */}
          <div className={styles.productInfo}>
            {/* Бейдж NEW */}
            {product.tags.some((tag) => tag.name === 'Новинка') && <div className={styles.newBadge}>New</div>}

            {/* Название товара */}
            <h1 className={styles.productTitle}>{product.title}</h1>

            {/* Описание товара */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Описание товара</h2>
              <div className={styles.description}>
                {product.description.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>

            {/* Характеристики товара */}
            {product.specifications.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Характеристики товара</h2>
                <div className={styles.specifications}>
                  {product.specifications.map((spec, index) => (
                    <div key={index} className={styles.specRow}>
                      <span className={styles.specKey}>{spec.key}</span>
                      <span className={styles.specValue}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{product.variants[0].name}</h2>
                <div className={styles.variants}>
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={cn(styles.variantBtn, {
                        [styles.variantBtnActive]: selectedVariant === variant.id,
                        [styles.variantBtnDisabled]: variant.quantity === 0,
                      })}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.quantity === 0}
                    >
                      {variant.value}
                      {variant.quantity === 0 && <span className={styles.outOfStock}>Нет в наличии</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Цена и кнопки */}
            <div className={styles.priceSection}>
              <div className={styles.priceContainer}>
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>
                    {(product.price * quantity).toLocaleString('ru-RU')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                      <circle cx="12.5" cy="12.5" r="12.5" fill="#CABDFC" />
                      <path
                        d="M13.036 17.108C12.244 17.108 11.518 16.928 10.858 16.568C10.21 16.196 9.68804 15.65 9.29204 14.93C8.90804 14.21 8.71604 13.31 8.71604 12.23C8.71604 11.15 8.90204 10.25 9.27404 9.53C9.65804 8.81 10.174 8.27 10.822 7.91C11.482 7.55 12.22 7.37 13.036 7.37C13.972 7.37 14.8 7.574 15.52 7.982C16.24 8.39 16.81 8.96 17.23 9.692C17.65 10.412 17.86 11.258 17.86 12.23C17.86 13.202 17.65 14.054 17.23 14.786C16.81 15.518 16.24 16.088 15.52 16.496C14.8 16.904 13.972 17.108 13.036 17.108ZM7.97804 20.492V7.46H9.63404V10.034L9.52604 12.248L9.70604 14.462V20.492H7.97804ZM12.892 15.596C13.504 15.596 14.05 15.458 14.53 15.182C15.022 14.906 15.406 14.516 15.682 14.012C15.97 13.496 16.114 12.902 16.114 12.23C16.114 11.546 15.97 10.958 15.682 10.466C15.406 9.962 15.022 9.572 14.53 9.296C14.05 9.02 13.504 8.882 12.892 8.882C12.292 8.882 11.746 9.02 11.254 9.296C10.774 9.572 10.39 9.962 10.102 10.466C9.82604 10.958 9.68804 11.546 9.68804 12.23C9.68804 12.902 9.82604 13.496 10.102 14.012C10.39 14.516 10.774 14.906 11.254 15.182C11.746 15.458 12.292 15.596 12.892 15.596Z"
                        fill="#F2EFFE"
                      />
                    </svg>
                  </span>

                  {product.comparePrice && (
                    <span className={styles.oldPrice}>
                      {(product.comparePrice * quantity).toLocaleString('ru-RU')}{' '}
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <circle cx="12.5" cy="12.5" r="12.5" fill="#CABDFC" />
                        <path
                          d="M13.036 17.108C12.244 17.108 11.518 16.928 10.858 16.568C10.21 16.196 9.68804 15.65 9.29204 14.93C8.90804 14.21 8.71604 13.31 8.71604 12.23C8.71604 11.15 8.90204 10.25 9.27404 9.53C9.65804 8.81 10.174 8.27 10.822 7.91C11.482 7.55 12.22 7.37 13.036 7.37C13.972 7.37 14.8 7.574 15.52 7.982C16.24 8.39 16.81 8.96 17.23 9.692C17.65 10.412 17.86 11.258 17.86 12.23C17.86 13.202 17.65 14.054 17.23 14.786C16.81 15.518 16.24 16.088 15.52 16.496C14.8 16.904 13.972 17.108 13.036 17.108ZM7.97804 20.492V7.46H9.63404V10.034L9.52604 12.248L9.70604 14.462V20.492H7.97804ZM12.892 15.596C13.504 15.596 14.05 15.458 14.53 15.182C15.022 14.906 15.406 14.516 15.682 14.012C15.97 13.496 16.114 12.902 16.114 12.23C16.114 11.546 15.97 10.958 15.682 10.466C15.406 9.962 15.022 9.572 14.53 9.296C14.05 9.02 13.504 8.882 12.892 8.882C12.292 8.882 11.746 9.02 11.254 9.296C10.774 9.572 10.39 9.962 10.102 10.466C9.82604 10.958 9.68804 11.546 9.68804 12.23C9.68804 12.902 9.82604 13.496 10.102 14.012C10.39 14.516 10.774 14.906 11.254 15.182C11.746 15.458 12.292 15.596 12.892 15.596Z"
                          fill="#F2EFFE"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                {product.quantity > 0 ? (
                  <div className={styles.quantityAndCart}>
                    <div className={styles.quantitySelector}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className={styles.quantityInput}
                      />
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.quantity}
                      >
                        +
                      </button>
                    </div>

                    {isInCart ? (
                      <div className={styles.cartStatus}>
                        <button
                          className={cn(styles.goToCartBtn, styles.cartBtn)}
                          onClick={handleGoToCart}
                          title="Перейти в корзину"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          {cartQuantity > 1 ? `В корзине (${cartQuantity})` : 'В корзине'}
                        </button>
                      </div>
                    ) : (
                      <button
                        className={cn(styles.addToCartBtn, styles.cartBtn)}
                        onClick={handleAddToCart}
                        title="Добавить в корзину"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        В корзину
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.outOfStockMessage}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <span>Нет в наличии</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.productGallery}>
            {/* Маленькие фотографии (галерея) */}
            {product.images.length > 1 && (
              <div className={styles.imageGallery}>
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={cn(styles.galleryThumb, {
                      [styles.galleryThumbActive]: index === selectedImageIndex,
                    })}
                    onClick={() => handleImageSelect(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.title} - фото ${index + 1}`}
                      className={styles.thumbImage}
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Большая фотография */}
            <div className={styles.mainImageContainer}>
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || product.title}
                  className={styles.mainImage}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
