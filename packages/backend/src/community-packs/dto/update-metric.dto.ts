import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMetricDto {
  @ApiProperty({
    example: 500,
    description: 'New value for the metric'
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: 'Updated from latest order calculations',
    description: 'Optional note about this update',
    required: false
  })
  @IsOptional()
  @IsString()
  note?: string;
}
