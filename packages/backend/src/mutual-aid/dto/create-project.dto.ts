import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ enum: ProjectType })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiProperty({ example: 'Huerto comunitario' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Crear un espacio verde para cultivar alimentos orgánicos' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Un espacio donde la comunidad pueda aprender y compartir' })
  @IsString()
  vision: string;

  @ApiProperty({ example: 'Madrid, España' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'España' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Madrid', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  beneficiaries?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetEur?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCredits?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHours?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volunteersNeeded?: number;

  @ApiProperty({ example: 6, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedMonths?: number;

  @ApiProperty({ example: ['Producir 500kg de verduras', 'Capacitar a 50 personas'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  impactGoals?: string[];

  @ApiProperty({ example: [2, 11, 12], required: false, description: 'Sustainable Development Goals (SDG) numbers 1-17' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(17, { each: true })
  sdgGoals?: number[];

  @ApiProperty({ example: ['agricultura', 'sostenibilidad', 'comunidad'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  communityId?: string;
}
