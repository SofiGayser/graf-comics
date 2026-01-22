import { NextPage } from 'next';
import Link from 'next/link';
import styles from './index.module.scss';

const SubscribePage: NextPage = () => {
  return (
    <div className={styles.subscribe}>
      <div className={styles.subscribe__container}>
        <div className={styles.subscribe__icon}>⭐</div>

        <h1 className={styles.subscribe__title}>Требуется подписка</h1>

        <p className={styles.subscribe__description}>Для доступа к разделу авторства необходима активная подписка</p>

        <div className={styles.subscribe__features}>
          <div className={styles.subscribe__feature}>Полный доступ ко всем инструментам авторства</div>
          <div className={styles.subscribe__feature}>...</div>
          <div className={styles.subscribe__feature}>...</div>
          <div className={styles.subscribe__feature}>...</div>
        </div>

        <Link href="/subscription" className={styles.subscribe__button}>
          <span>Выбрать подписку</span>
          <svg className={styles.subscribe__buttonIcon} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className={styles.subscribe__footer}>
          Подписка автоматически продлевается. Отменить можно в любой момент.
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
