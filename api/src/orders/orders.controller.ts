import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);
    const paymentUrl = await this.paymentsService.createPaymentUrl(order);
    return {
      ...this.ordersService.serialize({ ...order, author: null }),
      paymentUrl,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findPublic(id);
  }
}
