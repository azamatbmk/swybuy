import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const IMAGE_PATH = /^\/products\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp|svg|gif)$/i;

function emptyToNull({ value }: { value: unknown }) {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

  @IsOptional()
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(90)
  discountPercent?: number | null;

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
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(0)
  @Max(90)
  discountPercent?: number | null;

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
  @IsBoolean()
  active?: boolean;
}
