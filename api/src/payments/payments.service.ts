import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly config: ConfigService) {}

  async createPaymentUrl(order: Order): Promise<string> {
    const webOrigin = this.config.get<string>(
      'WEB_ORIGIN',
      'http://localhost:3000',
    );
    const mode = this.config.get<string>('PAYMENT_MODE', 'mock');
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secret = this.config.get<string>('YOOKASSA_SECRET_KEY');

    if (mode === 'yookassa' && shopId && secret) {
      const auth = Buffer.from(`${shopId}:${secret}`).toString('base64');
      const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
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
            return_url: `${webOrigin}/order/${order.id}`,
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

    return `/pay/mock/${order.id}`;
  }
}
