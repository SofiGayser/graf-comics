'use client';
import { useState } from 'react';
import styles from './index.module.scss';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (amount < 10) {
      alert('Минимальная сумма пополнения 10 рублей');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Сохраняем paymentId в localStorage для страницы успеха
        localStorage.setItem('lastPaymentId', data.paymentId);

        // Редирект на страницу оплаты ЮKassa
        window.location.href = data.confirmationUrl;
      } else {
        alert(data.error || 'Ошибка при создании платежа');
      }
    } catch (error) {
      alert('Ошибка при создании платежа');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Пополнение баланса</h2>
          <button className={styles['close-button']} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles['amount-section']}>
          <label className={styles['amount-label']}>Сумма пополнения:</label>
          <div className={styles['amount-input-container']}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="10"
              step="10"
              className={styles['amount-input']}
              placeholder="Введите сумму"
            />
          </div>
        </div>

        <div className={styles['quick-amounts']}>
          <p>Быстрый выбор:</p>
          <div className={styles['amount-buttons']}>
            {[100, 500, 1000, 2000].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className={`${styles['amount-button']} ${
                  amount === quickAmount ? styles['amount-button--active'] : ''
                }`}
              >
                {quickAmount} ₽
              </button>
            ))}
          </div>
        </div>

        <div className={styles['payment-info']}>
          <p>⚡ Оплата через СБП</p>
          <p>Вы будете перенаправлены на страницу банка для подтверждения платежа</p>
        </div>

        <div className={styles['modal-actions']}>
          <button onClick={handlePayment} disabled={isLoading || amount < 10} className={styles['pay-button']}>
            {isLoading ? 'Создание платежа...' : `Оплатить ${amount} ₽`}
          </button>
        </div>
      </div>
    </div>
  );
}
