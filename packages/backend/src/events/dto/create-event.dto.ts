import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  VIRTUAL = 'VIRTUAL',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
}

export class CreateEventDto {
  @ApiProperty({ example: 'Taller de Compostaje' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Aprende a hacer compost en casa' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2025-12-01T10:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2025-12-01T12:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ example: 'Calle Mayor 1, Madrid' })
  @IsString()
  address: string;

  @ApiProperty({ example: 40.4168 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -3.7038 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiProperty({ example: 'WORKSHOP', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: EventType, required: false })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsReward?: number;

  @ApiProperty({ example: ['compostaje', 'sostenibilidad'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: ['Mayor de 18 años'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  offerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
