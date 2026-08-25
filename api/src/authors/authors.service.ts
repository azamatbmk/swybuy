import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({ where: { slug } });
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }
    return author;
  }
}
