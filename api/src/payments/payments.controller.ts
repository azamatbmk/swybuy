import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  forwardRef,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @Post('mock/:orderId')
  mockSuccess(@Param('orderId') orderId: string) {
    return this.ordersService.markPaid(orderId, `mock_${orderId}`);
  }

  @Post('yookassa/webhook')
  async yookassaWebhook(
    @Body()
    body: {
      event?: string;
      object?: { id?: string; status?: string; metadata?: { orderId?: string } };
    },
  ) {
    const orderId = body.object?.metadata?.orderId;
    if (body.event === 'payment.succeeded' && orderId) {
      return this.ordersService.markPaid(orderId, body.object?.id);
    }
    return { ok: true };
  }
}
