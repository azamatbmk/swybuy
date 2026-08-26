import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Max, Min } from 'class-validator';

export class ShopSettingsDto {
  @IsBoolean()
  globalDiscountOn: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(90)
  globalDiscountPercent: number;
}
