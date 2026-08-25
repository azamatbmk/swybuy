import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [OrdersModule, ProductsModule],
  controllers: [AdminController],
  providers: [AdminGuard],
})
export class AdminModule {}
