import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Inject,
  Param,
  Post,
  forwardRef,
} from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from './payments.service';

class MockPayDto {
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  token: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('mock/:orderId')
  async mockSuccess(
    @Param('orderId') orderId: string,
    @Body() body: MockPayDto,
  ) {
    if (!this.paymentsService.isMockEnabled()) {
      throw new ForbiddenException('Тестовая оплата выключена');
    }
    await this.ordersService.requireOwner(orderId, body.token);
    await this.ordersService.markPaid(orderId, `mock_${orderId}`);
    return this.ordersService.findOwner(orderId, body.token);
  }

  @Post('yookassa/webhook')
  @HttpCode(200)
  async yookassaWebhook(
    @Body()
    body: {
      event?: string;
      object?: { id?: string };
    },
  ) {
    const paymentId = body.object?.id;
    if (body.event !== 'payment.succeeded' || !paymentId) {
      return { ok: true };
    }

    const payment = await this.paymentsService.fetchYookassaPayment(paymentId);
    if (!payment || payment.status !== 'succeeded') {
      throw new BadRequestException('Платёж не подтверждён');
    }
    const orderId = payment.metadata?.orderId;
    if (!orderId) {
      return { ok: true };
    }

    const order = await this.ordersService.getRaw(orderId);
    const paidAmount = Number(payment.amount?.value);
    if (
      !Number.isFinite(paidAmount) ||
      Math.round(paidAmount * 100) !== Math.round(order.total * 100) ||
      payment.amount?.currency !== 'RUB'
    ) {
      throw new BadRequestException('Сумма не совпадает');
    }

    await this.ordersService.markPaid(orderId, paymentId);
    return { ok: true };
  }
}
