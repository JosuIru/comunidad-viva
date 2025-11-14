import { Test, TestingModule } from '@nestjs/testing';
import { ViralFeaturesService } from './viral-features.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ViralFeaturesService', () => {
  let service: ViralFeaturesService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrismaService = {
    onboardingProgress: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    flashDeal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    flashDealRedemption: {
      create: jest.fn(),
    },
    story: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    storyView: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    storyReaction: {
      upsert: jest.fn(),
    },
    swipe: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    offer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    timeBankTransaction: {
      count: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    match: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    weeklyChallenge: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    challengeParticipant: {
      upsert: jest.fn(),
    },
    referralCode: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    referral: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    liveEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    liveEventParticipant: {
      create: jest.fn(),
    },
    microAction: {
      create: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    userFeatureUnlock: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    merchant: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViralFeaturesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<ViralFeaturesService>(ViralFeaturesService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Magic Onboarding', () => {
    describe('trackOnboardingStep', () => {
      it('should track onboarding step and update progress', async () => {
        const userId = 'user-id';
        const step = 3;

        mockPrismaService.onboardingProgress.upsert.mockResolvedValue({
          id: 'progress-id',
          userId,
          currentStep: step,
          completedSteps: JSON.stringify([step]),
          completed: false,
        });

        mockPrismaService.onboardingProgress.findUnique.mockResolvedValue({
          id: 'progress-id',
          userId,
          currentStep: step,
          completedSteps: JSON.stringify([1, 2]),
          completed: false,
        });

        mockPrismaService.onboardingProgress.update.mockResolvedValue({});

        const result = await service.trackOnboardingStep(userId, step);

        expect(result).toBeDefined();
        expect(mockPrismaService.onboardingProgress.upsert).toHaveBeenCalled();
      });

      it('should award credits when onboarding completes (7 steps)', async () => {
        const userId = 'user-id';
        const step = 7;

        mockPrismaService.onboardingProgress.upsert.mockResolvedValue({
          id: 'progress-id',
          userId,
          currentStep: step,
        });

        mockPrismaService.onboardingProgress.findUnique.mockResolvedValue({
          id: 'progress-id',
          userId,
          currentStep: step,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
          completed: false,
        });

        mockPrismaService.onboardingProgress.update.mockResolvedValue({});
        mockPrismaService.User.update.mockResolvedValue({});

        await service.trackOnboardingStep(userId, step);

        expect(mockPrismaService.User.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { credits: { increment: 50 } },
        });
      });
    });

    describe('getOnboardingProgress', () => {
      it('should return onboarding progress', async () => {
        const userId = 'user-id';
        const mockProgress = {
          id: 'progress-id',
          userId,
          currentStep: 4,
          completedSteps: JSON.stringify([1, 2, 3, 4]),
          completed: false,
        };

        mockPrismaService.onboardingProgress.findUnique.mockResolvedValue(mockProgress);

        const result = await service.getOnboardingProgress(userId);

        expect(result).toEqual(mockProgress);
      });
    });
  });

  describe('Flash Deals', () => {
    describe('getActiveFlashDeals', () => {
      it('should return active flash deals', async () => {
        const mockDeals = [
          {
            id: 'deal-1',
            title: '50% OFF',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 3600000),
          },
        ];

        mockPrismaService.flashDeal.findMany.mockResolvedValue(mockDeals);

        const result = await service.getActiveFlashDeals();

        expect(result).toEqual(mockDeals);
        expect(mockPrismaService.flashDeal.findMany).toHaveBeenCalledWith({
          where: {
            status: 'ACTIVE',
            expiresAt: { gt: expect.any(Date) },
          },
          orderBy: { expiresAt: 'asc' },
        });
      });
    });

    describe('redeemFlashDeal', () => {
      it('should redeem flash deal successfully', async () => {
        const userId = 'user-id';
        const dealId = 'deal-id';

        const mockDeal = {
          id: dealId,
          title: '30% OFF',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 3600000),
        };

        mockPrismaService.flashDeal.findUnique.mockResolvedValue(mockDeal);
        mockPrismaService.flashDealRedemption.create.mockResolvedValue({
          id: 'redemption-id',
          userId,
          dealId,
        });

        const result = await service.redeemFlashDeal(userId, dealId);

        expect(result).toBeDefined();
        expect(mockPrismaService.flashDealRedemption.create).toHaveBeenCalled();
      });

      it('should throw error if deal is expired', async () => {
        const userId = 'user-id';
        const dealId = 'deal-id';

        const mockDeal = {
          id: dealId,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() - 3600000), // Expired
        };

        mockPrismaService.flashDeal.findUnique.mockResolvedValue(mockDeal);

        await expect(service.redeemFlashDeal(userId, dealId)).rejects.toThrow(
          'Deal ya no está disponible',
        );
      });
    });
  });

  describe('Stories', () => {
    describe('createStory', () => {
      it('should create a story with 24h expiration', async () => {
        const userId = 'user-id';
        const type = 'IMAGE';
        const content = 'Test story';

        const mockStory = {
          id: 'story-id',
          userId,
          type,
          content,
          expiresAt: new Date(),
          user: {
            id: userId,
            name: 'Test User',
            avatar: null,
            generosityScore: 100,
          },
        };

        mockPrismaService.story.create.mockResolvedValue(mockStory);

        const result = await service.createStory(userId, type, content);

        expect(result).toEqual(mockStory);
        expect(mockPrismaService.story.create).toHaveBeenCalled();
      });
    });

    describe('viewStory', () => {
      it('should create view and increment count', async () => {
        const userId = 'user-id';
        const storyId = 'story-id';

        mockPrismaService.storyView.findUnique.mockResolvedValue(null);
        mockPrismaService.storyView.create.mockResolvedValue({
          id: 'view-id',
          userId,
          storyId,
        });
        mockPrismaService.story.update.mockResolvedValue({});

        await service.viewStory(userId, storyId);

        expect(mockPrismaService.story.update).toHaveBeenCalledWith({
          where: { id: storyId },
          data: { views: { increment: 1 } },
        });
      });

      it('should not increment if already viewed', async () => {
        const userId = 'user-id';
        const storyId = 'story-id';

        mockPrismaService.storyView.findUnique.mockResolvedValue({
          id: 'existing-view',
          userId,
          storyId,
        });

        await service.viewStory(userId, storyId);

        expect(mockPrismaService.story.update).not.toHaveBeenCalled();
      });
    });

    describe('reactToStory', () => {
      it('should create or update reaction', async () => {
        const userId = 'user-id';
        const storyId = 'story-id';
        const emoji = '❤️';

        mockPrismaService.storyReaction.upsert.mockResolvedValue({
          id: 'reaction-id',
          userId,
          storyId,
          reaction: emoji,
        });

        const result = await service.reactToStory(userId, storyId, emoji);

        expect(result.reaction).toBe(emoji);
      });
    });
  });

  describe('Swipe & Match', () => {
    describe('swipeOffer', () => {
      it('should create swipe and check for match', async () => {
        const userId = 'user-id';
        const offerId = 'offer-id';
        const direction = 'RIGHT';

        mockPrismaService.swipe.create.mockResolvedValue({
          id: 'swipe-id',
          userId,
          offerId,
          direction,
        });

        mockPrismaService.Offer.findUnique.mockResolvedValue({
          id: offerId,
          userId: 'other-user-id',
        });

        mockPrismaService.swipe.findFirst.mockResolvedValue(null);

        const result = await service.swipeOffer(userId, offerId, direction);

        expect(result.swipe).toBeDefined();
        expect(result.match).toBeNull();
      });

      it('should create match on reciprocal right swipe', async () => {
        const userId = 'user-id';
        const offerId = 'offer-id';
        const otherUserId = 'other-user-id';

        mockPrismaService.swipe.create.mockResolvedValue({
          id: 'swipe-id',
          userId,
          offerId,
          direction: 'RIGHT',
        });

        mockPrismaService.Offer.findUnique.mockResolvedValue({
          id: offerId,
          userId: otherUserId,
        });

        mockPrismaService.swipe.findFirst.mockResolvedValue({
          id: 'reciprocal-swipe',
          userId: otherUserId,
          direction: 'RIGHT',
        });

        mockPrismaService.match.create.mockResolvedValue({
          id: 'match-id',
          user1Id: userId,
          user2Id: otherUserId,
        });

        const result = await service.swipeOffer(userId, offerId, 'RIGHT');

        expect(result.match).toBeDefined();
        expect(mockEventEmitter.emit).toHaveBeenCalledWith('match.created', expect.any(Object));
      });
    });
  });

  describe('Referrals', () => {
    describe('createReferralCode', () => {
      it('should create referral code for user', async () => {
        const userId = 'user-id';

        mockPrismaService.referralCode.findFirst.mockResolvedValue(null);
        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          name: 'TestUser',
        });
        mockPrismaService.referralCode.create.mockResolvedValue({
          id: 'code-id',
          userId,
          code: 'TES123ABC',
          rewardForReferrer: 100,
          rewardForReferred: 50,
          referrals: [],
        });

        const result = await service.createReferralCode(userId);

        expect(result).toBeDefined();
        expect(mockPrismaService.referralCode.create).toHaveBeenCalled();
      });

      it('should return existing code if already created', async () => {
        const userId = 'user-id';
        const existingCode = {
          id: 'code-id',
          userId,
          code: 'EXISTING',
          referrals: [],
        };

        mockPrismaService.referralCode.findFirst.mockResolvedValue(existingCode);

        const result = await service.createReferralCode(userId);

        expect(result).toEqual(existingCode);
        expect(mockPrismaService.referralCode.create).not.toHaveBeenCalled();
      });
    });

    describe('useReferralCode', () => {
      it('should use referral code and reward both users', async () => {
        const newUserId = 'new-user-id';
        const code = 'REF123';
        const referrerUserId = 'referrer-id';

        mockPrismaService.referralCode.findUnique.mockResolvedValue({
          id: 'code-id',
          userId: referrerUserId,
          code,
          rewardForReferrer: 100,
          rewardForReferred: 50,
        });

        mockPrismaService.referral.findFirst.mockResolvedValue(null);
        mockPrismaService.referral.create.mockResolvedValue({
          id: 'referral-id',
          codeId: 'code-id',
          referredUserId: newUserId,
        });
        mockPrismaService.User.update.mockResolvedValue({});
        mockPrismaService.referralCode.update.mockResolvedValue({});

        await service.useReferralCode(newUserId, code);

        expect(mockPrismaService.User.update).toHaveBeenCalledTimes(2);
        expect(mockPrismaService.referralCode.update).toHaveBeenCalled();
      });

      it('should throw error if code already used', async () => {
        const newUserId = 'new-user-id';
        const code = 'REF123';

        mockPrismaService.referralCode.findUnique.mockResolvedValue({
          id: 'code-id',
          code,
        });

        mockPrismaService.referral.findFirst.mockResolvedValue({
          id: 'existing-referral',
          referredUserId: newUserId,
        });

        await expect(service.useReferralCode(newUserId, code)).rejects.toThrow(
          'Ya usaste un código de referido',
        );
      });
    });

    describe('getReferralStats', () => {
      it('should return referral statistics', async () => {
        const userId = 'user-id';

        mockPrismaService.referralCode.findFirst.mockResolvedValue({
          id: 'code-id',
          userId,
          usedCount: 3,
          rewardForReferrer: 100,
          referrals: [
            { id: '1', referredUser: { level: 2 } },
            { id: '2', referredUser: { level: 1 } },
            { id: '3', referredUser: { level: 3 } },
          ],
        });

        const stats = await service.getReferralStats(userId);

        expect(stats.totalReferrals).toBe(3);
        expect(stats.activeReferrals).toBe(2); // level > 1
        expect(stats.totalRewards).toBe(300);
      });
    });
  });

  describe('Level System', () => {
    describe('checkLevelUp', () => {
      it('should level up user and award credits', async () => {
        const userId = 'user-id';

        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          experience: 400, // level 2
          level: 1,
          credits: 50,
        });

        mockPrismaService.User.update.mockResolvedValue({});
        mockPrismaService.userFeatureUnlock.create.mockResolvedValue({});
        mockPrismaService.creditTransaction.create.mockResolvedValue({});
        mockPrismaService.notification.create.mockResolvedValue({});

        const result = await service.checkLevelUp(userId);

        expect(result).toBeDefined();
        expect(result.level).toBe(2);
        expect(result.credits).toBe(20); // 2 * 10
        expect(mockPrismaService.User.update).toHaveBeenCalled();
      });

      it('should return null if no level up', async () => {
        const userId = 'user-id';

        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          experience: 50,
          level: 1,
        });

        const result = await service.checkLevelUp(userId);

        expect(result).toBeNull();
      });
    });

    describe('getLevelProgress', () => {
      it('should calculate level progress correctly', async () => {
        const userId = 'user-id';

        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          level: 2,
          experience: 500,
        });

        const result = await service.getLevelProgress(userId);

        expect(result).toBeDefined();
        expect(result.currentLevel).toBe(2);
        expect(result.next).toBe(3);
        expect(result.progress).toBeGreaterThanOrEqual(0);
        expect(result.progress).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Credits & Rewards', () => {
    describe('grantCredits', () => {
      it('should grant credits and create transaction', async () => {
        const userId = 'user-id';
        const amount = 50;
        const reason = 'Test reward';

        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          credits: 100,
        });

        mockPrismaService.User.update.mockResolvedValue({});
        mockPrismaService.creditTransaction.create.mockResolvedValue({});

        await service.grantCredits(userId, amount, reason);

        expect(mockPrismaService.User.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { credits: 150 },
        });

        expect(mockPrismaService.creditTransaction.create).toHaveBeenCalled();
      });

      it('should throw error if user not found', async () => {
        const userId = 'non-existent';

        mockPrismaService.User.findUnique.mockResolvedValue(null);

        await expect(service.grantCredits(userId, 50)).rejects.toThrow('User not found');
      });
    });

    describe('awardBadge', () => {
      it('should award badge and grant credits', async () => {
        const userId = 'user-id';
        const badgeType = 'HELPER_10';

        mockPrismaService.userBadge.findUnique.mockResolvedValue(null);
        mockPrismaService.userBadge.create.mockResolvedValue({
          id: 'badge-id',
          userId,
          badgeType,
        });
        mockPrismaService.notification.create.mockResolvedValue({});
        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          credits: 100,
        });
        mockPrismaService.User.update.mockResolvedValue({});
        mockPrismaService.creditTransaction.create.mockResolvedValue({});

        const result = await service.awardBadge(userId, badgeType);

        expect(result).toBeDefined();
        expect(mockPrismaService.userBadge.create).toHaveBeenCalled();
      });

      it('should return existing badge if already awarded', async () => {
        const userId = 'user-id';
        const badgeType = 'HELPER_10';
        const existingBadge = { id: 'badge-id', userId, badgeType };

        mockPrismaService.userBadge.findUnique.mockResolvedValue(existingBadge);

        const result = await service.awardBadge(userId, badgeType);

        expect(result).toEqual(existingBadge);
        expect(mockPrismaService.userBadge.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('Notifications', () => {
    describe('createNotification', () => {
      it('should create notification', async () => {
        const userId = 'user-id';
        const data = {
          type: 'INFO',
          title: 'Test Notification',
          body: 'This is a test',
        };

        mockPrismaService.notification.create.mockResolvedValue({
          id: 'notification-id',
          userId,
          ...data,
          read: false,
        });

        const result = await service.createNotification(userId, data);

        expect(result).toBeDefined();
        expect(mockPrismaService.notification.create).toHaveBeenCalled();
      });
    });

    describe('sendMassNotification', () => {
      it('should send notification to active users', async () => {
        const mockUsers = [
          { id: 'user-1' },
          { id: 'user-2' },
          { id: 'user-3' },
        ];

        mockPrismaService.User.findMany.mockResolvedValue(mockUsers);
        mockPrismaService.notification.createMany.mockResolvedValue({ count: 3 });

        const result = await service.sendMassNotification({
          title: 'Test',
          body: 'Mass notification',
        });

        expect(result.sent).toBe(3);
        expect(mockPrismaService.notification.createMany).toHaveBeenCalled();
      });
    });
  });

  describe('Weekly Challenge', () => {
    describe('getCurrentChallenge', () => {
      it('should return current active challenge', async () => {
        const mockChallenge = {
          id: 'challenge-id',
          title: 'Weekly Challenge',
          startsAt: new Date(Date.now() - 3600000),
          endsAt: new Date(Date.now() + 3600000),
          participations: [],
        };

        mockPrismaService.weeklyChallenge.findFirst.mockResolvedValue(mockChallenge);

        const result = await service.getCurrentChallenge();

        expect(result).toEqual(mockChallenge);
      });
    });

    describe('updateChallengeProgress', () => {
      it('should update or create participation', async () => {
        const userId = 'user-id';
        const challengeId = 'challenge-id';
        const score = 10;

        mockPrismaService.challengeParticipant.upsert.mockResolvedValue({
          id: 'participation-id',
          userId,
          challengeId,
          progress: score,
        });

        const result = await service.updateChallengeProgress(userId, challengeId, score);

        expect(result).toBeDefined();
        expect(mockPrismaService.challengeParticipant.upsert).toHaveBeenCalled();
      });
    });
  });

  describe('Micro Actions', () => {
    describe('rewardMicroAction', () => {
      it('should reward micro action and check level up', async () => {
        const userId = 'user-id';
        const action = 'profile_view';
        const reward = 1;

        mockPrismaService.microAction.create.mockResolvedValue({
          id: 'action-id',
          userId,
          action,
          reward,
        });

        mockPrismaService.User.update.mockResolvedValue({});
        mockPrismaService.User.findUnique.mockResolvedValue({
          id: userId,
          experience: 100,
          level: 1,
        });

        const result = await service.rewardMicroAction(userId, action, reward);

        expect(result.microAction).toBeDefined();
        expect(mockPrismaService.User.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: {
            credits: { increment: reward },
            experience: { increment: reward },
            dailyActions: { increment: 1 },
          },
        });
      });
    });
  });
});
