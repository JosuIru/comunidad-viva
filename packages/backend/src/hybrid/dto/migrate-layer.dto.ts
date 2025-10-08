import { IsEnum, IsString, IsOptional } from 'class-validator';
import { EconomicLayer } from '@prisma/client';

export class MigrateLayerDto {
  @IsEnum(EconomicLayer)
  toLayer: EconomicLayer;

  @IsOptional()
  @IsString()
  reason?: string;
}
