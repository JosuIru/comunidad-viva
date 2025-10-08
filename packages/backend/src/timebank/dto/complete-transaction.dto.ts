import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';

export class CompleteTransactionDto {
  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comment about the transaction' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Impact story: best thing about this exchange' })
  @IsOptional()
  @IsString()
  impactStory?: string;

  @ApiPropertyOptional({ description: 'Whether this inspired a chained favor' })
  @IsOptional()
  @IsBoolean()
  chainedFavor?: boolean;
}
