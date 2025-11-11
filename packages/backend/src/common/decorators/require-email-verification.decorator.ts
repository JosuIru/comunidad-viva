import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require email verification for a route
 * Use with EmailVerifiedGuard
 *
 * @example
 * @RequireEmailVerification()
 * @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
 * async createOffer() { ... }
 */
export const RequireEmailVerification = () => SetMetadata('requireEmailVerification', true);
