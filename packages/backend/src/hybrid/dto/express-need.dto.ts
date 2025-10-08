import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

export class ExpressNeedDto {
  @IsString()
  what: string;

  @IsOptional()
  @IsString()
  why?: string;

  @IsOptional()
  @IsString()
  where?: string;

  @IsOptional()
  @IsEnum(['URGENT', 'SOON', 'WHENEVER'])
  urgency?: string;

  @IsOptional()
  @IsArray()
  visibleToLayers?: string[];

  @IsOptional()
  anonymous?: boolean; // Si es true, no se registra requesterId
}
