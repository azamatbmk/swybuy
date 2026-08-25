import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SaveAuthorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  handle: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(80)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
      : [],
  )
  skus?: string[];
}
