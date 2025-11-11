import {
  IsString,
  IsNumber,
  IsEnum,
  IsEthereumAddress,
  Min,
  Max,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BridgeChain } from '../bridge.service';

export class LockBridgeDto {
  @ApiProperty({
    description: 'User DID in format did:gailu:nodeId:userId',
    example: 'did:gailu:node123:user456',
  })
  @IsString()
  @Matches(/^did:gailu:[a-zA-Z0-9-]+:[a-zA-Z0-9-]+$/, {
    message: 'Invalid DID format. Must be did:gailu:nodeId:userId',
  })
  userDID: string;

  @ApiProperty({
    description: 'Amount of SEMILLA to bridge',
    example: 100,
    minimum: 0.01,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(0.01, { message: 'Minimum amount is 0.01 SEMILLA' })
  @Max(1000000, { message: 'Maximum amount is 1,000,000 SEMILLA per transaction' })
  amount: number;

  @ApiProperty({
    description: 'Target blockchain network',
    enum: BridgeChain,
    example: BridgeChain.POLYGON,
  })
  @IsEnum(BridgeChain, {
    message: 'Invalid target chain. Must be one of: POLYGON, SOLANA, ARBITRUM, OPTIMISM',
  })
  targetChain: BridgeChain;

  @ApiProperty({
    description: 'External wallet address on target chain',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  externalAddress: string;

  @ApiProperty({
    description: 'Optional nonce for replay protection',
    example: '0x1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{16}$/, {
    message: 'Nonce must be a hex string of 16 characters (8 bytes)',
  })
  nonce?: string;
}

export class UnlockBridgeDto {
  @ApiProperty({
    description: 'User DID requesting unlock',
    example: 'did:gailu:node123:user456',
  })
  @IsString()
  @Matches(/^did:gailu:[a-zA-Z0-9-]+:[a-zA-Z0-9-]+$/)
  userDID: string;

  @ApiProperty({
    description: 'Amount to unlock',
    example: 100,
  })
  @IsNumber()
  @Min(0.01)
  @Max(1000000)
  amount: number;

  @ApiProperty({
    description: 'Source chain where tokens were burned',
    enum: BridgeChain,
  })
  @IsEnum(BridgeChain)
  sourceChain: BridgeChain;

  @ApiProperty({
    description: 'Burn transaction hash on external chain',
    example: '0x1234...abcd',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Invalid transaction hash format',
  })
  burnTxHash: string;

  @ApiProperty({
    description: 'Signature proving ownership',
    example: '0xabcd...1234',
  })
  @IsString()
  signature: string;
}
