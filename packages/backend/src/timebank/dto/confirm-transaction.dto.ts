import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class ConfirmTransactionDto {
  @ApiPropertyOptional({ description: 'Accept or reject the transaction' })
  @IsOptional()
  @IsBoolean()
  accept?: boolean;
}
