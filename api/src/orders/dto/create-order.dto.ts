import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

function emptyToUndefined({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class OrderItemDto {
  @IsString()
  sku: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  ref?: string;

  @IsString()
  @MinLength(2)
  customerName: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  phone?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  street?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  house?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  deliveryType?: string;
}
