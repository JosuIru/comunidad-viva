import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckInEventDto {
  @ApiProperty({ description: 'QR code token for check-in' })
  @IsNotEmpty()
  @IsString()
  qrToken: string;
}
