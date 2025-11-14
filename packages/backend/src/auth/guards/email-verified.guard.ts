import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to ensure user's email is verified
 * Use @RequireEmailVerification() decorator to apply
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if email verification is required for this endpoint
    const requiresVerification = this.reflector.getAllAndOverride<boolean>(
      'requireEmailVerification',
      [context.getHandler(), context.getClass()],
    );

    // If not required, allow access
    if (!requiresVerification) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Check if user's email is verified
    const dbUser = await this.prisma.User.findUnique({
      where: { id: user.userId },
      select: { emailVerified: true, email: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    if (!dbUser.emailVerified) {
      throw new ForbiddenException({
        message: 'Debes verificar tu email para realizar esta acción',
        code: 'EMAIL_NOT_VERIFIED',
        email: dbUser.email,
      });
    }

    return true;
  }
}
