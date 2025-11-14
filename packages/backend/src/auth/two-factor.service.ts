import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLoggerService } from '../common/winston-logger.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new WinstonLoggerService('TwoFactorService');

  constructor(private prisma: PrismaService) {}

  /**
   * Generate 2FA secret and QR code for setup
   */
  async generateTwoFactorSecret(userId: string): Promise<TwoFactorSetup> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { email: true, name: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Comunidad Viva (${user.email})`,
      issuer: 'Comunidad Viva',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    this.logger.debug('2FA secret generated', { userId, email: user.email });

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA for a user after verifying the TOTP token
   */
  async enableTwoFactor(
    userId: string,
    secret: string,
    token: string,
    backupCodes: string[],
  ): Promise<void> {
    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (!isValid) {
      this.logger.warn('Invalid 2FA token during setup', { userId });
      throw new UnauthorizedException('Invalid verification code');
    }

    // Hash backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // Save to database
    await this.prisma.User.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes,
      },
    });

    this.logger.security('2FA enabled', { userId });
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify current token before disabling
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      this.logger.warn('Invalid 2FA token during disable', { userId });
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.prisma.User.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    this.logger.security('2FA disabled', { userId });
  }

  /**
   * Verify a 2FA token for a user
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
        backupCodes: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Try TOTP verification first
    const isValidTotp = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (isValidTotp) {
      this.logger.debug('2FA TOTP verified', { userId });
      return true;
    }

    // If TOTP failed, try backup codes
    for (let i = 0; i < user.backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(token, user.backupCodes[i]);
      if (isMatch) {
        // Remove used backup code
        const updatedCodes = user.backupCodes.filter((_, index) => index !== i);
        await this.prisma.User.update({
          where: { id: userId },
          data: { backupCodes: updatedCodes },
        });

        this.logger.security('2FA backup code used', { userId, codesRemaining: updatedCodes.length });
        return true;
      }
    }

    this.logger.warn('Invalid 2FA token', { userId });
    return false;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Regenerate backup codes (requires 2FA token verification)
   */
  async regenerateBackupCodes(userId: string, token: string): Promise<string[]> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(8);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    await this.prisma.User.update({
      where: { id: userId },
      data: { backupCodes: hashedBackupCodes },
    });

    this.logger.security('Backup codes regenerated', { userId });

    return backupCodes;
  }

  /**
   * Check if user has 2FA enabled
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return user?.twoFactorEnabled || false;
  }
}
