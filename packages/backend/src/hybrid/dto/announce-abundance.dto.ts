import { IsString, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';

export class AnnounceAbundanceDto {
  @IsString()
  what: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsString()
  where: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;

  @IsOptional()
  @IsArray()
  visibleToLayers?: string[];
}
