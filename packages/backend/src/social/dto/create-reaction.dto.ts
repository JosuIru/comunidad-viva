import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';

export class CreateReactionDto {
  @ApiProperty({ description: 'Reaction type', enum: ReactionType })
  @IsNotEmpty()
  @IsEnum(ReactionType)
  type: ReactionType;
}
