import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Type of entity being reviewed', enum: ['offer', 'user', 'event'] })
  @IsNotEmpty()
  @IsString()
  reviewType: string;

  @ApiProperty({ description: 'ID of the entity being reviewed' })
  @IsNotEmpty()
  @IsString()
  reviewedEntityId: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Transaction ID if review is related to a transaction', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
