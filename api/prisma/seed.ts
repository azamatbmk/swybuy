import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedProduct = {
  sku: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  weightGrams: number;
  description: string;
  ingredients: string;
  forWhom: string;
  warning: string;
  imageUrl: string;
};

const products = JSON.parse(
  readFileSync(join(__dirname, 'hollyshop-products.json'), 'utf8'),
) as SeedProduct[];

const authors = [
  { slug: 'masha', name: 'Маша' },
  { slug: 'anna', name: 'Анна' },
  { slug: 'lina', name: 'Лина' },
];

async function main() {
  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: { name: author.name },
      create: author,
    });
  }

  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
