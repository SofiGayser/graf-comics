'use client';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';

type Props = {
  product: {
    id: string;
    title: string;
    description?: string;
    price: number;
    comparePrice?: number;
    images: Array<{ url: string; alt?: string }>;
    slug: string;
  };
  mixClass?: string[];
};

const ShopCard: FC<Props> = ({ product, mixClass = [] }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Проверяем наличие товара в корзине
  useEffect(() => {
    checkCartStatus();
  }, [product.id]);

  const checkCartStatus = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        const cartItem = data.items?.find((item: any) => item.productId === product.id);
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

  const handleProductClick = () => {
    router.push(`/shop/${product.slug}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Добавить API вызов для добавления в избранное
    console.log('Добавить в избранное:', product.id);
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (isInCart) {
        // Перенаправляем в корзину
        router.push('/cart');
      } else {
        // Добавляем в корзину
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setIsInCart(true);
          setCartQuantity(1);
          // Не показываем алерт, чтобы не мешать пользователю
        } else {
          alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        }
      }
    } catch (error) {
      console.error('Error handling cart:', error);
      alert('Ошибка при работе с корзиной');
    }
  };

  const mainImage = product.images?.[0]?.url || '/images/placeholder.jpg';
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className={cn(styles['shop-card'], ...mixClass)}>
      {/* Верхняя часть с изображением */}
      <div className={styles['shop-card__image-container']} onClick={handleProductClick} style={{ cursor: 'pointer' }}>
        <img src={mainImage} alt={product.images?.[0]?.alt || product.title} className={styles['shop-card__image']} />

        {/* Бейдж скидки */}
        {discount > 0 && <div className={styles['shop-card__discount']}>-{discount}%</div>}

        {/* Кнопка избранного */}
        <button
          className={cn(styles['shop-card__favorite-btn'], {
            [styles['shop-card__favorite-btn--active']]: isFavorite,
          })}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFavorite ? '#7A5AF8' : 'none'}
            stroke={isFavorite ? '#7A5AF8' : '#666'}
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Бейдж в корзине */}
        {isInCart && (
          <div className={styles['shop-card__in-cart-badge']}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>

      {/* Нижняя часть с информацией */}
      <div className={styles['shop-card__content']}>
        {/* Название товара */}
        <h3 className={styles['shop-card__title']} onClick={handleProductClick} style={{ cursor: 'pointer' }}>
          {product.title}
        </h3>

        {/* Цена */}
        <div className={styles['shop-card__price']}>
          <span className={styles['shop-card__current-price']}>{product.price.toLocaleString('ru-RU')} ₽</span>
          {product.comparePrice && (
            <span className={styles['shop-card__old-price']}>{product.comparePrice.toLocaleString('ru-RU')} ₽</span>
          )}
        </div>

        {/* Кнопка корзины */}
        <button
          className={cn(styles['shop-card__cart-btn'], {
            [styles['shop-card__cart-btn--active']]: isInCart,
          })}
          onClick={handleCartClick}
        >
          {isInCart ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              {cartQuantity > 1 ? `В корзине (${cartQuantity})` : 'В корзине'}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ShopCard);
