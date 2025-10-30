import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestNonceDto {
  @ApiProperty({
    description: 'Wallet address (Ethereum or Solana)',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Wallet type',
    example: 'METAMASK',
    enum: ['METAMASK', 'PHANTOM', 'WALLETCONNECT'],
  })
  @IsEnum(['METAMASK', 'PHANTOM', 'WALLETCONNECT'])
  @IsNotEmpty()
  walletType: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT';
}

export class VerifySignatureDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Signed message from wallet',
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Wallet type',
    example: 'METAMASK',
  })
  @IsEnum(['METAMASK', 'PHANTOM', 'WALLETCONNECT'])
  @IsNotEmpty()
  walletType: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT';

  @ApiProperty({
    description: 'Optional: User info for registration if new wallet',
    required: false,
  })
  @IsOptional()
  userInfo?: {
    name?: string;
    email?: string;
  };
}

export class LinkWalletDto {
  @ApiProperty({
    description: 'Wallet address to link',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Signed message proving ownership',
    example: '0x...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Wallet type',
    example: 'METAMASK',
  })
  @IsEnum(['METAMASK', 'PHANTOM', 'WALLETCONNECT'])
  @IsNotEmpty()
  walletType: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT';
}
