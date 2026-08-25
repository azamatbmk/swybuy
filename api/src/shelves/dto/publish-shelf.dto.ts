import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PublishShelfDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skus: string[];

  @IsOptional()
  @IsString()
  token?: string;
}

export class UpdateShelfDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skus?: string[];

  @IsString()
  @MinLength(8)
  token: string;
}
