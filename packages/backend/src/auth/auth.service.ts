import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLoggerService } from '../common/winston-logger.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new WinstonLoggerService('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any, twoFactorToken?: string) {
    // Check if 2FA is enabled
    if (user.twoFactorEnabled && !twoFactorToken) {
      this.logger.debug('2FA required for login', { userId: user.id });
      return {
        requires2FA: true,
        temporaryToken: this.generateTemporaryToken(user.id),
      };
    }

    // If 2FA is enabled, verify the token
    if (user.twoFactorEnabled && twoFactorToken) {
      const twoFactorService = new (require('./two-factor.service').TwoFactorService)(this.prisma);
      const isValid = await twoFactorService.verifyTwoFactorToken(user.id, twoFactorToken);

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }

      this.logger.security('2FA verification successful', { userId: user.id });
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    // Generate access token with short expiration
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    });

    // Generate refresh token
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.debug('User logged in successfully', { userId: user.id, email: user.email });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  /**
   * Generate temporary token for 2FA flow (5 minutes)
   */
  private generateTemporaryToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, temp: true },
      { secret: process.env.JWT_SECRET, expiresIn: '5m' }
    );
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }

  /**
   * Generate a new refresh token for a user
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = randomUUID();
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    const expirationDays = this.parseExpirationToDays(
      process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d'
    );
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });

    this.logger.debug('Refresh token generated', { userId });

    return refreshToken;
  }

  /**
   * Validate a refresh token and return the user
   */
  async validateRefreshToken(token: string): Promise<any> {
    // Find all non-revoked, non-expired tokens for potential match
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    // Check each token for a hash match
    for (const storedToken of tokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) {
        const { password: _, ...userWithoutPassword } = storedToken.user;
        return { refreshTokenId: storedToken.id, user: userWithoutPassword };
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  /**
   * Refresh access token using a valid refresh token
   * Implements token rotation: old token is revoked and new tokens are issued
   */
  async refreshAccessToken(refreshToken: string) {
    const { refreshTokenId, user } = await this.validateRefreshToken(refreshToken);

    // Revoke the old refresh token (token rotation)
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    });

    const newRefreshToken = await this.generateRefreshToken(user.id);

    this.logger.debug('Tokens refreshed successfully', { userId: user.id });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      user,
    };
  }

  /**
   * Revoke a refresh token (logout)
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
      },
    });

    for (const storedToken of tokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });

        this.logger.debug('Refresh token revoked', { tokenId: storedToken.id });
        return;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.debug('Expired tokens cleaned up', { count: result.count });
    return result.count;
  }

  /**
   * Parse expiration string to days
   */
  private parseExpirationToDays(expiration: string): number {
    const match = expiration.match(/^(\d+)([dhms])$/);
    if (!match) return 7; // Default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd': return value;
      case 'h': return value / 24;
      case 'm': return value / (24 * 60);
      case 's': return value / (24 * 60 * 60);
      default: return 7;
    }
  }
}
