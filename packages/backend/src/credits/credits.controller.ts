import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditDecayService } from './credit-decay.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RequireEmailVerification } from '../common/decorators/require-email-verification.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GrantCreditsDto } from './dto/grant-credits.dto';
import { SpendCreditsDto } from './dto/spend-credits.dto';
import { UserRole } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(
    private creditsService: CreditsService,
    private creditDecayService: CreditDecayService,
  ) {}

  @ApiOperation({ summary: 'Get user credit balance and level' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req) {
    return this.creditsService.getBalance(req.user.userId);
  }

  @ApiOperation({ summary: 'Get earning statistics' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getEarningStats(@Request() req) {
    return this.creditsService.getEarningStats(req.user.userId);
  }

  @ApiOperation({ summary: 'Get credit transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['earning', 'spending'] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('type') type?: 'earning' | 'spending',
  ) {
    return this.creditsService.getTransactions(req.user.userId, { limit, offset, type });
  }

  @ApiOperation({ summary: 'Get earning opportunities' })
  @Get('opportunities')
  getEarningOpportunities() {
    return this.creditsService.getEarningOpportunities();
  }

  @ApiOperation({ summary: 'Get credits leaderboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.creditsService.getLeaderboard(limit);
  }

  @ApiOperation({ summary: 'Grant credits to user (admin only)' })
  @ApiBearerAuth()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 grants per minute
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('grant')
  async grantCredits(@Request() req, @Body() grantCreditsDto: GrantCreditsDto) {
    return this.creditsService.grantCredits(
      grantCreditsDto.userId,
      grantCreditsDto.amount,
      grantCreditsDto.reason,
      grantCreditsDto.relatedId,
      grantCreditsDto.description,
    );
  }

  @ApiOperation({ summary: 'Spend credits' })
  @ApiBearerAuth()
  @RequireEmailVerification()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post('spend')
  async spendCredits(@Request() req, @Body() spendCreditsDto: SpendCreditsDto) {
    return this.creditsService.spendCredits(
      req.user.userId,
      spendCreditsDto.amount,
      spendCreditsDto.reason,
      spendCreditsDto.relatedId,
      spendCreditsDto.description,
    );
  }

  @ApiOperation({ summary: 'Get decay statistics' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('decay/stats')
  async getDecayStats() {
    return this.creditDecayService.getDecayStats();
  }

  @ApiOperation({ summary: 'Run manual decay (admin only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('decay/run')
  async runManualDecay() {
    return this.creditDecayService.runManualDecay();
  }
}
