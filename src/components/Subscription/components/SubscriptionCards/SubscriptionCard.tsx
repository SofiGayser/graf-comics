'use client';
import { useRouter } from 'next/navigation';
import { FC, memo, useState } from 'react';
import styles from '../../index.module.scss';
import { SubscriptionCardProps } from '../../types';

const SubscriptionCardComponent: FC<SubscriptionCardProps> = ({
  id,
  price,
  duration,
  description,
  benefits,
  durationMonths,
  userBalance,
  hasActiveSubscription,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    if (hasActiveSubscription) {
      alert('У вас уже есть активная подписка');
      return;
    }

    if (userBalance < price) {
      alert('Недостаточно средств на балансе. Пополните счет.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: id,
          price,
          durationMonths,
          paymentMethod: 'balance',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Подписка успешно оформлена!');
        router.push('/authorship'); // Перенаправляем на защищенную страницу
      } else {
        alert(data.error || 'Ошибка при оформлении подписки');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Ошибка при оформлении подписки');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubscribe = !hasActiveSubscription && userBalance >= price;
  const buttonText = hasActiveSubscription
    ? 'Активная подписка'
    : userBalance < price
      ? 'Недостаточно средств'
      : isLoading
        ? 'Оформление...'
        : 'Оформить';

  return (
    <div key={id} className={styles['cards__subscribe']}>
      <div className={styles['cards__content']}>
        <div className={styles['balance__count-container']}>
          <p className={styles['cards__price']}>{price}</p>
          <img src="/currency.svg" alt="icon" className={styles['balance__count-icon']} />
        </div>

        <h2 className={styles['cards__title']}>{duration}</h2>
        <p className={styles['cards__text']}>{description}</p>
        <br />
        <p className={styles['cards__text']}>{benefits}</p>
      </div>
      <button className={styles['cards__button']} onClick={handleSubscribe} disabled={!canSubscribe || isLoading}>
        {buttonText}
      </button>
    </div>
  );
};

export const SubscriptionCard = memo(SubscriptionCardComponent);
