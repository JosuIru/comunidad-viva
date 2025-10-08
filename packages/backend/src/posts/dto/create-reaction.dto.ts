import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';

export class CreateReactionDto {
  @ApiProperty({
    enum: ReactionType,
    example: ReactionType.THANKS,
    description: 'Type of reaction to add/toggle',
    enumName: 'ReactionType'
  })
  @IsEnum(ReactionType)
  type: ReactionType;
}
