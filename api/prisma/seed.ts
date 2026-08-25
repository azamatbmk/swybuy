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
  { slug: 'masha', name: 'Маша', handle: 'masha' },
  { slug: 'anna', name: 'Анна', handle: 'anna' },
  { slug: 'lina', name: 'Лина', handle: 'lina' },
];

async function main() {
  for (const author of authors) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: { name: author.name, handle: author.handle },
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
