interface CreatePaymentPayload {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: {
    userId: string;
    type: 'balance_topup';
    paymentId?: string;
  };
}

interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata?: any;
}

export class YooKassaService {
  private static baseUrl = 'https://api.yookassa.ru/v3';

  // Генерация ключа идемпотентности (UUID v4)
  private static generateIdempotenceKey(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Создание платежа для пополнения баланса
  static async createPayment(payload: CreatePaymentPayload): Promise<YooKassaPayment> {
    const { amount, currency = 'RUB', description, metadata } = payload;

    // Проверяем наличие необходимых переменных
    const shopId = process.env.YOO_KASSA_SHOP_ID;
    const secretKey = process.env.YOO_KASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      throw new Error('YooKassa credentials are not configured');
    }

    console.log('🔑 Creating payment with Shop ID:', shopId);

    // Для тестового режима используем банковскую карту вместо СБП
    const paymentPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: currency,
      },
      payment_method_data: {
        type: 'bank_card', // Используем банковскую карту вместо SBP
      },
      confirmation: {
        type: 'redirect',
        return_url: process.env.YOO_KASSA_RETURN_URL || 'https://graf-comics-632s.vercel.app/payment/success',
      },
      capture: true,
      description: description || 'Пополнение баланса',
      metadata: metadata || {},
      test: true, // Явно указываем тестовый режим
    };

    try {
      console.log('📦 Sending payment request to YooKassa...');

      const idempotenceKey = this.generateIdempotenceKey();
      console.log('   Idempotence-Key:', idempotenceKey);
      console.log('   Payment method: bank_card (test mode)');

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': idempotenceKey,
          Authorization: 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64'),
        },
        body: JSON.stringify(paymentPayload),
      });

      console.log('📡 Response status:', response.status);

      const responseText = await response.text();
      console.log('📡 Response body:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        console.error('❌ YooKassa API error:', errorData);

        // Пробуем альтернативный метод оплаты
        if (errorData.description?.includes('Payment method is not available')) {
          return await this.createPaymentWithAlternativeMethod(payload);
        }

        throw new Error(errorData.description || `HTTP ${response.status}: Payment creation failed`);
      }

      const payment: YooKassaPayment = JSON.parse(responseText);
      console.log('✅ Payment created successfully:', payment.id);
      console.log('   Confirmation URL:', payment.confirmation.confirmation_url);

      return payment;
    } catch (error) {
      console.error('💥 Payment creation error:', error);
      if (error instanceof Error) {
        throw new Error(`Ошибка создания платежа: ${error.message}`);
      }
      throw new Error('Неизвестная ошибка при создании платежа');
    }
  }

  // Альтернативный метод оплаты (без указания конкретного метода)
  private static async createPaymentWithAlternativeMethod(payload: CreatePaymentPayload): Promise<YooKassaPayment> {
    const { amount, currency = 'RUB', description, metadata } = payload;

    const shopId = process.env.YOO_KASSA_SHOP_ID;
    const secretKey = process.env.YOO_KASSA_SECRET_KEY;

    console.log('🔄 Trying alternative payment method (auto-select)...');

    const paymentPayload = {
      amount: {
        value: amount.toFixed(2),
        currency: currency,
      },
      // Не указываем конкретный payment_method_data, пусть ЮKassa сама предложит доступные методы
      confirmation: {
        type: 'redirect',
        return_url: process.env.YOO_KASSA_RETURN_URL || 'https://graf-comics-632s.vercel.app/payment/success',
      },
      capture: true,
      description: description || 'Пополнение баланса',
      metadata: metadata || {},
      test: true,
    };

    const idempotenceKey = this.generateIdempotenceKey();

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        Authorization: 'Basic ' + Buffer.from(shopId + ':' + secretKey).toString('base64'),
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alternative method failed: ${errorText}`);
    }

    const payment: YooKassaPayment = await response.json();
    console.log('✅ Payment created with alternative method:', payment.id);
    return payment;
  }
}
