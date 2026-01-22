import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛍️ Начало seeding магазина...');

  console.log('🧹 Очистка старых данных магазина...');

  await prisma.productTagOnProduct.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productReview.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.orderPayment.deleteMany({});
  await prisma.orderHistory.deleteMany({});
  await prisma.orderCoupon.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productTag.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.coupon.deleteMany({});

  console.log('✅ Старые данные удалены');

  console.log('📁 Создание категорий товаров...');

  const categories = [
    {
      name: 'стикерпаки',
      slug: 'stickerpacks',
      description: 'Наборы стикеров для мессенджеров',
      image: '/categories/stickers.jpg',
      order: 1,
      isActive: true,
    },
    {
      name: 'открытки',
      slug: 'postcards',
      description: 'Поздравительные открытки',
      image: '/categories/postcards.jpg',
      order: 2,
      isActive: true,
    },
    {
      name: 'футболки',
      slug: 't-shirts',
      description: 'Футболки с принтами',
      image: '/categories/t-shirts.jpg',
      order: 3,
      isActive: true,
    },
    {
      name: 'наклейки',
      slug: 'stickers',
      description: 'Отдельные наклейки',
      image: '/categories/stickers-single.jpg',
      order: 4,
      isActive: true,
    },
    {
      name: 'скетчбук',
      slug: 'sketchbooks',
      description: 'Альбомы для рисования',
      image: '/categories/sketchbooks.jpg',
      order: 5,
      isActive: true,
    },
    {
      name: 'плакаты',
      slug: 'posters',
      description: 'Постеры и плакаты',
      image: '/categories/posters.jpg',
      order: 6,
      isActive: true,
    },
    {
      name: 'комикс (мягкая обложка)',
      slug: 'comics-soft-cover',
      description: 'Комиксы в мягкой обложке',
      image: '/categories/comics-soft.jpg',
      order: 7,
      isActive: true,
    },
    {
      name: 'комикс (твердая обложка)',
      slug: 'comics-hard-cover',
      description: 'Комиксы в твердой обложке',
      image: '/categories/comics-hard.jpg',
      order: 8,
      isActive: true,
    },
    {
      name: 'пины',
      slug: 'pins',
      description: 'Значки и пины',
      image: '/categories/pins.jpg',
      order: 9,
      isActive: true,
    },
    {
      name: 'значки',
      slug: 'badges',
      description: 'Коллекционные значки',
      image: '/categories/badges.jpg',
      order: 10,
      isActive: true,
    },
    {
      name: 'аксессуары',
      slug: 'accessories',
      description: 'Аксессуары',
      image: '/categories/accessories.jpg',
      order: 11,
      isActive: true,
    },
    {
      name: 'брелки',
      slug: 'keychains',
      description: 'Брелки',
      image: '/categories/keychains.jpg',
      order: 12,
      isActive: true,
    },
    {
      name: 'акриловые фигурки',
      slug: 'acrylic-figures',
      description: 'Акриловые фигурки персонажей',
      image: '/categories/acrylic-figures.jpg',
      order: 13,
      isActive: true,
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.productCategory.create({
      data: category,
    });
    createdCategories.push(created);
  }

  console.log(`✅ Создано ${createdCategories.length} категорий`);

  console.log('🏷️ Создание тегов товаров...');
  function generateSKU(title: string, index: number) {
    const prefix = title
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    return `${prefix}-${String(index + 1).padStart(3, '0')}`;
  }
  const tags = [
    { name: 'Новинка', slug: 'new', color: '#7a5af8' },
    { name: 'Хит продаж', slug: 'bestseller', color: '#ff4757' },
    { name: 'Эксклюзив', slug: 'exclusive', color: '#ffa502' },
    { name: 'Лимитированный тираж', slug: 'limited', color: '#2ed573' },
    { name: 'Распродажа', slug: 'sale', color: '#ff3838' },
    { name: 'Премиум', slug: 'premium', color: '#ff9f1a' },
    { name: 'Популярное', slug: 'popular', color: '#18dcff' },
  ];

  const createdTags = [];
  for (const tag of tags) {
    const created = await prisma.productTag.create({
      data: tag,
    });
    createdTags.push(created);
  }

  console.log(`✅ Создано ${createdTags.length} тегов`);

  console.log('📦 Создание товаров...');

  const products = [
    {
      title: 'Стикерпак "Коты Графкомикса"',
      slug: 'stickerpack-cats-grafcomics',
      description:
        'Набор из 15 уникальных стикеров с милыми котами из вселенной Графкомикса. Идеально для Telegram, WhatsApp и других мессенджеров. Каждый стикер выполнен в высоком качестве, с яркими цветами и четкой графикой.',
      shortDescription: '15 уникальных стикеров с котами',
      price: 299,
      comparePrice: 399,
      quantity: 50,
      categorySlug: 'stickerpacks',
      tagSlugs: ['new', 'bestseller'],
      isNew: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 24,
      salesCount: 156,
      images: [
        'https://images.unsplash.com/photo-1514888286974-6d03bdeacba8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&h=600&fit=crop',
      ],
      specifications: [
        { key: 'Количество стикеров', value: '15 шт' },
        { key: 'Размер', value: '10x10 см' },
        { key: 'Материал', value: 'Водостойкая пленка' },
        { key: 'Тип', value: 'Стикерпак для мессенджеров' },
      ],
    },
    {
      title: 'Открытки "Коты"',
      slug: 'postcards-cats',
      description:
        'Набор из 5 поздравительных открыток с уникальным дизайном кошачьей тематики. Каждая открытка имеет свой уникальный дизайн и текст. Идеально подходит для дней рождений, праздников и просто чтобы поднять настроение.',
      shortDescription: 'Набор из 5 открыток с котами',
      price: 299,
      comparePrice: 399,
      quantity: 100,
      categorySlug: 'postcards',
      tagSlugs: ['exclusive'],
      isNew: false,
      isFeatured: true,
      rating: 4.6,
      reviewsCount: 18,
      salesCount: 89,
      images: [
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=600&fit=crop',
      ],
      specifications: [
        { key: 'Количество в упаковке', value: '3 шт.' },
        { key: 'Цвет', value: 'разноцветный' },
        { key: 'Габариты/размер', value: 'А6' },
        { key: 'Материал', value: 'Картон' },
      ],
    },
    {
      title: 'Футболка "Графкомикс"',
      slug: 't-shirt-grafcomics',
      description:
        'Хлопковая футболка премиум-класса с принтом логотипа Графкомикса. Высокое качество печати, удобная посадка, мягкая ткань. Состав: 100% хлопок. Доступна в нескольких размерах.',
      shortDescription: 'Хлопковая футболка с логотипом Графкомикса',
      price: 1299,
      comparePrice: 1599,
      quantity: 30,
      categorySlug: 't-shirts',
      tagSlugs: ['new', 'bestseller'],
      isNew: true,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 42,
      salesCount: 210,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1000&fit=crop',
      ],
      specifications: [
        { key: 'Материал', value: '100% хлопок' },
        { key: 'Размеры', value: 'S, M, L, XL' },
        { key: 'Цвет', value: 'Черный' },
        { key: 'Стирка', value: 'Ручная или машинная при 30°C' },
      ],
      hasVariants: true,
    },
    {
      title: 'Скетчбук "Творчество"',
      slug: 'sketchbook-creativity',
      description:
        'Альбом для рисования формата А5 с плотной бумагой (120 г/м²). Идеально для скетчей, набросков, записей и акварели. Твердая обложка защищает ваши работы.',
      shortDescription: 'Альбом для рисования А5, 100 листов',
      price: 499,
      comparePrice: 599,
      quantity: 40,
      categorySlug: 'sketchbooks',
      tagSlugs: ['premium'],
      isNew: true,
      isFeatured: false,
      rating: 4.7,
      reviewsCount: 31,
      salesCount: 178,
      images: [
        'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      ],
      specifications: [
        { key: 'Формат', value: 'А5 (148x210 мм)' },
        { key: 'Количество листов', value: '100 шт' },
        { key: 'Плотность бумаги', value: '120 г/м²' },
        { key: 'Тип бумаги', value: 'Для рисования и скетчей' },
        { key: 'Переплет', value: 'Твердая обложка' },
      ],
    },
    {
      title: 'Наклейки "Персонажи"',
      slug: 'stickers-characters',
      description:
        'Набор из 10 виниловых наклеек с персонажами популярных комиксов. Наклейки водостойкие, можно клеить на ноутбуки, телефоны, холодильники, скейты и другие поверхности.',
      shortDescription: '10 виниловых наклеек с персонажами',
      price: 199,
      comparePrice: 249,
      quantity: 80,
      categorySlug: 'stickers',
      tagSlugs: ['bestseller', 'popular'],
      isNew: false,
      isFeatured: true,
      rating: 4.5,
      reviewsCount: 56,
      salesCount: 345,
      images: [
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      ],
      specifications: [
        { key: 'Количество', value: '10 шт' },
        { key: 'Размер', value: 'Разный, от 3x3 до 8x8 см' },
        { key: 'Материал', value: 'Винил' },
        { key: 'Водостойкость', value: 'Да' },
        { key: 'Поверхность', value: 'Глянцевая' },
      ],
    },
    {
      title: 'Комикс "Приключения в космосе" (мягкая обложка)',
      slug: 'comic-space-adventures-soft',
      description:
        'Полноцветный комикс о космических приключениях. 48 страниц увлекательного сюжета, яркие иллюстрации, качественная печать.',
      shortDescription: 'Комикс 48 страниц, мягкая обложка',
      price: 499,
      comparePrice: 599,
      quantity: 60,
      categorySlug: 'comics-soft-cover',
      tagSlugs: ['new', 'exclusive'],
      isNew: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 32,
      salesCount: 210,
      images: [
        'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=1000&fit=crop',
      ],
      specifications: [
        { key: 'Количество страниц', value: '48 стр' },
        { key: 'Обложка', value: 'Мягкая' },
        { key: 'Формат', value: 'А5' },
        { key: 'Язык', value: 'Русский' },
        { key: 'Возрастное ограничение', value: '12+' },
      ],
    },
    {
      title: 'Комикс "Легенды леса" (твердая обложка)',
      slug: 'comic-forest-legends-hard',
      description:
        'Коллекционное издание комикса в твердой обложке. 96 страниц полноцветных иллюстраций, дополнительный материал от автора.',
      shortDescription: 'Коллекционное издание, твердая обложка',
      price: 1299,
      comparePrice: 1599,
      quantity: 25,
      categorySlug: 'comics-hard-cover',
      tagSlugs: ['limited', 'premium'],
      isNew: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 18,
      salesCount: 76,
      images: [
        'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop',
      ],
      specifications: [
        { key: 'Количество страниц', value: '96 стр' },
        { key: 'Обложка', value: 'Твердая' },
        { key: 'Формат', value: 'А5' },
        { key: 'Особенности', value: 'Коллекционное издание' },
        { key: 'Тираж', value: '1000 экз' },
      ],
    },
    {
      title: 'Пин "Логотип Графкомикс"',
      slug: 'pin-grafcomics-logo',
      description:
        'Металлический значок с логотипом Графкомикса. Качественное изготовление, безопасная застежка. Отлично подходит для коллекционеров и фанатов.',
      shortDescription: 'Металлический значок с логотипом',
      price: 299,
      comparePrice: 349,
      quantity: 150,
      categorySlug: 'pins',
      tagSlugs: ['new', 'popular'],
      isNew: true,
      isFeatured: false,
      rating: 4.4,
      reviewsCount: 8,
      salesCount: 67,
      images: [
        'https://images.unsplash.com/photo-1589674781759-c21c37956a8c?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&h=800&fit=crop',
      ],
      specifications: [
        { key: 'Материал', value: 'Металл' },
        { key: 'Размер', value: '2.5 см' },
        { key: 'Застежка', value: 'Безопасный замок' },
        { key: 'Цвет', value: 'Золотой/Черный' },
      ],
    },
    {
      title: 'Акриловая фигурка "Космический кот"',
      slug: 'acrylic-figure-space-cat',
      description:
        'Акриловая фигурка персонажа из популярного комикса. Яркая УФ-печать с двух сторон, подставка в комплекте.',
      shortDescription: 'Акриловая фигурка с подставкой',
      price: 899,
      comparePrice: 1099,
      quantity: 20,
      categorySlug: 'acrylic-figures',
      tagSlugs: ['limited', 'exclusive'],
      isNew: true,
      isFeatured: true,
      rating: 4.7,
      reviewsCount: 5,
      salesCount: 32,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=800&fit=crop',
      ],
      specifications: [
        { key: 'Материал', value: 'Акрил' },
        { key: 'Высота', value: '10 см' },
        { key: 'Основание', value: 'Пластиковая подставка' },
        { key: 'Печать', value: 'УФ-печать с двух сторон' },
        { key: 'Тираж', value: '500 шт' },
      ],
    },
    {
      title: 'Брелок "Котик-космонавт"',
      slug: 'keychain-cat-astronaut',
      description: 'Металлический брелок в форме котика в скафандре. Качественная эмаль, прочное крепление.',
      shortDescription: 'Металлический брелок с эмалью',
      price: 199,
      comparePrice: 249,
      quantity: 120,
      categorySlug: 'keychains',
      tagSlugs: ['new', 'popular'],
      isNew: true,
      isFeatured: false,
      rating: 4.6,
      reviewsCount: 12,
      salesCount: 89,
      images: [
        'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?w=800&h=800&fit=crop',
      ],
      specifications: [
        { key: 'Материал', value: 'Металл с эмалью' },
        { key: 'Размер', value: '3 см' },
        { key: 'Крепление', value: 'Карабин' },
        { key: 'Цвет', value: 'Серебристый/синий' },
      ],
    },
  ];

  let createdProductsCount = 0;
  for (const [index, productData] of products.entries()) {
    const category = createdCategories.find((c) => c.slug === productData.categorySlug);

    const product = await prisma.product.create({
      data: {
        title: productData.title,
        slug: productData.slug,
        sku: generateSKU(productData.title, index),
        description: productData.description,
        shortDescription: productData.shortDescription,
        price: productData.price,
        comparePrice: productData.comparePrice,
        quantity: productData.quantity,
        isActive: true,
        isNew: productData.isNew,
        isFeatured: productData.isFeatured,
        rating: productData.rating,
        reviewsCount: productData.reviewsCount,
        salesCount: productData.salesCount,
        viewsCount: Math.floor(productData.salesCount * 3),
        categoryId: category?.id,
        hasVariants: productData.hasVariants || false,
        images: {
          create: productData.images.map((url, index) => ({
            url,
            alt: `${productData.title} - фото ${index + 1}`,
            order: index + 1,
            isMain: index === 0,
          })),
        },
        specifications: {
          create: productData.specifications.map((spec) => ({
            key: spec.key,
            value: spec.value,
          })),
        },
      },
    });

    for (const tagSlug of productData.tagSlugs) {
      const tag = createdTags.find((t) => t.slug === tagSlug);
      if (tag) {
        await prisma.productTagOnProduct.create({
          data: {
            productId: product.id,
            tagId: tag.id,
          },
        });
      }
    }

    if (productData.hasVariants) {
      const sizes = ['S', 'M', 'L', 'XL'];
      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            name: 'Размер',
            value: size,
            sku: `${product.slug}-${size}`,
            price: productData.price + (size === 'XL' ? 100 : size === 'L' ? 50 : 0),
            quantity: Math.floor(productData.quantity / sizes.length),
            product: {
              connect: {
                id: product.id,
              },
            },
          },
        });
      }
    }

    createdProductsCount++;
    console.log(`   ✅ ${productData.title}`);
  }

  console.log(`\n✅ Создано ${createdProductsCount} товаров`);

  console.log('🎟️ Создание купонов...');

  const coupons = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      usageLimit: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // через год
      isActive: true,
      isSingleUse: false,
    },
    {
      code: 'FIRSTORDER',
      discountType: 'FIXED', // Используем строковое значение из enum
      discountValue: 300,
      minOrderAmount: 1000,
      maxDiscount: 300,
      usageLimit: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // через месяц
      isActive: true,
      isSingleUse: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({
      data: {
        ...coupon,
        discountType: coupon.discountType as any, // Приводим тип
      },
    });
  }

  console.log(`✅ Создано ${coupons.length} купонов`);

  console.log('\n📊 ИТОГОВАЯ СТАТИСТИКА:');
  console.log('=====================');
  console.log(`📁 Категории: ${createdCategories.length}`);
  console.log(`🏷️  Теги: ${createdTags.length}`);
  console.log(`📦 Товары: ${createdProductsCount}`);
  console.log(`🎟️ Купоны: ${coupons.length}`);
  console.log('=====================');
  console.log('🎉 Seeding магазина завершен успешно!');
  console.log('\n🛒 Магазин готов к работе!');
  console.log('🔗 Перейдите на http://localhost:3000/shop');
  console.log('👨‍💼 Для просмотра данных: npx prisma studio');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при seeding магазина:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
