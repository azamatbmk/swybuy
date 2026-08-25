import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../lib/slugify';
import { safeEqual } from '../lib/safe-equal';
import { OrderItemSnapshot } from '../orders/orders.service';
import { PublishShelfDto, UpdateShelfDto } from './dto/publish-shelf.dto';

const PAID = new Set(['confirmed', 'paid', 'packed', 'shipped']);

@Injectable()
export class ShelvesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(slug: string) {
    const user = await this.prisma.user.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        shelfItems: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user) {
      throw new NotFoundException('Полка не найдена');
    }

    const skus = user.shelfItems.map((item) => item.sku);
    const products = skus.length
      ? await this.prisma.product.findMany({
          where: { sku: { in: skus }, active: true },
        })
      : [];
    const bySku = new Map(products.map((product) => [product.sku, product]));

    return {
      name: user.name,
      slug: user.slug,
      products: skus
        .map((sku) => bySku.get(sku))
        .filter((product): product is NonNullable<typeof product> =>
          Boolean(product),
        ),
    };
  }

  async publishFromOrder(orderId: string, dto: PublishShelfDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    const dummy = '0'.repeat(48);
    const expected = order?.accessToken || dummy;
    const provided = dto.orderToken || dummy;
    const owns =
      Boolean(order?.accessToken && dto.orderToken) &&
      safeEqual(provided, expected);
    if (!owns || !order) {
      throw new NotFoundException('Заказ не найден');
    }
    if (!PAID.has(order.status)) {
      throw new BadRequestException('Полку можно собрать после оплаты');
    }

    const items = JSON.parse(order.itemsJson) as OrderItemSnapshot[];
    const allowed = new Set(items.map((item) => item.sku));
    const skus = [...new Set(dto.skus.map((sku) => sku.trim()).filter(Boolean))];
    if (skus.some((sku) => !allowed.has(sku))) {
      throw new BadRequestException('На полку можно выложить только то, что в заказе');
    }
    if (skus.length === 0) {
      throw new BadRequestException('Выберите хотя бы одно средство');
    }

    const name = dto.name.trim();
    let user = order.user;

    if (user) {
      if (!dto.token || !safeEqual(dto.token, user.manageToken)) {
        throw new ForbiddenException('Нет доступа к этой полке');
      }
    }

    if (!user && dto.token) {
      user = await this.prisma.user.findUnique({
        where: { manageToken: dto.token },
      });
    }

    if (!user) {
      const slug = await this.uniqueSlug(slugify(name) || 'shelf');
      user = await this.prisma.user.create({
        data: {
          name,
          slug,
          manageToken: randomBytes(24).toString('hex'),
        },
      });
    } else if (user.name !== name) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    const owner = user;

    if (order.userId !== owner.id) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { userId: owner.id },
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.shelfItem.deleteMany({
        where: { userId: owner.id, sku: { in: [...allowed] } },
      });
      await tx.shelfItem.createMany({
        data: skus.map((sku) => ({ userId: owner.id, sku })),
      });
    });

    return {
      name: owner.name,
      slug: owner.slug,
      token: owner.manageToken,
      skus,
    };
  }

  async update(slug: string, dto: UpdateShelfDto) {
    const user = await this.prisma.user.findUnique({
      where: { slug: slug.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundException('Полка не найдена');
    }
    if (!safeEqual(dto.token, user.manageToken)) {
      throw new ForbiddenException('Нет доступа к этой полке');
    }

    const data: { name?: string } = {};
    if (dto.name) {
      data.name = dto.name.trim();
    }
    if (Object.keys(data).length) {
      await this.prisma.user.update({ where: { id: user.id }, data });
    }

    if (dto.skus) {
      const owned = await this.ownedSkus(user.id);
      const skus = [...new Set(dto.skus)].filter((sku) => owned.has(sku));
      await this.prisma.$transaction(async (tx) => {
        await tx.shelfItem.deleteMany({ where: { userId: user.id } });
        if (skus.length) {
          await tx.shelfItem.createMany({
            data: skus.map((sku) => ({ userId: user.id, sku })),
          });
        }
      });
    }

    return this.findPublic(user.slug);
  }

  private async ownedSkus(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId, status: { in: [...PAID] } },
      select: { itemsJson: true },
    });
    const skus = new Set<string>();
    for (const order of orders) {
      const items = JSON.parse(order.itemsJson) as OrderItemSnapshot[];
      for (const item of items) {
        skus.add(item.sku);
      }
    }
    return skus;
  }

  private async uniqueSlug(base: string) {
    let slug = base;
    let n = 2;
    while (await this.prisma.user.findUnique({ where: { slug } })) {
      slug = `${base.slice(0, 40)}-${n}`;
      n += 1;
    }
    return slug;
  }
}
