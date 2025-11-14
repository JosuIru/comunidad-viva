import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  // In-memory store for verification tokens (production should use Redis)
  private verificationTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Cleanup expired tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 3600000);
  }

  /**
   * Generate a verification token for a user
   */
  async generateVerificationToken(userId: string, email: string): Promise<string> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store with 24 hour expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    this.verificationTokens.set(token, {
      userId,
      email,
      expiresAt,
    });

    return token;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const tokenData = this.verificationTokens.get(token);

    if (!tokenData) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    if (new Date() > tokenData.expiresAt) {
      this.verificationTokens.delete(token);
      throw new BadRequestException('Token de verificación expirado. Solicita uno nuevo.');
    }

    // Update user's email verification status
    await this.prisma.User.update({
      where: { id: tokenData.userId },
      data: { 
        emailVerified: true,
        isEmailVerified: true, // For wallet users too
      },
    });

    // Delete used token
    this.verificationTokens.delete(token);

    return {
      success: true,
      message: 'Email verificado exitosamente',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.User.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Generate new token
    const token = await this.generateVerificationToken(user.id, user.email);

    // TODO: Send email with verification link
    // Token should be sent via email service when implemented

    return {
      success: true,
      message: 'Email de verificación enviado',
    };
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    return user?.emailVerified || false;
  }

  /**
   * Cleanup expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();

    for (const [token, data] of this.verificationTokens.entries()) {
      if (now > data.expiresAt) {
        this.verificationTokens.delete(token);
      }
    }
  }

  /**
   * Get pending verification count (for monitoring)
   */
  getPendingVerificationsCount(): number {
    return this.verificationTokens.size;
  }
}
