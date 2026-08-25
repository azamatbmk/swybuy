import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OSSETIA_CITIES } from '../../lib/ossetia';

function emptyToUndefined({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export class OrderItemDto {
  @IsString()
  @MaxLength(64)
  sku: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  ref?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  customerName: string;

  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9()\-\s]{10,20}$/)
  phone: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsIn([...OSSETIA_CITIES])
  city?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  street?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  house?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsOptional()
  @IsIn(['pochta'])
  deliveryType?: 'pochta';

  @IsOptional()
  @IsIn(['cash'])
  paymentMethod?: 'cash';
}

export class OrderAccessDto {
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  token: string;
}
