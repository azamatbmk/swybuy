import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto, OrderAccessDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { PaymentsService } from '../payments/payments.service';
import { clientIp, rateLimit } from '../lib/rate-limit';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateOrderDto,
    @Req()
    request: {
      headers: Record<string, string | string[] | undefined>;
      ip?: string;
      socket?: { remoteAddress?: string };
    },
  ) {
    if (!rateLimit(`order:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
      throw new HttpException(
        'Слишком много заказов, подождите',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const order = await this.ordersService.create(dto);
    const serialized = this.ordersService.serialize(
      { ...order, author: null },
      'owner',
      { includeToken: true },
    );
    if (order.paymentMethod === 'cash') {
      return serialized;
    }
    try {
      const paymentUrl = await this.paymentsService.createPaymentUrl(order);
      return {
        ...serialized,
        paymentUrl,
      };
    } catch {
      return serialized;
    }
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-order-token') token?: string,
  ) {
    return this.ordersService.findOwner(id, token);
  }

  @Post(':id/pay')
  async pay(@Param('id') id: string, @Body() body: OrderAccessDto) {
    const order = await this.ordersService.requireOwner(id, body.token);
    if (order.status !== 'pending') {
      throw new HttpException('Заказ уже обработан', HttpStatus.BAD_REQUEST);
    }
    const paymentUrl = await this.paymentsService.createPaymentUrl(order);
    return { paymentUrl };
  }
}
