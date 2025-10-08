import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetConversationDto {
  @ApiProperty({ example: 'user-id' })
  @IsString()
  userId: string;
}
