import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../products/dto/save-product.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Get('orders')
  orders() {
    return this.ordersService.findAllAdmin();
  }

  @Patch('orders/:id')
  updateOrder(
    @Param('id') id: string,
    @Body() body: { status?: string; trackNumber?: string },
  ) {
    return this.ordersService.updateAdmin(id, body);
  }

  @Get('products')
  products() {
    return this.productsService.findAllAdmin();
  }

  @Post('products')
  createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createAdmin(body);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.updateAdmin(id, body);
  }
}
