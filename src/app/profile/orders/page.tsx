'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';

interface OrderItem {
  id: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  total: number;
  product: {
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  items: OrderItem[];
  history: Array<{
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/my');

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#2ed573';
      case 'PROCESSING':
        return '#ffa502';
      case 'SHIPPED':
        return '#18dcff';
      case 'DELIVERED':
        return '#7d5fff';
      case 'CANCELLED':
        return '#ff4757';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loader}>Загрузка заказов...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.notAuth}>
        <h2>Необходимо авторизоваться</h2>
        <p>Для просмотра заказов войдите в аккаунт</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Мои заказы</h1>

        {orders.length === 0 ? (
          <div className={styles.noOrders}>
            <div className={styles.noOrdersIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
            </div>
            <h2>У вас еще нет заказов</h2>
            <p>Совершите покупки в магазине, чтобы увидеть их здесь</p>
            <button className={styles.shopButton} onClick={() => (window.location.href = '/shop')}>
              Перейти в магазин
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.orderNumber}>Заказ #{order.orderNumber}</h3>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={styles.orderStatus}>
                    <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(order.status) }}>
                      {order.status === 'CONFIRMED' && 'Подтвержден'}
                      {order.status === 'PROCESSING' && 'В обработке'}
                      {order.status === 'SHIPPED' && 'Отправлен'}
                      {order.status === 'DELIVERED' && 'Доставлен'}
                      {order.status === 'CANCELLED' && 'Отменен'}
                    </span>
                    <p className={styles.orderTotal}>Итого: {order.finalAmount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  <h4>Товары:</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.itemImage}>
                        {item.product.images[0] && (
                          <img src={item.product.images[0].url} alt={item.product.images[0].alt || item.productName} />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <h5>{item.productName}</h5>
                        {item.variantName && <p className={styles.variant}>Вариант: {item.variantName}</p>}
                        <p className={styles.itemDetails}>
                          {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽ ={' '}
                          {item.total.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.history.length > 0 && (
                  <div className={styles.orderHistory}>
                    <h4>История заказа:</h4>
                    <ul>
                      {order.history.map((history, index) => (
                        <li key={index}>
                          <span className={styles.historyDate}>{formatDate(history.createdAt)}</span>
                          <span className={styles.historyStatus}>
                            {history.status === 'CONFIRMED' && 'Заказ подтвержден'}
                            {history.status === 'PROCESSING' && 'Заказ в обработке'}
                            {history.status === 'SHIPPED' && 'Заказ отправлен'}
                            {history.status === 'DELIVERED' && 'Заказ доставлен'}
                            {history.status === 'CANCELLED' && 'Заказ отменен'}
                          </span>
                          {history.note && <span className={styles.historyNote}> - {history.note}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
