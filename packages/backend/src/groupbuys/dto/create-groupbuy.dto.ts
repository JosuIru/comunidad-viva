import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsArray, ValidateNested, Min, IsLatitude, IsLongitude } from 'class-validator';

class PriceBreakDto {
  @ApiProperty({ description: 'Minimum quantity for this price tier', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiProperty({ description: 'Price per unit at this tier' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @ApiProperty({ description: 'Savings percentage compared to base price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  savings: number;
}

export class CreateGroupBuyDto {
  @ApiProperty({ description: 'Offer ID for the group buy' })
  @IsNotEmpty()
  @IsString()
  offerId: string;

  @ApiProperty({ description: 'Minimum participants required', minimum: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(2)
  minParticipants: number;

  @ApiProperty({ description: 'Maximum participants allowed', minimum: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(2)
  maxParticipants: number;

  @ApiProperty({ description: 'Deadline for joining' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  deadline: Date;

  @ApiProperty({ description: 'Pickup point latitude' })
  @IsNotEmpty()
  @IsLatitude()
  pickupLat: number;

  @ApiProperty({ description: 'Pickup point longitude' })
  @IsNotEmpty()
  @IsLongitude()
  pickupLng: number;

  @ApiProperty({ description: 'Pickup point address' })
  @IsNotEmpty()
  @IsString()
  pickupAddress: string;

  @ApiProperty({ description: 'Price breaks for volume discounts', type: [PriceBreakDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceBreakDto)
  priceBreaks: PriceBreakDto[];
}
