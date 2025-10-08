import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateParticipationDto {
  @ApiPropertyOptional({ description: 'Updated quantity', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Commit to purchase' })
  @IsOptional()
  @IsBoolean()
  committed?: boolean;
}
