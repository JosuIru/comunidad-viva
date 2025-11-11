import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TwoFactorService } from './two-factor.service';
import { Web3AuthService } from './web3-auth.service';
import { EmailVerificationService } from './email-verification.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLoggerService } from '../common/audit-logger.service';
import { AdvancedSanitizerService } from '../common/advanced-sanitizer.service';
import { WinstonLoggerModule } from '../common/winston-logger.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    WinstonLoggerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    TwoFactorService,
    Web3AuthService,
    EmailVerificationService,
    JwtStrategy,
    LocalStrategy,
    EmailVerifiedGuard,
    AuditLoggerService,
    AdvancedSanitizerService,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    TwoFactorService,
    Web3AuthService,
    EmailVerificationService,
    EmailVerifiedGuard,
    AuditLoggerService,
    AdvancedSanitizerService,
  ],
})
export class AuthModule {}
