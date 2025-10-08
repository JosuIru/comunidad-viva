import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OfferType } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty({ example: 'Bicicleta en buen estado' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Bicicleta de montaña, poco uso, perfecta para ciudad' })
  @IsString()
  description: string;

  @ApiProperty({ enum: OfferType, example: 'PRODUCT' })
  @IsEnum(OfferType)
  type: OfferType;

  @ApiProperty({ example: 'Transporte' })
  @IsString()
  category: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEur?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceCredits?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 40.4168, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: -3.7038, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({ example: 'Calle Mayor 1, Madrid', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: ['bicicleta', 'transporte', 'ecológico'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}
