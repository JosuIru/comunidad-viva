import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, Visibility } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ description: 'Post content', maxLength: 5000 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ description: 'Post type', enum: PostType })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({ description: 'Media URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @ApiPropertyOptional({ description: 'Location (lat,lng)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Visibility', enum: Visibility })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiPropertyOptional({ description: 'Related offer/event ID' })
  @IsOptional()
  @IsString()
  relatedOfferId?: string;

  @ApiPropertyOptional({ description: 'Related event ID' })
  @IsOptional()
  @IsString()
  relatedEventId?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
