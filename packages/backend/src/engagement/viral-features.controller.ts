import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ViralFeaturesService } from './viral-features.service';
import { Throttle } from '@nestjs/throttler';

@Controller('viral-features')
@UseGuards(JwtAuthGuard)
export class ViralFeaturesController {
  constructor(private readonly viralFeaturesService: ViralFeaturesService) {}

  /**
   * ONBOARDING
   */
  @Get('onboarding/progress')
  async getOnboardingProgress(@Request() req) {
    return this.viralFeaturesService.getOnboardingProgress(req.user.userId);
  }

  @Post('onboarding/track')
  async trackOnboardingStep(
    @Request() req,
    @Body() body: { step: number },
  ) {
    return this.viralFeaturesService.trackOnboardingStep(
      req.user.userId,
      body.step,
    );
  }

  /**
   * FLASH DEALS
   */
  @Get('flash-deals')
  async getActiveFlashDeals() {
    return this.viralFeaturesService.getActiveFlashDeals();
  }

  // Alias for frontend compatibility
  @Get('flash-deals/active')
  async getActiveFlashDealsAlias() {
    const deals = await this.viralFeaturesService.getActiveFlashDeals();
    return { deals: deals || [] };
  }

  @Post('flash-deals/:id/redeem')
  async redeemFlashDeal(@Request() req, @Param('id') dealId: string) {
    return this.viralFeaturesService.redeemFlashDeal(req.user.userId, dealId);
  }

  // Alias for frontend compatibility
  @Post('flash-deals/claim/:id')
  async claimFlashDeal(@Request() req, @Param('id') dealId: string) {
    return this.viralFeaturesService.redeemFlashDeal(req.user.userId, dealId);
  }

  /**
   * HAPPY HOUR
   */
  @Get('happy-hour/status')
  async getHappyHourStatus() {
    // Check if there's an active happy hour
    // For now, return a basic response - can be enhanced with DB lookup
    return {
      active: false,
      multiplier: 1,
      message: 'No hay Happy Hour activo en este momento',
    };
  }

  /**
   * STORIES
   */
  @Get('stories')
  async getActiveStories(@Request() req) {
    return this.viralFeaturesService.getActiveStories(req.user.userId);
  }

  @Post('stories')
  async createStory(
    @Request() req,
    @Body()
    body: {
      type: 'OFFER' | 'TRANSACTION' | 'ACHIEVEMENT' | 'CUSTOM';
      content: string;
      media?: string;
    },
  ) {
    return this.viralFeaturesService.createStory(
      req.user.userId,
      body.type,
      body.content,
      body.media,
    );
  }

  @Post('stories/:id/view')
  async viewStory(@Request() req, @Param('id') storyId: string) {
    return this.viralFeaturesService.viewStory(req.user.userId, storyId);
  }

  @Post('stories/:id/react')
  async reactToStory(
    @Request() req,
    @Param('id') storyId: string,
    @Body() body: { emoji: string },
  ) {
    return this.viralFeaturesService.reactToStory(
      req.user.userId,
      storyId,
      body.emoji,
    );
  }

  /**
   * SWIPE & MATCH
   */
  @Get('swipe/offers')
  async getSwipeableOffers(@Request() req, @Query('limit') limit?: string) {
    return this.viralFeaturesService.getSwipeableOffers(
      req.user.userId,
      limit ? parseInt(limit) : 10,
    );
  }

  // Alias for frontend compatibility
  @Get('swipe/cards')
  async getSwipeCards(@Request() req, @Query('limit') limit?: string) {
    const offers = await this.viralFeaturesService.getSwipeableOffers(
      req.user.userId,
      limit ? parseInt(limit) : 10,
    );
    return { cards: offers };
  }

  @Post('swipe')
  async swipeOffer(
    @Request() req,
    @Body()
    body: {
      offerId: string;
      direction: 'LEFT' | 'RIGHT' | 'SUPER';
    },
  ) {
    return this.viralFeaturesService.swipeOffer(
      req.user.userId,
      body.offerId,
      body.direction,
    );
  }

