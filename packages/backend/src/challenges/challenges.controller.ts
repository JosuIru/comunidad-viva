import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @ApiOperation({ summary: 'Get today\'s challenge' })
  @ApiResponse({ status: 200, description: 'Returns today\'s challenge' })
  @Get('today')
  async getTodayChallenge() {
    return this.challengesService.getTodayChallenge();
  }

  @ApiOperation({ summary: 'Get today\'s challenge for authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns today\'s challenge with completion status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('today/me')
  async getTodayChallengeForUser(@Request() req) {
    return this.challengesService.getTodayChallengeForUser(req.User.userId);
  }

  @ApiOperation({ summary: 'Complete today\'s challenge' })
  @ApiResponse({ status: 201, description: 'Challenge completed successfully' })
  @ApiResponse({ status: 400, description: 'Challenge already completed' })
  @ApiResponse({ status: 404, description: 'No challenge available' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('today/complete')
  async completeChallenge(@Request() req) {
    return this.challengesService.completeChallenge(req.User.userId);
  }
}
