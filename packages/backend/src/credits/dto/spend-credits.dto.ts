import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditReason } from '@prisma/client';

export class SpendCreditsDto {
  @ApiProperty({ description: 'Amount of credits to spend', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Reason for spending credits', enum: CreditReason })
  @IsNotEmpty()
  @IsEnum(CreditReason)
  reason: CreditReason;

  @ApiPropertyOptional({ description: 'Related entity ID (offer, event, etc.)' })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;
}
