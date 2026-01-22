'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PaymentStatus {
  user: {
    balance: number;
    email: string;
  };
  payment: {
    id: string;
    yooPaymentId: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
  } | null;
  hasPayments: boolean;
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Пробуем получить paymentId из разных источников
  const getPaymentId = () => {
    // Из URL параметров
    const urlPaymentId = searchParams.get('paymentId');
    if (urlPaymentId) return urlPaymentId;

    // Из localStorage (сохраняем при создании платежа)
    const storedPaymentId = localStorage.getItem('lastPaymentId');
    if (storedPaymentId) return storedPaymentId;

    return null;
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      console.log('Checking payment status for:', paymentId);
      const response = await fetch(`/api/payment/status?paymentId=${paymentId}`);
      const data = await response.json();

      console.log('Payment status response:', data);

      if (data.payment) {
        setPaymentData(data);

        if (data.payment.status === 'SUCCEEDED') {
          setStatus('success');
          // Удаляем из localStorage после успешной проверки
          localStorage.removeItem('lastPaymentId');
        } else if (retryCount < 10) {
          // Пробуем до 10 раз
          // Платеж еще не обработан, пробуем снова через 3 секунды
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 3000);
        } else {
          // Превышено количество попыток
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      if (retryCount < 5) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 3000);
      } else {
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    const paymentId = getPaymentId();

    if (paymentId) {
      checkPaymentStatus(paymentId);
    } else {
      // Если нет paymentId, показываем общий успех
      setTimeout(() => {
        setStatus('success');
      }, 2000);
    }
  }, [retryCount]);

  // Функция для ручного обновления баланса
  const manualSyncBalance = async () => {
    const paymentId = getPaymentId();
    if (!paymentId) return;

    try {
      const response = await fetch('/api/payment/sync-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      const data = await response.json();
      console.log('Manual sync result:', data);

      if (data.success) {
        // Перепроверяем статус
        checkPaymentStatus(paymentId);
      }
    } catch (error) {
      console.error('Manual sync error:', error);
    }
  };

  return (
    <div
      className="container"
      style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}
    >
      {status === 'loading' && (
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h1>Проверка статуса платежа...</h1>
          <p>Пожалуйста, подождите</p>
          {retryCount > 0 && (
            <p style={{ color: '#666', fontSize: '14px' }}>
              Попытка {retryCount}/10... (это может занять до 30 секунд)
            </p>
          )}
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={manualSyncBalance}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Обновить баланс вручную
            </button>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#22c55e' }}>✅</div>
          <h1>Оплата прошла успешно!</h1>

          {paymentData && (
            <div
              style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                margin: '20px 0',
                textAlign: 'left',
              }}
            >
              <h3>Детали платежа:</h3>
              <p>
                <strong>Сумма:</strong> {paymentData.payment?.amount} ₽
              </p>
              <p>
                <strong>Статус:</strong> Успешно
              </p>
              <p>
                <strong>Текущий баланс:</strong> {paymentData.user.balance} ₽
              </p>
              <p>
                <strong>Описание:</strong> {paymentData.payment?.description}
              </p>
            </div>
          )}

          <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>Баланс пополнен. Спасибо за оплату!</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/subscription"
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Вернуться к подпискам
            </Link>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                background: '#f8f9fa',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              На главную
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#ef4444' }}>❌</div>
          <h1>Не удалось подтвердить платеж</h1>
          <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
            Платеж может быть обработан с задержкой. Проверьте баланс позже или свяжитесь с поддержкой.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={manualSyncBalance}
              style={{
                padding: '12px 24px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Попробовать обновить баланс
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/subscription"
              style={{
                padding: '12px 24px',
                background: '#f8f9fa',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Вернуться к оплате
            </Link>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                background: '#f8f9fa',
                color: '#333',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              На главную
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
