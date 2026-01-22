'use client';

import { BackLink } from '@/components/shared';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    slug: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
    category?: {
      name: string;
    };
  };
  variant?: {
    name: string;
    value: string;
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

interface UserBalance {
  balance: number;
  hasActiveSubscription: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Загрузка корзины и баланса
  useEffect(() => {
    if (status !== 'loading') {
      fetchCart();
      if (session) {
        fetchUserBalance();
      }
    }
  }, [status, session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCart({ items: data.items || [], total: data.total || 0 });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Оформление заказа
  const handlePlaceOrder = async () => {
    if (!session) {
      alert('Для оформления заказа необходимо авторизоваться');
      router.push('/login');
      return;
    }

    if (cart.items.length === 0) {
      alert('Корзина пуста');
      return;
    }

    if (userBalance && userBalance.balance < cart.total) {
      alert(`Недостаточно средств на балансе. Требуется: ${cart.total} ₽, доступно: ${userBalance.balance} ₽`);
      return;
    }

    if (!confirm(`Подтвердить заказ на сумму ${cart.total.toLocaleString('ru-RU')} ₽?`)) {
      return;
    }

    try {
      setProcessingOrder(true);

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'BALANCE',
          shippingMethod: 'CDEK',
          customerNote: 'Заказ из корзины',
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Заказ #${result.orderNumber} успешно оформлен! Сумма ${result.totalAmount} ₽ списана с баланса.`);

        // Обновляем баланс
        await fetchUserBalance();

        // Очищаем корзину
        setCart({ items: [], total: 0 });

        // Перенаправляем на страницу заказов
        router.push('/profile/orders');
      } else {
        alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Ошибка при оформлении заказа');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Обновить количество товара
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(itemId);
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)),
          total: prev.items.reduce((sum, item) => {
            const quantity = item.id === itemId ? newQuantity : item.quantity;
            return sum + item.price * quantity;
          }, 0),
        }));
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Не удалось обновить количество');
    } finally {
      setUpdating(null);
    }
  };

  // Удалить товар из корзины
  const removeItem = async (itemId: string) => {
    if (!confirm('Удалить товар из корзины?')) return;

    try {
      setUpdating(itemId);
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCart((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
          total: prev.items
            .filter((item) => item.id !== itemId)
            .reduce((sum, item) => sum + item.price * item.quantity, 0),
        }));
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Не удалось удалить товар');
    } finally {
      setUpdating(null);
    }
  };

  // Очистить корзину
  const clearCart = async () => {
    if (!confirm('Очистить всю корзину?')) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart({ items: [], total: 0 });
      alert('Корзина очищена');
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Не удалось очистить корзину');
    }
  };

  // Перейти в магазин
  const handleContinueShopping = () => {
    router.push('/shop');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}>Загрузка корзины...</div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles['balance']}>
        <BackLink mixClass={[styles['balance__backLink']]} />
        <div className={styles['balance__backLink-count-container']}>
          <h5 className={styles['balance__backLink-count']}>{userBalance?.balance || 0}</h5>
          <img src="/currency.svg" alt="icon" className={styles['balance__backLink-count-icon']} />
        </div>
      </div>
      <div className={styles.cart}>
        <div className={cn(styles.cartContainer, 'container')}>
          <h1 className={styles.pageTitle}>Моя корзина</h1>

          {cart.items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h2>Ваша корзина пуста</h2>
              <p>Добавьте товары из магазина, чтобы сделать заказ</p>
              <button className={styles.continueShoppingBtn} onClick={handleContinueShopping}>
                Перейти в магазин
              </button>
            </div>
          ) : (
            <div className={styles.cartContent}>
              <div className={styles.cartItems}>
                <h2 className={styles.sectionTitle}>Товары</h2>

                {cart.items.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    {/* Изображение товара */}
                    <div className={styles.itemImage}>
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.images[0].alt || item.product.title}
                          className={styles.productImage}
                        />
                      )}
                    </div>

                    {/* Информация о товаре */}
                    <div className={styles.itemInfo}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.productTitle}>{item.product.title}</h3>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          title="Удалить"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      {/* Категория и вариант */}
                      <div className={styles.itemDetails}>
                        {item.product.category && <span className={styles.category}>{item.product.category.name}</span>}
                        {item.variant && (
                          <span className={styles.variant}>
                            {item.variant.name}: {item.variant.value}
                          </span>
                        )}
                      </div>

                      {/* Цена и количество */}
                      <div className={styles.itemActions}>
                        <div className={styles.quantitySelector}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item.id}
                          >
                            −
                          </button>
                          <span className={styles.quantity}>{item.quantity} шт.</span>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                          >
                            +
                          </button>
                        </div>

                        <div className={styles.itemPrice}>
                          <span className={styles.totalPrice}>
                            {(item.price * item.quantity).toLocaleString('ru-RU')}
                          </span>
                          <span className={styles.unitPrice}>{item.price.toLocaleString('ru-RU')} / шт.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Итого и кнопки */}
                <div className={styles.orderSummary}>
                  <h2 className={styles.sectionTitle}>Итого:</h2>
                  <h2 className={styles.finalAmount}>{cart.total.toLocaleString('ru-RU')} ₽</h2>

                  <div className={styles.div}>
                    <div className={styles.div_one}>
                      <h3>Способ оплаты:</h3>
                      <div className={styles.one_block}>
                        <img src="./kassa.svg" alt="kassa" />
                        <span className={styles.a}>Баланс</span>
                      </div>
                      <h4>При недостатке средств пополните кошелек*</h4>
                    </div>
                    <div className={styles.div_two}>
                      <h3>Доставка:</h3>
                      <img src="./cdek.svg" alt="" />
                    </div>
                    <div className={styles.div_three}>
                      <h3>Данные заказчика:</h3>
                      <button className={styles.gg} onClick={() => router.push('/profile')}>
                        Перейти в личный кабинет
                      </button>
                    </div>
                  </div>

                  <button
                    className={styles.gg}
                    onClick={handlePlaceOrder}
                    disabled={!session || processingOrder || (userBalance && userBalance.balance < cart.total)}
                  >
                    {processingOrder ? 'Оформление...' : 'Заказать'}
                  </button>

                  {!session && <p className={styles.authRequired}>Для оформления заказа необходимо авторизоваться</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
