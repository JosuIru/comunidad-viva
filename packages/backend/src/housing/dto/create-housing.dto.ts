import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HousingType, AccommodationType } from '@prisma/client';

export class CreateHousingDto {
  @ApiProperty({ example: 'Habitación privada en piso compartido' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Habitación luminosa con cama doble' })
  @IsString()
  description: string;

  @ApiProperty({ enum: HousingType })
  @IsEnum(HousingType)
  type: HousingType;

  @ApiProperty({ enum: AccommodationType })
  @IsEnum(AccommodationType)
  accommodationType: AccommodationType;

  @ApiProperty({ example: 'Calle Mayor 1, Madrid' })
  @IsString()
  address: string;

  @ApiProperty({ example: 40.4168 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -3.7038 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  beds: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @ApiProperty({ example: ['WiFi', 'Cocina', 'Lavadora'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minStayDays?: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStayDays?: number;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerNight?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsPerNight?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiProperty({ example: ['No fumar', 'No mascotas'], required: false })
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

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
