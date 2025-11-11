import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CommunityType, CommunityVisibility, OrganizedCommunityType } from '@prisma/client';

class OnboardingPackData {
  @IsEnum(OrganizedCommunityType)
  type: OrganizedCommunityType;

  @IsOptional()
  @IsObject()
  setupData?: Record<string, any>;
}

export class CreateCommunityDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @IsEnum(CommunityType)
  type: CommunityType;

  @IsEnum(CommunityVisibility)
  visibility: CommunityVisibility;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  allowExternalOffers?: boolean;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OnboardingPackData)
  onboardingPack?: OnboardingPackData;
}
