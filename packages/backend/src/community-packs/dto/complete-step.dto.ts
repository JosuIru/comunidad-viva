import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteStepDto {
  @ApiProperty({
    example: 'basic_info',
    description: 'Step key from the pack configuration'
  })
  @IsString()
  stepKey: string;

  @ApiProperty({
    example: { orderFrequency: 'WEEKLY', pickupDay: 'Friday' },
    description: 'Data collected in this step',
    required: false
  })
  @IsOptional()
  @IsObject()
  stepData?: Record<string, any>;
}
