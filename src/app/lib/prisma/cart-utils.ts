// Временное хранилище корзины (в реальном приложении используйте localStorage или сервер)
let cart: any[] = [];

export const cartUtils = {
  // Добавить товар в корзину
  addToCart: (productId: string, quantity: number = 1, variantId?: string) => {
    const existingItem = cart.find((item) => item.productId === productId && item.variantId === variantId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId,
        variantId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    // Сохраняем в localStorage для сохранения между сессиями
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    return cart;
  },

  // Получить корзину
  getCart: () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      cart = savedCart ? JSON.parse(savedCart) : [];
    }
    return cart;
  },

  // Удалить товар из корзины
  removeFromCart: (productId: string, variantId?: string) => {
    cart = cart.filter((item) => !(item.productId === productId && item.variantId === variantId));

    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    return cart;
  },

  // Очистить корзину
  clearCart: () => {
    cart = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  },
};
