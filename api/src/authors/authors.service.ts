import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { parseSocialHandle } from '../lib/social-handle';
import { SaveAuthorDto } from './dto/save-author.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  findAll() {
    return this.prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: { slug: true, name: true, handle: true },
    });
  }

  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!author) {
      throw new NotFoundException('Витрина не найдена');
    }
    const products = await this.catalogProducts(
      author.items.map((item) => item.sku),
    );
    return {
      slug: author.slug,
      name: author.name,
      handle: author.handle || author.slug,
      products: await this.productsService.presentMany(products),
    };
  }

  async findAllAdmin() {
    const authors = await this.prisma.author.findMany({
      include: { items: { orderBy: { createdAt: 'asc' } } },
      orderBy: { name: 'asc' },
    });
    return authors.map((author) => ({
      id: author.id,
      slug: author.slug,
      name: author.name,
      handle: author.handle || author.slug,
      skus: author.items.map((item) => item.sku),
    }));
  }

  async createAdmin(dto: SaveAuthorDto) {
    const parsed = this.requireHandle(dto.handle);
    const skus = await this.validSkus(dto.skus || []);
    try {
      const author = await this.prisma.author.create({
        data: {
          slug: parsed.slug,
          name: parsed.name,
          handle: parsed.handle,
          items: {
            create: skus.map((sku) => ({ sku })),
          },
        },
        include: { items: true },
      });
      return this.serializeAdmin(author);
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async updateAdmin(id: string, dto: SaveAuthorDto) {
    const current = await this.prisma.author.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Витрина не найдена');
    }
    const parsed = this.requireHandle(dto.handle);
    const skus = await this.validSkus(dto.skus || []);
    try {
      const author = await this.prisma.$transaction(async (tx) => {
        await tx.authorCatalogItem.deleteMany({ where: { authorId: id } });
        return tx.author.update({
          where: { id },
          data: {
            name: parsed.name,
            handle: parsed.handle,
            items: {
              create: skus.map((sku) => ({ sku })),
            },
          },
          include: { items: true },
        });
      });
      return this.serializeAdmin(author);
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  private requireHandle(raw: string) {
    const parsed = parseSocialHandle(raw);
    if (!parsed.slug || parsed.handle.length < 2) {
      throw new BadRequestException('Нужен ник из соцсети, например @masha');
    }
    return parsed;
  }

  private async validSkus(skus: string[]) {
    const unique = [...new Set(skus.map((sku) => sku.trim()).filter(Boolean))];
    if (unique.length === 0) {
      return [];
    }
    const products = await this.prisma.product.findMany({
      where: { sku: { in: unique } },
      select: { sku: true },
    });
    if (products.length !== unique.length) {
      throw new BadRequestException('Один из товаров не найден');
    }
    return unique;
  }

  private async catalogProducts(skus: string[]) {
    if (skus.length === 0) {
      return this.prisma.product.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
    }
    const products = await this.prisma.product.findMany({
      where: { sku: { in: skus }, active: true },
    });
    const bySku = new Map(products.map((product) => [product.sku, product]));
    return skus
      .map((sku) => bySku.get(sku))
      .filter((product): product is NonNullable<typeof product> =>
        Boolean(product),
      );
  }

  private serializeAdmin(author: {
    id: string;
    slug: string;
    name: string;
    handle: string;
    items: { sku: string }[];
  }) {
    return {
      id: author.id,
      slug: author.slug,
      name: author.name,
      handle: author.handle || author.slug,
      skus: author.items.map((item) => item.sku),
    };
  }

  private throwIfDuplicate(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Такой ник уже есть');
    }
  }
}
