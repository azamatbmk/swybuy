import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AUTHOR_PERCENT, deliveryPrice } from './pricing';

export type OrderItemSnapshot = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const skus = dto.items.map((item) => item.sku);
    const products = await this.prisma.product.findMany({
      where: { sku: { in: skus }, active: true },
    });

    if (products.length !== new Set(skus).size) {
      throw new BadRequestException('Один из товаров недоступен');
    }

    const items: OrderItemSnapshot[] = dto.items.map((item) => {
      const product = products.find((row) => row.sku === item.sku);
      if (!product) {
        throw new BadRequestException(`Нет товара ${item.sku}`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Недостаточно «${product.name}»`);
      }
      return {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const itemsTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = deliveryPrice(itemsTotal);
    const authorAmount = Math.round((itemsTotal * AUTHOR_PERCENT) / 100);
    const ref = dto.ref?.trim().toLowerCase() || null;
    const author = ref
      ? await this.prisma.author.findUnique({ where: { slug: ref } })
      : null;

    return this.prisma.order.create({
      data: {
        status: 'pending',
        ref,
        authorId: author?.id,
        customerName: dto.customerName,
        phone: dto.phone ?? '',
        email: dto.email ?? '',
        city: dto.city ?? '',
        street: dto.street ?? '',
        house: dto.house ?? '',
        apartment: dto.apartment ?? null,
        deliveryType: dto.deliveryType || 'cdek',
        deliveryPrice: shipping,
        itemsJson: JSON.stringify(items),
        itemsTotal,
        total: itemsTotal + shipping,
        authorPercent: AUTHOR_PERCENT,
        authorAmount: author ? authorAmount : 0,
      },
    });
  }

  async findPublic(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { author: true, user: { select: { slug: true, name: true } } },
    });
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    return this.serialize(order);
  }

  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      include: { author: true, user: { select: { slug: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => this.serialize(order));
  }

  async updateAdmin(
    id: string,
    data: { status?: string; trackNumber?: string },
  ) {
    const allowed = [
      'pending',
      'paid',
      'packed',
      'shipped',
      'returned',
      'failed',
    ];
    if (data.status && !allowed.includes(data.status)) {
      throw new BadRequestException('Неизвестный статус');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data,
      include: { author: true, user: { select: { slug: true, name: true } } },
    });
    return this.serialize(order);
  }

  async markPaid(orderId: string, paymentId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    if (order.status === 'paid') {
      return this.serialize(
        await this.prisma.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { author: true, user: { select: { slug: true, name: true } } },
        }),
      );
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Заказ нельзя оплатить');
    }

    const items = JSON.parse(order.itemsJson) as OrderItemSnapshot[];

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { sku: item.sku },
        });
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(`Закончился «${item.name}»`);
        }
        await tx.product.update({
          where: { sku: item.sku },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentId,
          paidAt: new Date(),
        },
      });
    });

    return this.findPublic(orderId);
  }

  serialize(order: {
    itemsJson: string;
    author: { slug: string; name: string } | null;
    user?: { slug: string; name: string } | null;
    [key: string]: unknown;
  }) {
    const { itemsJson, user, ...rest } = order;
    return {
      ...rest,
      items: JSON.parse(itemsJson) as OrderItemSnapshot[],
      shelf: user ? { slug: user.slug, name: user.name } : null,
    };
  }
}
