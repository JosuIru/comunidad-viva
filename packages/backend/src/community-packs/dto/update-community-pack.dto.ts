import { IsOptional, IsBoolean, IsInt, IsString, IsObject, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommunityPackDto {
  @ApiProperty({
    example: true,
    description: 'Whether setup is completed',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  setupCompleted?: boolean;

  @ApiProperty({
    example: 75,
    description: 'Setup progress percentage (0-100)',
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  setupProgress?: number;

  @ApiProperty({
    example: 'configure_orders',
    description: 'Current setup step key',
    required: false
  })
  @IsOptional()
  @IsString()
  currentStep?: string;

  @ApiProperty({
    example: ['orders', 'pickup', 'producers'],
    description: 'Features to enable',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiProperty({
    example: { orderFrequency: 'WEEKLY', pickupDay: 'Friday' },
    description: 'Pack-specific configuration',
    required: false
  })
  @IsOptional()
  @IsObject()
  customConfig?: Record<string, any>;

  @ApiProperty({
    example: ['basic_info', 'invite_members'],
    description: 'List of completed guide keys',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedGuides?: string[];

  @ApiProperty({
    example: 'user-id-123',
    description: 'ID of assigned mentor user',
    required: false
  })
  @IsOptional()
  @IsString()
  assignedMentor?: string;
}
