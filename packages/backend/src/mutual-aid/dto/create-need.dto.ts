import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NeedScope, NeedType, ResourceType } from '@prisma/client';

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateNeedDto {
  @ApiProperty({ enum: NeedScope })
  @IsEnum(NeedScope)
  scope: NeedScope;

  @ApiProperty({ enum: NeedType })
  @IsEnum(NeedType)
  type: NeedType;

  @ApiProperty({ example: 'Ayuda con reparación del tejado' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Necesitamos ayuda para reparar goteras en el tejado comunitario' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Madrid, España' })
  @IsString()
  location: string;

  @ApiProperty({ enum: UrgencyLevel })
  @IsEnum(UrgencyLevel)
  urgencyLevel: UrgencyLevel;

  @ApiProperty({ enum: ResourceType, isArray: true, example: ['MONEY', 'TIME'] })
  @IsArray()
  @IsEnum(ResourceType, { each: true })
  resourceTypes: ResourceType[];

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetEur?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCredits?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHours?: number;

  @ApiProperty({ example: ['Carpintería', 'Fontanería'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  neededSkills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityId?: string;
}