  // Alias for frontend compatibility
  @Post('swipe/action')
  async swipeAction(
    @Request() req,
    @Body()
    body: {
      cardId: string;
      action: 'LIKE' | 'DISLIKE' | 'SUPER_LIKE';
    },
  ) {
    // Map frontend actions to backend directions
    const directionMap = {
      LIKE: 'RIGHT' as const,
      DISLIKE: 'LEFT' as const,
      SUPER_LIKE: 'SUPER' as const,
    };
    return this.viralFeaturesService.swipeOffer(
      req.user.userId,
      body.cardId,
      directionMap[body.action],
    );
  }

  @Get('matches')
  async getUserMatches(@Request() req) {
    return this.viralFeaturesService.getUserMatches(req.user.userId);
  }

  // Alias for frontend compatibility
  @Get('swipe/matches')
  async getSwipeMatches(@Request() req) {
    const matches = await this.viralFeaturesService.getUserMatches(req.user.userId);
    return { matches };
  }

  @Get('swipe/stats')
  async getSwipeStats(@Request() req) {
    // Return basic stats - can be enhanced later
    const matches = await this.viralFeaturesService.getUserMatches(req.user.userId);
    return {
      totalSwipes: 0,           // TODO: implement
      likes: 0,                 // TODO: implement
      matches: matches.length || 0,
      superLikesRemaining: 3,   // TODO: implement daily limit logic
    };
  }

  /**
   * WEEKLY CHALLENGES
   */
  @Get('challenges/current')
  async getCurrentChallenge() {
    return this.viralFeaturesService.getCurrentChallenge();
  }

  @Post('challenges/:id/progress')
  async updateChallengeProgress(
    @Request() req,
    @Param('id') challengeId: string,
    @Body() body: { score: number },
  ) {
    return this.viralFeaturesService.updateChallengeProgress(
      req.user.userId,
      challengeId,
      body.score,
    );
  }

  /**
   * REFERRALS
   */
  @Get('referral/code')
  async getReferralCode(@Request() req) {
    return this.viralFeaturesService.getReferralCode(req.user.userId);
  }

  @Post('referral/use')
  async useReferralCode(@Request() req, @Body() body: { code: string }) {
    return this.viralFeaturesService.useReferralCode(
      req.user.userId,
      body.code,
    );
  }

  /**
   * SUGGESTIONS
   */
  @Get('suggestions')
  async getPersonalizedSuggestions(@Request() req) {
    return this.viralFeaturesService.getPersonalizedSuggestions(
      req.user.userId,
    );
  }

  /**
   * LIVE EVENTS
   */
  @Get('live-events')
  async getActiveLiveEvents() {
    return this.viralFeaturesService.getActiveLiveEvents();
  }

  @Post('live-events/:id/join')
  async joinLiveEvent(@Request() req, @Param('id') eventId: string) {
    return this.viralFeaturesService.joinLiveEvent(req.user.userId, eventId);
  }

  /**
   * MICRO ACTIONS
   */
  @Post('micro-action')
  async rewardMicroAction(
    @Request() req,
    @Body()
    body: {
      action: string;
      reward: number;
    },
  ) {
    return this.viralFeaturesService.rewardMicroAction(
      req.user.userId,
      body.action,
      body.reward,
    );
  }

  /**
   * LEVELS & PROGRESSION
   */
  @Get('level/progress')
  async getLevelProgress(@Request() req) {
    return this.viralFeaturesService.getLevelProgress(req.user.userId);
  }

  @Get('streak')
  async getDailyStreak(@Request() req) {
    const streak = await this.viralFeaturesService.getDailyStreak(req.user.userId);
    return { streak };
  }

  /**
   * ADMIN - MANUAL CRON TRIGGERS
   */
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 admin actions per minute
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/create-flash-deals')
  async adminCreateFlashDeals() {
    return this.viralFeaturesService.createFlashDeals();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/activate-happy-hour')
  async adminActivateHappyHour() {
    return this.viralFeaturesService.activateHappyHour();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/create-weekly-challenge')
  async adminCreateWeeklyChallenge() {
    return this.viralFeaturesService.createWeeklyChallenge();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/clean-expired-stories')
  async adminCleanExpiredStories() {
    return this.viralFeaturesService.cleanExpiredStories();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/reset-daily-actions')
  async adminResetDailyActions() {
    return this.viralFeaturesService.resetDailyActions();
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/update-streaks')
  async adminUpdateStreaks() {
    return this.viralFeaturesService.updateActiveStreaks();
  }
}
