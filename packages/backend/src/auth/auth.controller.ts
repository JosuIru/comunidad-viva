import { Controller, Post, Body, UseGuards, Request, Get, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';
import { Web3AuthService } from './web3-auth.service';
import { EmailVerificationService } from './email-verification.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestNonceDto, VerifySignatureDto, LinkWalletDto } from './dto/web3-auth.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private web3AuthService: Web3AuthService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 registrations per hour (stricter to prevent spam accounts)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 login attempts per 15 minutes (anti brute-force)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() body: { twoFactorToken?: string }) {
    return this.authService.login(req.user, body.twoFactorToken);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 refresh attempts per minute
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshAccessToken(body.refresh_token);
  }

  @ApiOperation({ summary: 'Logout user (revoke refresh token)' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('logout')
  async logout(@Body() body: { refresh_token: string }) {
    await this.authService.revokeRefreshToken(body.refresh_token);
    return { message: 'Logged out successfully' };
  }

  // ========== TWO-FACTOR AUTHENTICATION ==========

  @ApiOperation({ summary: 'Setup 2FA - Generate QR code and secret' })
  @ApiResponse({ status: 200, description: '2FA setup initiated' })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  async setupTwoFactor(@Request() req) {
    return this.twoFactorService.generateTwoFactorSecret(req.user.userId);
  }

  @ApiOperation({ summary: 'Enable 2FA - Verify and activate' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 401, description: 'Invalid verification code' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactor(
    @Request() req,
    @Body() body: { secret: string; token: string; backupCodes: string[] },
  ) {
    await this.twoFactorService.enableTwoFactor(
      req.user.userId,
      body.secret,
      body.token,
      body.backupCodes,
    );
    return { message: '2FA enabled successfully' };
  }

  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 401, description: 'Invalid verification code' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disableTwoFactor(@Request() req, @Body() body: { token: string }) {
    await this.twoFactorService.disableTwoFactor(req.user.userId, body.token);
    return { message: '2FA disabled successfully' };
  }

  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated' })
  @ApiResponse({ status: 401, description: 'Invalid verification code' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/regenerate-backup-codes')
  async regenerateBackupCodes(@Request() req, @Body() body: { token: string }) {
    const codes = await this.twoFactorService.regenerateBackupCodes(
      req.user.userId,
      body.token,
    );
    return { backupCodes: codes };
  }

  @ApiOperation({ summary: 'Check if 2FA is enabled' })
  @ApiResponse({ status: 200, description: '2FA status' })
  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  async getTwoFactorStatus(@Request() req) {
    const enabled = await this.twoFactorService.isTwoFactorEnabled(req.user.userId);
    return { twoFactorEnabled: enabled };
  }

  // ========== WEB3 WALLET AUTHENTICATION ==========

  @ApiOperation({ summary: 'Request nonce for Web3 wallet signature (MetaMask/Phantom)' })
  @ApiResponse({ status: 200, description: 'Nonce generated for signature' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 nonce requests per minute
  @Post('web3/request-nonce')
  async requestNonce(@Body() dto: RequestNonceDto) {
    return this.web3AuthService.requestNonce(dto.walletAddress, dto.walletType);
  }

  @ApiOperation({ summary: 'Verify Web3 wallet signature and login/register' })
  @ApiResponse({ status: 200, description: 'User authenticated with wallet' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - Rate limit exceeded' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 verification attempts per minute
  @Post('web3/verify-signature')
  async verifySignature(@Body() dto: VerifySignatureDto) {
    return this.web3AuthService.verifySignature(
      dto.walletAddress,
      dto.signature,
      dto.walletType,
      dto.userInfo,
    );
  }

  @ApiOperation({ summary: 'Link Web3 wallet to existing account' })
  @ApiResponse({ status: 200, description: 'Wallet linked successfully' })
  @ApiResponse({ status: 400, description: 'Wallet already linked to another account' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('web3/link-wallet')
  async linkWallet(@Request() req, @Body() dto: LinkWalletDto) {
    return this.web3AuthService.linkWallet(
      req.user.userId,
      dto.walletAddress,
      dto.signature,
      dto.walletType,
    );
  }

  @ApiOperation({ summary: 'Get user info by wallet address' })
  @ApiResponse({ status: 200, description: 'User information' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('web3/user/:walletAddress')
  async getUserByWallet(@Request() req) {
    return this.web3AuthService.getUserByWallet(req.params.walletAddress);
  }

  // ========================================
  // EMAIL VERIFICATION ENDPOINTS
  // ========================================

  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.emailVerificationService.verifyEmail(body.token);
  }

  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 attempts per 10 minutes (prevent spam)
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.emailVerificationService.resendVerificationEmail(body.email);
  }

  @ApiOperation({ summary: 'Check if user email is verified' })
  @ApiResponse({ status: 200, description: 'Email verification status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('email-verification-status')
  async checkEmailVerification(@Request() req) {
    const isVerified = await this.emailVerificationService.isEmailVerified(req.user.userId);
    return {
      emailVerified: isVerified,
      message: isVerified ? 'Email verificado' : 'Email pendiente de verificación'
    };
  }
}
