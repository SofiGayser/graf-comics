'use client';
import cn from 'classnames';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import { Button } from '../UI';
import DepositHistoryCard from '../UI/DepositHistoryCard';
import { BackLink } from '../shared';
import styles from './index.module.scss';

interface UserBalance {
  balance: number;
  hasActiveSubscription: boolean;
  activeSubscription?: {
    plan: string;
    endDate: string;
    price: number;
  } | null;
  recentTransactions?: Array<{
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'SUBSCRIPTION' | 'PURCHASE';
    amount: number;
    status: string;
    description: string;
    formattedDate: string;
    createdAt: string;
  }>;
}

const Balance: FC = () => {
  const { data: session } = useSession();
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  const fetchFullHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`/api/user/transactions?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setFullHistory(data.transactions);
        } else {
          setFullHistory((prev) => [...prev, ...data.transactions]);
        }
        setHasMore(data.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Ошибка при получении полной истории:', error);
    } finally {
      setHistoryLoading(false);
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

  const formatAmount = (type: string, amount: number) => {
    const sign = type === 'DEPOSIT' ? '+' : '-';
    return `${sign}${amount}`;
  };

  const getTransactionTypeText = (type: string) => {
    const types: Record<string, string> = {
      DEPOSIT: 'Пополнение',
      WITHDRAWAL: 'Списание',
      SUBSCRIPTION: 'Подписка',
      PURCHASE: 'Покупка',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }
  return (
    <div className={'container'}>
      <div className={styles['balance__backLink-container']}>
        <BackLink mixClass={[styles['balance__backLink']]} />
        <div className={styles['balance__backLink-count-container']}>
          <h5 className={styles['balance__backLink-count']}>{userBalance?.balance || 0}</h5>
          <img src="/currency.svg" alt="icon" className={styles['balance__backLink-count-icon']} />
        </div>
      </div>
      <div>
        <section className={cn(styles['balance'], 'container')}>
          <h1 className={styles['balance__h1']}>Мой кошелек</h1>
          <h3 className={styles['balance__h3']}>У вас на счету:</h3>
          <div className={styles['balance__count-container']}>
            <h1 className={styles['balance__count']}>{userBalance?.balance || 0}</h1>
            <img src="/currency.svg" alt="icon" className={styles['balance__count-icon']} />
          </div>
          <Button>Пополнить</Button>
          <h3 className={styles['balance__history-title']}>История операций</h3>
          <>
            {userBalance?.recentTransactions && userBalance.recentTransactions.length > 0 ? (
              userBalance.recentTransactions.map((transaction) => (
                <DepositHistoryCard
                  type={getTransactionTypeText(transaction.type)}
                  data={transaction.formattedDate}
                  amount={formatAmount(transaction.type, transaction.amount)}
                  mixClass={[styles['']]}
                />
              ))
            ) : (
              <div className={styles['balance__history-empty']}>Пусто(</div>
            )}
          </>
        </section>
      </div>
    </div>
  );
};
export default Balance;
