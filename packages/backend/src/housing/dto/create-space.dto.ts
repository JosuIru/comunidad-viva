import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpaceType, ExchangeType } from '@prisma/client';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Sala de reuniones compartida' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Espacio amplio con pizarra y proyector' })
  @IsString()
  description: string;

  @ApiProperty({ enum: SpaceType })
  @IsEnum(SpaceType)
  type: SpaceType;

  @ApiProperty({ example: 'Calle Mayor 1, Madrid' })
  @IsString()
  address: string;

  @ApiProperty({ example: 40.4168 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -3.7038 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @ApiProperty({ example: ['WiFi', 'Cocina', 'Baño'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ example: ['Proyector', 'Pizarra'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @ApiProperty({ example: ['Lunes', 'Martes', 'Miércoles'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiProperty({ enum: ExchangeType })
  @IsEnum(ExchangeType)
  exchangeType: ExchangeType;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerHour?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsPerHour?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursPerHour?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minBookingHours?: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxBookingHours?: number;

  @ApiProperty({ example: ['No fumar', 'Dejar limpio'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minReputation?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  availableHours?: any;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
