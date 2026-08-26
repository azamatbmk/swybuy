import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AUTHOR_PERCENT, deliveryPrice } from './pricing';
import { isOssetiaCity } from '../lib/ossetia';
import { safeEqual } from '../lib/safe-equal';
import { CreateOrderDto } from './dto/create-order.dto';

export type OrderItemSnapshot = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

const HOLDING = new Set([
  'pending',
  'confirmed',
  'paid',
  'packed',
  'shipped',
]);

function holdsStock(status: string, reserved: boolean) {
  if (reserved) {
    return HOLDING.has(status);
  }
  return ['confirmed', 'paid', 'packed', 'shipped'].includes(status);
}
const PENDING_TTL_MS = 45 * 60 * 1000;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateOrderDto) {
    await this.expireStalePending();

    if (dto.city && !isOssetiaCity(dto.city)) {
      throw new BadRequestException('Доставляем только по Северной Осетии');
    }
    if (dto.phone.replace(/\D/g, '').length < 10) {
      throw new BadRequestException(
        'Укажите телефон, например +7 928 123-45-67',
      );
    }

    const merged = new Map<string, number>();
    for (const item of dto.items) {
      merged.set(item.sku, (merged.get(item.sku) || 0) + item.quantity);
    }

    const products = await this.prisma.product.findMany({
      where: { sku: { in: [...merged.keys()] }, active: true },
    });
    if (products.length !== merged.size) {
      throw new BadRequestException('Один из товаров недоступен');
    }

    const priced = await this.productsService.presentMany(products);
    const items: OrderItemSnapshot[] = [...merged.entries()].map(
      ([sku, quantity]) => {
        const product = priced.find((row) => row.sku === sku);
        if (!product) {
          throw new BadRequestException(`Нет товара ${sku}`);
        }
        if (product.stock < quantity) {
          throw new BadRequestException(`Недостаточно «${product.name}»`);
        }
        if (quantity > 20) {
          throw new BadRequestException(`Слишком много «${product.name}»`);
        }
        return {
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          price: product.salePrice,
          quantity,
        };
      },
    );

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
    const paymentMethod = 'cash';

    return this.prisma.$transaction(async (tx) => {
      await this.reserveStock(tx, items);
      return tx.order.create({
        data: {
          status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
          ref,
          authorId: author?.id,
          customerName: dto.customerName.trim(),
          phone: dto.phone.trim(),
          email: dto.email?.trim() || '',
          city: dto.city || '',
          street: dto.street?.trim() || '',
          house: dto.house?.trim() || '',
          apartment: dto.apartment?.trim() || null,
          deliveryType: 'pochta',
          paymentMethod,
          accessToken: randomBytes(24).toString('hex'),
          stockReserved: true,
          deliveryPrice: shipping,
          itemsJson: JSON.stringify(items),
          itemsTotal,
          total: itemsTotal + shipping,
          authorPercent: AUTHOR_PERCENT,
          authorAmount: author ? authorAmount : 0,
          paymentId: paymentMethod === 'cash' ? 'cash' : null,
        },
      });
    });
  }

  async findOwner(id: string, token?: string) {
    await this.expireStalePending(id);
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { author: true, user: { select: { slug: true, name: true } } },
    });
    if (!this.ownsOrder(order, token)) {
      throw new NotFoundException('Заказ не найден');
    }
    return this.serialize(order, 'owner', { includeToken: false });
  }

  async requireOwner(id: string, token?: string) {
    await this.expireStalePending(id);
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!this.ownsOrder(order, token)) {
      throw new NotFoundException('Заказ не найден');
    }
    return order;
  }

  async findAllAdmin() {
    const orders = await this.prisma.order.findMany({
      include: { author: true, user: { select: { slug: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => this.serialize(order, 'admin'));
  }

  async updateAdmin(
    id: string,
    data: { status?: string; trackNumber?: string },
  ) {
    const current = await this.prisma.order.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Заказ не найден');
    }

    const nextStatus = data.status ?? current.status;
    const items = JSON.parse(current.itemsJson) as OrderItemSnapshot[];

    const order = await this.prisma.$transaction(async (tx) => {
      let stockReserved = current.stockReserved;
      const wasHolding = holdsStock(current.status, current.stockReserved);
      const willHold = HOLDING.has(nextStatus);

      if (wasHolding && !willHold) {
        await this.releaseStock(tx, items);
        stockReserved = false;
      }
      if (!wasHolding && willHold) {
        await this.reserveStock(tx, items);
        stockReserved = true;
      }

      return tx.order.update({
        where: { id },
        data: {
          ...(data.status ? { status: data.status } : {}),
          ...(data.trackNumber !== undefined
            ? { trackNumber: data.trackNumber }
            : {}),
          stockReserved,
        },
        include: {
          author: true,
          user: { select: { slug: true, name: true } },
        },
      });
    });

    return this.serialize(order, 'admin');
  }

  async markPaid(orderId: string, paymentId?: string) {
    await this.expireStalePending(orderId);
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
        'admin',
      );
    }
    if (order.status !== 'pending') {
      throw new BadRequestException('Заказ нельзя оплатить');
    }

    const items = JSON.parse(order.itemsJson) as OrderItemSnapshot[];

    await this.prisma.$transaction(async (tx) => {
      if (!order.stockReserved) {
        await this.reserveStock(tx, items);
      }
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentId,
          paidAt: new Date(),
          stockReserved: true,
        },
      });
    });

    return { ok: true, id: orderId };
  }

  async getRaw(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }
    return order;
  }

  async expireStalePending(exceptId?: string) {
    const cutoff = new Date(Date.now() - PENDING_TTL_MS);
    const stale = await this.prisma.order.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: cutoff },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    for (const order of stale) {
      const items = JSON.parse(order.itemsJson) as OrderItemSnapshot[];
      await this.prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: 'pending' },
          data: { status: 'failed' },
        });
        if (claimed.count !== 1) {
          return;
        }
        if (order.stockReserved) {
          await this.releaseStock(tx, items);
        }
        await tx.order.update({
          where: { id: order.id },
          data: { stockReserved: false },
        });
      });
    }
  }

  private async reserveStock(
    tx: Prisma.TransactionClient,
    items: OrderItemSnapshot[],
  ) {
    for (const item of items) {
      const updated = await tx.product.updateMany({
        where: { sku: item.sku, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new BadRequestException(`Закончился «${item.name}»`);
      }
    }
  }

  private async releaseStock(
    tx: Prisma.TransactionClient,
    items: OrderItemSnapshot[],
  ) {
    for (const item of items) {
      await tx.product.update({
        where: { sku: item.sku },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  private ownsOrder<T extends { accessToken: string | null }>(
    order: T | null,
    token?: string,
  ): order is T & { accessToken: string } {
    const dummy = '0'.repeat(48);
    const expected = order?.accessToken || dummy;
    const provided = token || dummy;
    return Boolean(order?.accessToken && token && safeEqual(provided, expected));
  }

  serialize(
    order: {
      itemsJson: string;
      author: { slug: string; name: string } | null;
      user?: { slug: string; name: string } | null;
      [key: string]: unknown;
    },
    mode: 'owner' | 'admin',
    options?: { includeToken?: boolean },
  ) {
    const {
      itemsJson,
      user,
      accessToken,
      authorId: _authorId,
      userId: _userId,
      stockReserved: _stockReserved,
      ...rest
    } = order;
    const items = JSON.parse(itemsJson) as OrderItemSnapshot[];
    const publicRest = { ...rest };
    if (mode === 'owner') {
      delete publicRest.authorAmount;
      delete publicRest.authorPercent;
    }
    delete publicRest.accessToken;
    return {
      ...publicRest,
      ...(mode === 'owner' && options?.includeToken ? { accessToken } : {}),
      items,
      shelf: user ? { slug: user.slug, name: user.name } : null,
    };
  }
}
