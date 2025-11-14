import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

@Injectable()
export class Web3AuthService {
  private readonly logger = new Logger(Web3AuthService.name);
  private nonces: Map<string, { nonce: string; expiresAt: Date }> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Cleanup expired nonces every 5 minutes
    setInterval(() => this.cleanupExpiredNonces(), 5 * 60 * 1000);
  }

  /**
   * Generate a nonce for wallet signature
   */
  async requestNonce(walletAddress: string, walletType: string): Promise<{ nonce: string; message: string }> {
    const normalizedAddress = walletAddress.toLowerCase();

    // Generate random nonce
    const nonce = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Store nonce with 5 minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.nonces.set(normalizedAddress, { nonce, expiresAt });

    // Create message to sign
    const message = `Comunidad Viva - Autenticación\n\nFirma este mensaje para autenticarte de forma segura.\n\nWallet: ${normalizedAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

    return { nonce, message };
  }

  /**
   * Verify wallet signature and authenticate/register user
   */
  async verifySignature(
    walletAddress: string,
    signature: string,
    walletType: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT',
    userInfo?: { name?: string; email?: string },
  ): Promise<{ access_token: string; user: any; isNewUser: boolean }> {
    const normalizedAddress = walletAddress.toLowerCase();

    // Get stored nonce
    const nonceData = this.nonces.get(normalizedAddress);
    if (!nonceData) {
      throw new UnauthorizedException('Nonce not found. Please request a new nonce.');
    }

    // Check nonce expiration
    if (new Date() > nonceData.expiresAt) {
      this.nonces.delete(normalizedAddress);
      throw new UnauthorizedException('Nonce expired. Please request a new nonce.');
    }

    // Reconstruct message
    const message = `Comunidad Viva - Autenticación\n\nFirma este mensaje para autenticarte de forma segura.\n\nWallet: ${normalizedAddress}\nNonce: ${nonceData.nonce}\nTimestamp: ${new Date(nonceData.expiresAt.getTime() - 5 * 60 * 1000).toISOString()}`;

    // Verify signature based on wallet type
    let isValid = false;
    if (walletType === 'METAMASK' || walletType === 'WALLETCONNECT') {
      isValid = await this.verifyEthereumSignature(message, signature, normalizedAddress);
    } else if (walletType === 'PHANTOM') {
      isValid = await this.verifySolanaSignature(message, signature, walletAddress);
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Clear used nonce
    this.nonces.delete(normalizedAddress);

    // Check if user exists with this wallet
    let user = await this.prisma.user.findFirst({
      where: {
        walletAddress: normalizedAddress,
      },
    });

    let isNewUser = false;

    if (!user) {
      // Register new user with wallet
      isNewUser = true;

      // Generate unique username if not provided
      const username = userInfo?.name || `user_${normalizedAddress.substring(0, 8)}`;
      const email = userInfo?.email || `${normalizedAddress}@wallet.comunidadviva.local`;

      user = await this.prisma.user.create({
        data: {
          name: username,
          email: email,
          password: '', // Empty password for wallet-only auth
          walletAddress: normalizedAddress,
          walletType: walletType,
          role: 'CITIZEN',
          isEmailVerified: false, // Wallet auth doesn't verify email
        },
      });

      // Create initial wallet balance in DID system if federation is enabled
      // This will be handled by the DID service when user accesses federation features
    }

    // Generate JWT
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        walletType: user.walletType,
      },
      isNewUser,
    };
  }

  /**
   * Link wallet to existing authenticated user
   */
  async linkWallet(
    userId: string,
    walletAddress: string,
    signature: string,
    walletType: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT',
  ): Promise<any> {
    const normalizedAddress = walletAddress.toLowerCase();

    // Check if wallet is already linked to another user
    const existingWallet = await this.prisma.user.findFirst({
      where: {
        walletAddress: normalizedAddress,
        id: { not: userId },
      },
    });

    if (existingWallet) {
      throw new BadRequestException('This wallet is already linked to another account');
    }

    // Verify signature
    const nonceData = this.nonces.get(normalizedAddress);
    if (!nonceData) {
      throw new UnauthorizedException('Nonce not found. Please request a new nonce.');
    }

    const message = `Comunidad Viva - Link Wallet\n\nWallet: ${normalizedAddress}\nNonce: ${nonceData.nonce}`;

    let isValid = false;
    if (walletType === 'METAMASK' || walletType === 'WALLETCONNECT') {
      isValid = await this.verifyEthereumSignature(message, signature, normalizedAddress);
    } else if (walletType === 'PHANTOM') {
      isValid = await this.verifySolanaSignature(message, signature, walletAddress);
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    this.nonces.delete(normalizedAddress);

    // Update user with wallet info
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress: normalizedAddress,
        walletType: walletType,
      },
    });

    return {
      message: 'Wallet linked successfully',
      walletAddress: updatedUser.walletAddress,
      walletType: updatedUser.walletType,
    };
  }

  /**
   * Verify Ethereum (MetaMask/WalletConnect) signature
   */
  private async verifyEthereumSignature(
    message: string,
    signature: string,
    expectedAddress: string,
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      this.logger.error('Ethereum signature verification failed', error.stack, { expectedAddress });
      return false;
    }
  }

  /**
   * Verify Solana (Phantom) signature
   */
  private async verifySolanaSignature(
    message: string,
    signature: string,
    publicKey: string,
  ): Promise<boolean> {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(publicKey);

      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes,
      );
    } catch (error) {
      this.logger.error('Solana signature verification failed', error.stack, { publicKey });
      return false;
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<any> {
    const normalizedAddress = walletAddress.toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        walletAddress: normalizedAddress,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
        walletType: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Cleanup expired nonces
   */
  private cleanupExpiredNonces(): void {
    const now = new Date();
    for (const [address, data] of this.nonces.entries()) {
      if (now > data.expiresAt) {
        this.nonces.delete(address);
      }
    }
  }
}
