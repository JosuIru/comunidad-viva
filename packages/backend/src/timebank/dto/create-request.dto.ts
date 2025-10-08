import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({ description: 'Provider user ID' })
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @ApiPropertyOptional({ description: 'Related time bank offer ID' })
  @IsOptional()
  @IsString()
  offerId?: string;

  @ApiProperty({ description: 'Description of the service needed' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Estimated hours', minimum: 0.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  hours: number;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsNotEmpty()
  @IsDateString()
  scheduledFor: string;
}
