import { IsString, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { BridgeEventType, EconomicLayer } from '@prisma/client';

export class CreateBridgeEventDto {
  @IsEnum(BridgeEventType)
  type: BridgeEventType;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(EconomicLayer)
  forceLayer?: EconomicLayer;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsString()
  frequency?: string; // "FIRST_SUNDAY", "EQUINOX", etc.

  @IsOptional()
  @IsString()
  communityId?: string;
}
