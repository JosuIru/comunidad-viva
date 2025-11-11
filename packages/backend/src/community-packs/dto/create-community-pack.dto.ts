import { IsEnum, IsOptional, IsObject, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizedCommunityType } from '@prisma/client';

export class CreateCommunityPackDto {
  @ApiProperty({
    enum: OrganizedCommunityType,
    example: 'CONSUMER_GROUP',
    description: 'Type of organized community pack'
  })
  @IsEnum(OrganizedCommunityType)
  packType: OrganizedCommunityType;

  @ApiProperty({
    example: { orderFrequency: 'WEEKLY', pickupDay: 'Friday' },
    description: 'Pack-specific configuration',
    required: false
  })
  @IsOptional()
  @IsObject()
  customConfig?: Record<string, any>;

  @ApiProperty({
    example: ['orders', 'pickup', 'producers'],
    description: 'Features to enable for this pack',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledFeatures?: string[];

  @ApiProperty({
    example: ['monthly_savings', 'active_members', 'orders_completed'],
    description: 'Metrics to track for this community',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trackingMetrics?: string[];

  @ApiProperty({
    example: { monthly_savings: 500, active_members: 20 },
    description: 'Target goals for metrics',
    required: false
  })
  @IsOptional()
  @IsObject()
  goals?: Record<string, any>;
}
