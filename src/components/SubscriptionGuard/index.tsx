'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './index.module.scss';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);

      if (status === 'loading') return;

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      try {
        const response = await fetch('/api/subscription/check');
        const data = await response.json();

        setHasSubscription(data.hasSubscription);

        if (!data.hasSubscription) {
          router.push('/subscribe');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
        router.push('/subscribe');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [session, status, router]);

  if (isLoading || status === 'loading' || hasSubscription === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!hasSubscription) {
    return null;
  }

  return <>{children}</>;
}
