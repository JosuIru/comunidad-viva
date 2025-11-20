import { IsString, IsEnum, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum IntegrationPlatform {
  TELEGRAM = 'TELEGRAM',
  WHATSAPP_BUSINESS = 'WHATSAPP_BUSINESS',
  DISCORD = 'DISCORD',
  SIGNAL = 'SIGNAL',
  SLACK = 'SLACK',
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Community ID' })
  @IsString()
  communityId: string;

  @ApiProperty({
    description: 'Integration platform',
    enum: IntegrationPlatform,
  })
  @IsEnum(IntegrationPlatform)
  platform: IntegrationPlatform;

  @ApiProperty({ description: 'Channel or chat ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: 'Channel or chat name', required: false })
  @IsString()
  @IsOptional()
  channelName?: string;

  @ApiProperty({ description: 'Bot token for authentication' })
  @IsString()
  botToken: string;

  @ApiProperty({ description: 'Auto-publish new content', default: false })
  @IsBoolean()
  @IsOptional()
  autoPublish?: boolean = false;

  @ApiProperty({ description: 'Content categories to publish', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[] = [];

  @ApiProperty({ description: 'Publish offers', default: true })
  @IsBoolean()
  @IsOptional()
  publishOffers?: boolean = true;

  @ApiProperty({ description: 'Publish events', default: true })
  @IsBoolean()
  @IsOptional()
  publishEvents?: boolean = true;

  @ApiProperty({ description: 'Publish needs', default: true })
  @IsBoolean()
  @IsOptional()
  publishNeeds?: boolean = true;
}
