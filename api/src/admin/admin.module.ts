import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminSessionsService } from './admin-sessions.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { AuthorsModule } from '../authors/authors.module';

@Module({
  imports: [OrdersModule, ProductsModule, AuthorsModule],
  controllers: [AdminController],
  providers: [AdminGuard, AdminSessionsService],
})
export class AdminModule {}
