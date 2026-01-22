import prisma from '@/services/prisma';

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      name: 'Бесплатная пробная',
      price: 0,
      duration: 7, // 7 дней
      description: 'Попробуйте наш сервис абсолютно бесплатно в течение 7 дней!',
      benefits: ['Полный доступ ко всему каталогу комиксов', 'Возможность оценить все функции'],
      isActive: true,
    },
    {
      name: 'Месячная подписка',
      price: 99,
      duration: 30, // 30 дней
      description: 'Идеальный вариант для тех, кто хочет наслаждаться комиксами целый месяц.',
      benefits: ['Доступ к свежим и эксклюзивным главам', 'Приоритетная поддержка'],
      isActive: true,
    },
    {
      name: 'Полугодовая подписка',
      price: 499,
      duration: 180, // 6 месяцев
      description: 'Оптимальный выбор для тех, кто хочет наслаждаться любимыми комиксами полгода!',
      benefits: ['Доступ ко всем главам', 'Уведомления о новых выпусках', 'Скидка 15%'],
      isActive: true,
    },
    {
      name: 'Годовая подписка',
      price: 999,
      duration: 365, // 1 год
      description: 'Для настоящих фанатов — годовой доступ к комиксам.',
      benefits: ['Самый выгодный вариант', 'Приоритетная поддержка', 'Эксклюзивный контент', 'Скидка 30%'],
      isActive: true,
    },
  ];

  try {
    // Удаляем существующие планы (опционально)
    await prisma.subscriptionPlan.deleteMany({});
    console.log('🗑️ Cleared existing plans');

    // Создаем новые планы
    for (const plan of plans) {
      const createdPlan = await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`✅ Created plan: ${createdPlan.name} (ID: ${createdPlan.id})`);
    }

    console.log('🎉 Subscription plans created successfully!');
  } catch (error) {
    console.error('❌ Error creating subscription plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
seedSubscriptionPlans();
