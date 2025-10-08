import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostType, Visibility } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ example: '¡Hola comunidad! Comparto esta experiencia...', description: 'Content of the post' })
  @IsString()
  content: string;

  @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false, description: 'Array of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ enum: PostType, example: PostType.STORY, description: 'Type of post' })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ enum: Visibility, example: Visibility.PUBLIC, required: false, description: 'Post visibility', default: Visibility.PUBLIC })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiProperty({ example: ['comunidad', 'ayuda'], required: false, description: 'Tags for the post' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: ['user-id-1', 'user-id-2'], required: false, description: 'User IDs mentioned in the post' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false, description: 'Related offer ID if this post is about an offer' })
  @IsOptional()
  @IsUUID()
  relatedOfferId?: string;

  @ApiProperty({ example: 40.4168, required: false, description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: -3.7038, required: false, description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
