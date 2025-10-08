import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', maxLength: 1000 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}
