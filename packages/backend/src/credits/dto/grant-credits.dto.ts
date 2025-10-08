import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditReason } from '@prisma/client';

export class GrantCreditsDto {
  @ApiProperty({ description: 'User ID to grant credits to' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Amount of credits to grant', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Reason for granting credits', enum: CreditReason })
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
