import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';

type YookassaPayment = {
  id?: string;
  status?: string;
  amount?: { value?: string; currency?: string };
  metadata?: { orderId?: string };
};

@Injectable()
export class PaymentsService {
  constructor(private readonly config: ConfigService) {}

  paymentMode() {
    const fallback =
      process.env.NODE_ENV === 'production' ? 'yookassa' : 'mock';
    return this.config.get<string>('PAYMENT_MODE', fallback);
  }

  isMockEnabled() {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return this.paymentMode() === 'mock';
  }

  async createPaymentUrl(order: Order): Promise<string> {
    const webOrigin = this.config.get<string>(
      'WEB_ORIGIN',
      'http://localhost:3000',
    );
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secret = this.config.get<string>('YOOKASSA_SECRET_KEY');
    const returnUrl = `${webOrigin}/order/${order.id}`;

    if (this.paymentMode() === 'yookassa' && shopId && secret) {
      const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.authHeader(shopId, secret)}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': order.id,
        },
        body: JSON.stringify({
          amount: {
            value: order.total.toFixed(2),
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          description: `Заказ SwyBuy ${order.id}`,
          metadata: { orderId: order.id },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`YooKassa error: ${text}`);
      }

      const payload = (await response.json()) as {
        confirmation?: { confirmation_url?: string };
      };
      if (!payload.confirmation?.confirmation_url) {
        throw new Error('YooKassa не вернула ссылку на оплату');
      }
      return payload.confirmation.confirmation_url;
    }

    if (!this.isMockEnabled()) {
      throw new Error('Онлайн-оплата не настроена');
    }

    return `/pay/mock/${order.id}`;
  }

  async fetchYookassaPayment(paymentId: string): Promise<YookassaPayment | null> {
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secret = this.config.get<string>('YOOKASSA_SECRET_KEY');
    if (!shopId || !secret) {
      return null;
    }

    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `Basic ${this.authHeader(shopId, secret)}`,
        },
      },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as YookassaPayment;
  }

  private authHeader(shopId: string, secret: string) {
    return Buffer.from(`${shopId}:${secret}`).toString('base64');
  }
}
