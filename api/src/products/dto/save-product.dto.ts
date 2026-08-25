import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const IMAGE_PATH = /^\/products\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp|svg|gif)$/i;

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  sku: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weightGrams?: number;

  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  ingredients?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  forWhom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  warning?: string;

  @IsString()
  @Matches(IMAGE_PATH, {
    message: 'Фото — путь вида /products/имя.jpg',
  })
  imageUrl: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  sku?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weightGrams?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  ingredients?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  forWhom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  warning?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE_PATH, {
    message: 'Фото — путь вида /products/имя.jpg',
  })
  imageUrl?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}
