'use client';

import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
  variantId?: string;
}

export const useCart = () => {
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Загрузка корзины
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');

      if (response.ok) {
        const data = await response.json();
        setCart({ items: data.items || [], total: data.total || 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Проверка наличия товара в корзине
  const isInCart = (productId: string, variantId?: string) => {
    return cart.items.some((item) => item.productId === productId && (!variantId || item.variantId === variantId));
  };

  // Получить количество товара в корзине
  const getCartQuantity = (productId: string, variantId?: string) => {
    const item = cart.items.find(
      (item) => item.productId === productId && (!variantId || item.variantId === variantId),
    );
    return item ? item.quantity : 0;
  };

  return {
    cart,
    loading,
    isInCart,
    getCartQuantity,
    refreshCart: fetchCart,
  };
};
