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
import { ViralFeaturesService } from './viral-features.service';

@Controller('viral')
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

  @Post('flash-deals/:id/redeem')
  async redeemFlashDeal(@Request() req, @Param('id') dealId: string) {
    return this.viralFeaturesService.redeemFlashDeal(req.user.userId, dealId);
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

  @Get('matches')
  async getUserMatches(@Request() req) {
    return this.viralFeaturesService.getUserMatches(req.user.userId);
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
  @Post('admin/create-flash-deals')
  async adminCreateFlashDeals() {
    return this.viralFeaturesService.createFlashDeals();
  }

  @Post('admin/activate-happy-hour')
  async adminActivateHappyHour() {
    return this.viralFeaturesService.activateHappyHour();
  }

  @Post('admin/create-weekly-challenge')
  async adminCreateWeeklyChallenge() {
    return this.viralFeaturesService.createWeeklyChallenge();
  }

  @Post('admin/clean-expired-stories')
  async adminCleanExpiredStories() {
    return this.viralFeaturesService.cleanExpiredStories();
  }

  @Post('admin/reset-daily-actions')
  async adminResetDailyActions() {
    return this.viralFeaturesService.resetDailyActions();
  }

  @Post('admin/update-streaks')
  async adminUpdateStreaks() {
    return this.viralFeaturesService.updateActiveStreaks();
  }
}
