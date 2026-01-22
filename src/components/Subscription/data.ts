import { SubscriptionCardProps } from './types';

// Замените ID на реальные из базы
export const subscriptionData: SubscriptionCardProps[] = [
  {
    id: '692aedd2faaab2fdfa36b8a3',
    price: 0,
    duration: '— на 7 дней',
    durationMonths: 0.23,
    description: 'Попробуйте наш сервис абсолютно бесплатно в течение 7 дней!',
    benefits:
      'Получите полный доступ ко всему каталогу комиксов и решите, хотите ли вы продолжить чтение на платной основе',
    userBalance: 0,
    hasActiveSubscription: false,
  },
  {
    id: '692aedd3faaab2fdfa36b8a4',
    price: 99,
    duration: '— на 1 месяц',
    durationMonths: 1,
    description: 'Идеальный вариант для тех, кто хочет наслаждаться комиксами целый месяц.',
    benefits: 'Получите доступ к свежим и эксклюзивным главам.',
    userBalance: 0,
    hasActiveSubscription: false,
  },
  {
    id: '692aedd3faaab2fdfa36b8a5',
    price: 499,
    duration: '— на 6 месяцев',
    durationMonths: 6,
    description: 'Оптимальный выбор для тех, кто хочет наслаждаться любимыми комиксами полгода!',
    benefits: 'Получите доступ ко всем главам и оставайтесь в курсе свежих выпусков.',
    userBalance: 0,
    hasActiveSubscription: false,
  },
  {
    id: '692aedd3faaab2fdfa36b8a6',
    price: 999,
    duration: '— на 1 год',
    durationMonths: 12,
    description: 'Для настоящих фанатов — годовой доступ к комиксам.',
    benefits: 'Самый выгодный вариант для долгосрочного чтения.',
    userBalance: 0,
    hasActiveSubscription: false,
  },
];
