'use client';
import PaymentModal from '@/components/PaymentModal';
import { BackLink } from '@/components/shared';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { Button } from '../UI';
import { SubscriptionCard } from './components';
import { subscriptionData } from './data';
import styles from './index.module.scss';
import { SubscriptionProps } from './types';

interface UserBalance {
  balance: number;
  hasActiveSubscription: boolean;
  activeSubscription?: {
    plan: string;
    endDate: string;
    price: number;
  } | null;
}

const Subscription: FC<SubscriptionProps> = ({ plans = subscriptionData }) => {
  const { data: session } = useSession();
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data);
      }
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (session) {
        await fetchBalance();
        setIsLoading(false);
      }
    };

    loadData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={'container'}>
      {/* Хедер с балансом - оставляем как было */}
      <div className={styles['balance__backLink-container']}>
        <BackLink mixClass={[styles['balance__backLink']]} />
        <div className={styles['balance__backLink-count-container']}>
          <h5 className={styles['balance__backLink-count']}>{userBalance?.balance || 0}</h5>
          <img src="/currency.svg" alt="icon" className={styles['balance__backLink-count-icon']} />
        </div>
      </div>

      {/* Секция баланса - оставляем оригинальную верстку */}
      <section className={cn(styles['balance'], 'container')}>
        <h1 className={styles['balance__h1']}>Оформление подписки</h1>
        <h3 className={styles['balance__h3']}>У вас на счету:</h3>
        <div className={styles['balance__count-container']}>
          <h1 className={styles['balance__count']}>{userBalance?.balance || 0}</h1>
          <img src="/currency.svg" alt="icon" className={styles['balance__count-icon']} />
        </div>

        {/* Используем оригинальную кнопку Button и добавляем обработчик */}
        <Button onClick={() => setIsPaymentModalOpen(true)}>Пополнить</Button>

        {userBalance?.hasActiveSubscription && userBalance.activeSubscription && (
          <div className={styles['active-subscription']}>
            <p>Активная подписка: {userBalance.activeSubscription.plan}</p>
            <p>Действует до: {new Date(userBalance.activeSubscription.endDate).toLocaleDateString('ru-RU')}</p>
          </div>
        )}
      </section>

      {/* Карточки подписок - используем оригинальные данные */}
      <section className={styles['cards']}>
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            {...plan}
            userBalance={userBalance?.balance || 0}
            hasActiveSubscription={userBalance?.hasActiveSubscription || false}
          />
        ))}
      </section>

      {/* Правила - оставляем как было */}
      <section>
        <p className={styles['subscription-link']}>
          <a className={styles['subscription-link__rule']} href="#">
            Правила
          </a>{' '}
          и
          <a className={styles['subscription-link__rule']} href="#">
            {' '}
            условия пользования{' '}
          </a>
          подпиской
        </p>
      </section>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          fetchBalance();
        }}
      />
    </div>
  );
};

export default Subscription;
