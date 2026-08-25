import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn([
    'pending',
    'confirmed',
    'paid',
    'packed',
    'shipped',
    'returned',
    'failed',
  ])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  trackNumber?: string;
}
