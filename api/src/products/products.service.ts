import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/save-product.dto';
import { ShopSettingsDto } from '../admin/dto/shop-settings.dto';
import { withSale } from '../lib/sale';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.shopSettings.upsert({
      where: { id: 'shop' },
      create: {
        id: 'shop',
        globalDiscountOn: false,
        globalDiscountPercent: 0,
      },
      update: {},
    });
  }

  async updateSettings(dto: ShopSettingsDto) {
    return this.prisma.shopSettings.upsert({
      where: { id: 'shop' },
      create: {
        id: 'shop',
        globalDiscountOn: dto.globalDiscountOn,
        globalDiscountPercent: dto.globalDiscountPercent,
      },
      update: {
        globalDiscountOn: dto.globalDiscountOn,
        globalDiscountPercent: dto.globalDiscountPercent,
      },
    });
  }

  async present(product: { price: number; discountPercent?: number | null }) {
    return withSale(product, await this.getSettings());
  }

  async presentMany<T extends { price: number; discountPercent?: number | null }>(
    products: T[],
  ) {
    const settings = await this.getSettings();
    return products.map((product) => withSale(product, settings));
  }

  async findPublic() {
    const products = await this.prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return this.presentMany(products);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product || !product.active) {
      throw new NotFoundException('Товар не найден');
    }
    return this.present(product);
  }

  async findAllAdmin() {
    const products = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return this.presentMany(products);
  }

  async createAdmin(dto: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          sku: dto.sku.trim().toLowerCase(),
          slug: dto.slug.trim().toLowerCase(),
          price: dto.price,
          discountPercent: dto.discountPercent ?? null,
          stock: dto.stock,
          weightGrams: dto.weightGrams ?? 200,
          description: dto.description.trim(),
          ingredients: dto.ingredients?.trim() || '',
          forWhom: dto.forWhom?.trim() || '',
          warning: dto.warning?.trim() || '',
          imageUrl: dto.imageUrl.trim(),
          active: dto.active ?? true,
        },
      });
      return this.present(product);
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async updateAdmin(id: string, data: UpdateProductDto) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.sku !== undefined ? { sku: data.sku.trim().toLowerCase() } : {}),
          ...(data.slug !== undefined
            ? { slug: data.slug.trim().toLowerCase() }
            : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.discountPercent !== undefined
            ? { discountPercent: data.discountPercent }
            : {}),
          ...(data.stock !== undefined ? { stock: data.stock } : {}),
          ...(data.weightGrams !== undefined
            ? { weightGrams: data.weightGrams }
            : {}),
          ...(data.description !== undefined
            ? { description: data.description.trim() }
            : {}),
          ...(data.ingredients !== undefined
            ? { ingredients: data.ingredients.trim() }
            : {}),
          ...(data.forWhom !== undefined ? { forWhom: data.forWhom.trim() } : {}),
          ...(data.warning !== undefined ? { warning: data.warning.trim() } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl.trim() } : {}),
          ...(data.active !== undefined ? { active: data.active } : {}),
        },
      });
      return this.present(product);
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  private throwIfDuplicate(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException('Такой артикул или ссылка уже есть');
    }
  }
}
