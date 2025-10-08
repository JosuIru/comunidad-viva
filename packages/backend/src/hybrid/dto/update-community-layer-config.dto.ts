import { IsEnum, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { EconomicLayer } from '@prisma/client';

export class UpdateCommunityLayerConfigDto {
  @IsOptional()
  @IsEnum(EconomicLayer)
  defaultLayer?: EconomicLayer;

  @IsOptional()
  @IsBoolean()
  allowMixedMode?: boolean;

  @IsOptional()
  @IsBoolean()
  autoGiftDays?: boolean;

  @IsOptional()
  @IsBoolean()
  autoDebtAmnesty?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  giftThreshold?: number; // Percentage to propose full migration to GIFT_PURE
}
