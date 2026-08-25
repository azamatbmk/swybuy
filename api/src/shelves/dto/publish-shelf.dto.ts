import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PublishShelfDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  skus: string[];

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  orderToken: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  token?: string;
}

export class UpdateShelfDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  skus?: string[];

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  token: string;
}
