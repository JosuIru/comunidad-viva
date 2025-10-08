import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GrantCreditsDto } from './dto/grant-credits.dto';
import { SpendCreditsDto } from './dto/spend-credits.dto';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

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

  @ApiOperation({ summary: 'Grant credits to user (admin or system)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('grant')
  async grantCredits(@Request() req, @Body() grantCreditsDto: GrantCreditsDto) {
    // TODO: Add admin check or make this internal only
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
  @UseGuards(JwtAuthGuard)
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
}
