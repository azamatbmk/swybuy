import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/save-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product || !product.active) {
      throw new NotFoundException('Товар не найден');
    }
    return product;
  }

  findAllAdmin() {
    return this.prisma.product.findMany({ orderBy: { name: 'asc' } });
  }

  async createAdmin(dto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          sku: dto.sku.trim().toLowerCase(),
          slug: dto.slug.trim().toLowerCase(),
          price: dto.price,
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
    } catch (error) {
      this.throwIfDuplicate(error);
      throw error;
    }
  }

  async updateAdmin(id: string, data: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.sku !== undefined ? { sku: data.sku.trim().toLowerCase() } : {}),
          ...(data.slug !== undefined
            ? { slug: data.slug.trim().toLowerCase() }
            : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
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
