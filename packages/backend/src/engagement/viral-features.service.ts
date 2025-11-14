import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ViralFeaturesService {
  private readonly logger = new Logger(ViralFeaturesService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * 1. MAGIC ONBOARDING
   */
  async trackOnboardingStep(userId: string, step: number) {
    const progress = await this.prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        currentStep: step,
        completedSteps: JSON.stringify([step]),
        completed: false,
      },
      update: {
        currentStep: step,
      },
    });

    // Get existing progress to update completed steps
    const existing = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (existing) {
      const completedSteps = JSON.parse(existing.completedSteps as string || '[]');
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
        await this.prisma.onboardingProgress.update({
          where: { userId },
          data: { completedSteps: JSON.stringify(completedSteps) },
        });
      }

      // Check if completed (7 steps)
      if (completedSteps.length >= 7 && !existing.completed) {
        await this.prisma.onboardingProgress.update({
          where: { userId },
          data: { completed: true },
        });

        // Reward 50 credits
        await this.prisma.User.update({
          where: { id: userId },
          data: { credits: { increment: 50 } },
        });

        this.logger.log(`User ${userId} completed onboarding! 🎉`);
      }
    }

    return progress;
  }

  async getOnboardingProgress(userId: string) {
    return this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });
  }

  /**
   * 2. FLASH DEALS
   */
  async getActiveFlashDeals() {
    const deals = await this.prisma.flashDeal.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return deals;
  }

  async redeemFlashDeal(userId: string, dealId: string) {
    const deal = await this.prisma.flashDeal.findUnique({ where: { id: dealId } });

    if (!deal || deal.status !== 'ACTIVE' || deal.expiresAt < new Date()) {
      throw new Error('Deal ya no está disponible');
    }

    // Create redemption
    const redemption = await this.prisma.flashDealRedemption.create({
      data: {
        dealId,
        userId,
      },
    });

    return redemption;
  }

  /**
   * 3. STORIES
   */
  async createStory(userId: string, type: string, content: string, media?: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await this.prisma.story.create({
      data: {
        userId,
        type: type as any,
        content,
        media,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
      },
    });

    return story;
  }

  async getActiveStories(currentUserId?: string) {
    const stories = await this.prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        reactions: {
          select: {
            id: true,
            reaction: true,
            userId: true,
          },
        },
        viewers: currentUserId ? { where: { userId: currentUserId } } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return stories;
  }

  async viewStory(userId: string, storyId: string) {
    // Check if already viewed
    const existing = await this.prisma.storyView.findUnique({
      where: {
        storyId_userId: { storyId, userId },
      },
    });

    if (existing) {
      return existing;
    }

    const view = await this.prisma.storyView.create({
      data: { storyId, userId },
    });

    // Increment view count
    await this.prisma.story.update({
      where: { id: storyId },
      data: { views: { increment: 1 } },
    });

    return view;
  }

  async reactToStory(userId: string, storyId: string, emoji: string) {
    const reaction = await this.prisma.storyReaction.upsert({
      where: {
        storyId_userId: { storyId, userId },
      },
      create: {
        storyId,
        userId,
        reaction: emoji,
      },
      update: {
        reaction: emoji,
      },
    });

    return reaction;
  }

  /**
   * 4. SWIPE & MATCH
   */
  async getSwipeableOffers(userId: string, limit = 10) {
    // Get offers the user hasn't swiped yet
    const swipedOfferIds = await this.prisma.swipe
      .findMany({
        where: { userId },
        select: { offerId: true },
      })
      .then((swipes) => swipes.map((s) => s.offerId));

    const offers = await this.prisma.Offer.findMany({
      where: {
        id: { notIn: swipedOfferIds },
        status: 'ACTIVE',
        userId: { not: userId }, // Excluir ofertas propias
      },
      include: {
        User: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Transformar las ofertas en tarjetas de perfil enriquecidas
    const cards = await Promise.all(
      offers.map(async (offer) => {
        // Contar ofertas activas del usuario
        const activeOffersCount = await this.prisma.Offer.count({
          where: {
            userId: offer.userId,
            status: 'ACTIVE',
          },
        });

        // Contar transacciones completadas
        const completedTransactionsCount = await this.prisma.timeBankTransaction.count({
          where: {
            OR: [
              { providerId: offer.userId },
              { requesterId: offer.userId },
            ],
            status: 'COMPLETED',
          },
        });

        // Obtener badges del usuario
        const userBadges = await this.prisma.userBadge.findMany({
          where: { userId: offer.userId },
          take: 5,
        });

        // Mapear badges a emojis
        const badgeEmojiMap: Record<string, string> = {
          FIRST_OFFER: '🎯',
          SOCIAL_BUTTERFLY: '🦋',
          HELPER: '🤝',
          GENEROUS: '💝',
          EXPERT: '⭐',
          COMMUNITY_BUILDER: '🏘️',
          TIME_BANKER: '⏰',
          EVENT_ORGANIZER: '📅',
          EARLY_ADOPTER: '🚀',
          ACTIVE_MEMBER: '💪',
        };

        // Calcular tasa de respuesta (simulada, puede mejorarse con datos reales)
        const responseRate = completedTransactionsCount > 0 ? 95 : 100;

        // Calcular reputación basada en generosityScore
        const reputation = offer.User.generosityScore
          ? Math.min(5, Math.max(1, offer.User.generosityScore / 20))
          : 4.5;

        // Generar intereses ficticios basados en la categoría de la oferta
        const interests = [offer.category];

        // Simular idiomas (puede mejorarse con datos reales del perfil)
        const languages = ['Español'];

        // Simular disponibilidad
        const availability = 'Fines de semana';

        return {
          id: offer.id,
          userId: offer.userId,
          userName: offer.User.name,
          avatar: offer.User.avatar || undefined,
          bio: offer.User.bio || `Miembro activo de la comunidad ofreciendo ${offer.title}`,
          interests: interests.filter(Boolean),
          helpOffered: [offer.title],
          helpNeeded: [], // Puede extenderse consultando otras ofertas del tipo "REQUEST"
          mutualConnections: 0, // TODO: Implementar lógica de conexiones mutuas
          level: offer.User.level || 1,
          credits: offer.User.credits || 0,
          reputation: reputation,
          location: 'No especificada', // El modelo User no tiene campo location
          joinedDate: offer.User.createdAt.toISOString(),
          activeOffersCount,
          completedTransactionsCount,
          badges: userBadges.map(ub => badgeEmojiMap[ub.badgeType] || '🏅').filter(Boolean),
          languages,
          availability,
          responseRate,
        };
      }),
    );

    return cards;
  }

  async swipeOffer(userId: string, offerId: string, direction: 'LEFT' | 'RIGHT' | 'SUPER') {
    const swipe = await this.prisma.swipe.create({
      data: {
        userId,
        offerId,
        direction,
      },
    });

    // If RIGHT or SUPER, check for match
    if (direction === 'RIGHT' || direction === 'SUPER') {
      const offer = await this.prisma.Offer.findUnique({
        where: { id: offerId },
        select: { userId: true },
      });

      if (offer) {
        // Check for reciprocal swipe
        const reciprocalSwipe = await this.prisma.swipe.findFirst({
          where: {
            userId: offer.userId,
            direction: { in: ['RIGHT', 'SUPER'] },
            offer: {
              userId: userId,
            },
          },
        });

        if (reciprocalSwipe) {
          // Create match!
          const match = await this.prisma.match.create({
            data: {
              user1Id: userId,
              user2Id: offer.userId,
              offerId,
              isSuper: direction === 'SUPER',
            },
          });

          this.eventEmitter.emit('match.created', { match, userId, otherUserId: offer.userId });

          return { swipe, match };
        }
      }
    }

    return { swipe, match: null };
  }

  async getUserMatches(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 5. WEEKLY CHALLENGES
   */
  async getCurrentChallenge() {
    return this.prisma.weeklyChallenge.findFirst({
      where: {
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                generosityScore: true,
              },
            },
          },
          orderBy: { progress: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updateChallengeProgress(userId: string, challengeId: string, score: number) {
    const participation = await this.prisma.challengeParticipant.upsert({
      where: {
        challengeId_userId: { challengeId, userId },
      },
      create: {
        challengeId,
        userId,
        progress: score,
      },
      update: {
        progress: { increment: score },
      },
    });

    return participation;
  }

  /**
   * 6. REFERRALS
   */
  async createReferralCode(userId: string) {
    const existing = await this.prisma.referralCode.findFirst({
      where: { userId },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    const code = `${user.name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return this.prisma.referralCode.create({
      data: {
        userId,
        code,
        rewardForReferrer: 100,
        rewardForReferred: 50,
        bonusOnFirstTransaction: 25,
      },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  async getReferralCode(userId: string) {
    let code = await this.prisma.referralCode.findFirst({
      where: { userId },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!code) {
      code = await this.createReferralCode(userId);
    }

    return code;
  }

  async useReferralCode(newUserId: string, code: string) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      throw new Error('Código de referido inválido');
    }

    const existingReferral = await this.prisma.referral.findFirst({
      where: { referredUserId: newUserId },
    });

    if (existingReferral) {
      throw new Error('Ya usaste un código de referido');
    }

    const referral = await this.prisma.referral.create({
      data: {
        codeId: referralCode.id,
        referredUserId: newUserId,
      },
    });

    // Reward both users
    await this.prisma.User.update({
      where: { id: referralCode.userId },
      data: { credits: { increment: referralCode.rewardForReferrer } },
    });

    await this.prisma.User.update({
      where: { id: newUserId },
      data: { credits: { increment: referralCode.rewardForReferred } },
    });

    await this.prisma.referralCode.update({
      where: { id: referralCode.id },
      data: { usedCount: { increment: 1 } },
    });

    return referral;
  }

  async getReferralStats(userId: string) {
    const referralCode = await this.prisma.referralCode.findFirst({
      where: { userId },
      include: {
        referrals: {
          include: {
            referredUser: true,
          },
        },
      },
    });

    if (!referralCode) {
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewards: 0,
        currentTier: 'Iniciado',
        nextTierAt: 5,
      };
    }

    const totalReferrals = referralCode.referrals.length;
    const activeReferrals = referralCode.referrals.filter(
      (r) => r.referredUser && r.referredUser.level > 1,
    ).length;
    const totalRewards = referralCode.usedCount * referralCode.rewardForReferrer;

    // Determine tier based on total referrals
    let currentTier = 'Iniciado';
    let nextTierAt = 5;

    if (totalReferrals >= 50) {
      currentTier = 'Líder Comunitario';
      nextTierAt = 50;
    } else if (totalReferrals >= 15) {
      currentTier = 'Embajador';
      nextTierAt = 50;
    } else if (totalReferrals >= 5) {
      currentTier = 'Conector';
      nextTierAt = 15;
    }

    return {
      totalReferrals,
      activeReferrals,
      totalRewards,
      currentTier,
      nextTierAt,
    };
  }

  async getMyReferrals(userId: string) {
    const referralCode = await this.prisma.referralCode.findFirst({
      where: { userId },
      include: {
        referrals: {
          include: {
            referredUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
                level: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!referralCode) {
      return { referrals: [] };
    }

    const referrals = referralCode.referrals.map((ref) => ({
      id: ref.id,
      referredUserId: ref.referredUserId,
      referredUserName: ref.referredUser?.name || 'Usuario',
      status: ref.referredUser && ref.referredUser.level > 1 ? 'ACTIVE' : 'PENDING',
      rewardEarned: referralCode.rewardForReferrer,
      createdAt: ref.createdAt.toISOString(),
      activatedAt: ref.referredUser && ref.referredUser.level > 1
        ? ref.referredUser.createdAt.toISOString()
        : undefined,
    }));

    return { referrals };
  }

  /**
   * 7. SUGGESTIONS
   */
  async getPersonalizedSuggestions(userId: string) {
    // Get user's right swipes
    const rightSwipes = await this.prisma.swipe.findMany({
      where: {
        userId,
        direction: { in: ['RIGHT', 'SUPER'] },
      },
      include: {
        offer: {
          select: { category: true },
        },
      },
    });

    const likedCategories = rightSwipes
      .map((s) => s.Offer.category)
      .filter((c) => c);

    // Find similar offers
    const suggestedOffers = await this.prisma.Offer.findMany({
      where: {
        category: { in: likedCategories },
        status: 'ACTIVE',
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
      },
      take: 5,
    });

    return {
      offers: suggestedOffers,
    };
  }

  /**
   * 8. LIVE EVENTS
   */
  async getActiveLiveEvents() {
    return this.prisma.liveEvent.findMany({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async joinLiveEvent(userId: string, eventId: string) {
    const event = await this.prisma.liveEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || event.status !== 'ACTIVE') {
      throw new Error('Evento no disponible');
    }

    const participation = await this.prisma.liveEventParticipant.create({
      data: {
        eventId,
        userId,
      },
    });

    return participation;
  }

  /**
   * 9. MICRO ACTIONS
   */
  async rewardMicroAction(userId: string, action: string, reward: number) {
    const microAction = await this.prisma.microAction.create({
      data: {
        userId,
        action,
        reward,
      },
    });

    await this.prisma.User.update({
      where: { id: userId },
      data: {
        credits: { increment: reward },
        experience: { increment: reward },
        dailyActions: { increment: 1 },
      },
    });

    // Check for level up
    const levelUp = await this.checkLevelUp(userId);

    return { microAction, levelUp };
  }

  // ============================================
  // HELPERS & UTILITIES
  // ============================================

  /**
   * Grant credits to user
   */
  async grantCredits(userId: string, amount: number, reason?: string) {
    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const newBalance = user.credits + amount;

    await this.prisma.User.update({
      where: { id: userId },
      data: {
        credits: newBalance,
      },
    });

    // Log transaction
    await this.prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        balance: newBalance,
        reason: 'SYSTEM_REWARD',
        description: reason || 'System reward',
      },
    });

    this.logger.log(`Granted ${amount} credits to user ${userId}: ${reason}`);
  }

  /**
   * Unlock feature for user
   */
  async unlockFeature(userId: string, feature: string) {
    const unlock = await this.prisma.userFeatureUnlock.create({
      data: {
        userId,
        feature,
        unlockedAt: new Date(),
      },
    });

    await this.createNotification(userId, {
      type: 'FEATURE_UNLOCK',
      title: '🎉 Nueva característica desbloqueada',
      body: `Has desbloqueado: ${feature}`,
    });

    return unlock;
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeType: string) {
    // Check if already has badge
    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeType: { userId, badgeType: badgeType as any },
      },
    });

    if (existing) return existing;

    const badge = await this.prisma.userBadge.create({
      data: {
        userId,
        badgeType: badgeType as any,
      },
    });

    await this.createNotification(userId, {
      type: 'BADGE_EARNED',
      title: '🏆 ¡Insignia ganada!',
      body: `Has conseguido la insignia: ${badgeType}`,
    });

    // Award credits for badge
    await this.grantCredits(userId, 25, `Badge earned: ${badgeType}`);

    return badge;
  }

  /**
   * Check if user leveled up
   */
  async checkLevelUp(userId: string) {
    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    if (!user) return null;

    // Calculate level from experience
    const newLevel = Math.floor(Math.sqrt(user.experience / 100));

    if (newLevel > user.level) {
      // User leveled up!
      await this.prisma.User.update({
        where: { id: userId },
        data: { level: newLevel },
      });

      // Determine what to unlock
      const unlocks = {
        2: 'Stories',
        3: 'Grupos privados',
        5: 'Super Likes ilimitados',
        10: 'Verificación PRO',
        15: 'Eventos premium',
        20: 'Descuentos exclusivos',
      };

      const unlockFeature = unlocks[newLevel];

      if (unlockFeature) {
        await this.unlockFeature(userId, unlockFeature);
      }

      // Reward credits
      const creditReward = newLevel * 10;
      await this.grantCredits(userId, creditReward, `Level ${newLevel} reached`);

      await this.createNotification(userId, {
        type: 'LEVEL_UP',
        title: `🎉 ¡Nivel ${newLevel}!`,
        body: `Has alcanzado el nivel ${newLevel}. +${creditReward} créditos`,
      });

      return {
        level: newLevel,
        unlock: unlockFeature || 'Nuevas características',
        credits: creditReward,
      };
    }

    return null;
  }

  /**
   * Get perks for a specific level
   */
  private getLevelPerks(level: number): string[] {
    const perks: string[] = [];

    if (level >= 1) perks.push('Acceso a la plataforma');
    if (level >= 2) perks.push('Crear ofertas y eventos');
    if (level >= 3) perks.push('Participar en compras grupales');
    if (level >= 4) perks.push('Acceso a chat directo');
    if (level >= 5) perks.push('Badge de miembro activo');
    if (level >= 6) perks.push('Descuento 5% en servicios');
    if (level >= 7) perks.push('Prioridad en eventos');
    if (level >= 8) perks.push('Descuento 10% en servicios');
    if (level >= 9) perks.push('Acceso a eventos premium');
    if (level >= 10) perks.push('Badge VIP exclusivo');
    if (level >= 15) perks.push('Acceso VIP completo');

    return perks;
  }

  /**
   * Get level progress
   */
  async getLevelProgress(userId: string) {
    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    if (!user) return null;

    const currentLevelXP = user.level * user.level * 100;
    const nextLevelXP = (user.level + 1) * (user.level + 1) * 100;
    const progress = ((user.experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return {
      current: user.level,
      currentLevel: user.level,
      next: user.level + 1,
      progress: Math.round(Math.max(0, Math.min(100, progress))),
      currentXP: user.experience,
      xpNeeded: nextLevelXP - user.experience,
      nextLevelXP,
      perks: this.getLevelPerks(user.level),
    };
  }

  /**
   * Get daily streak
   */
  async getDailyStreak(userId: string) {
    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    return user?.activeStreak || 0;
  }

  /**
   * Create notification
   */
  async createNotification(userId: string, data: {
    type: string;
    title: string;
    body: string;
    link?: string;
    image?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: data.type as any,
        title: data.title,
        body: data.body,
        link: data.link,
        read: false,
      },
    });
  }

  /**
   * Send mass notification
   */
  async sendMassNotification(notification: {
    title: string;
    body: string;
    type?: string;
    link?: string;
  }) {
    // Get all active users (active in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await this.prisma.User.findMany({
      where: {
        lastActiveAt: { gte: sevenDaysAgo },
      },
      select: { id: true },
    });

    // Create notifications in batch
    const notifications = activeUsers.map(user => ({
      userId: user.id,
      type: (notification.type || 'ANNOUNCEMENT') as any,
      title: notification.title,
      body: notification.body,
      link: notification.link,
      read: false,
    }));

    await this.prisma.notification.createMany({
      data: notifications,
    });

    this.logger.log(`Sent mass notification to ${activeUsers.length} users: ${notification.title}`);

    return { sent: activeUsers.length };
  }

  /**
   * Notify nearby users (geolocation)
   */
  async notifyNearbyUsers(data: {
    lat: number;
    lng: number;
    radiusKm: number;
    title: string;
    body: string;
    link?: string;
  }) {
    // Find users within radius using PostGIS
    const nearbyUsers = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "User"
      WHERE
        lat IS NOT NULL
        AND lng IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(lng, lat)::geography,
          ST_MakePoint(${data.lng}, ${data.lat})::geography,
          ${data.radiusKm * 1000}
        )
    `;

    const notifications = nearbyUsers.map(user => ({
      userId: user.id,
      type: 'NEARBY_DEAL' as any,
      title: data.title,
      body: data.body,
      link: data.link,
      read: false,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    }

    this.logger.log(`Notified ${nearbyUsers.length} nearby users`);

    return { sent: nearbyUsers.length };
  }

  // ============================================
  // CRON JOBS - AUTOMATED ENGAGEMENT
  // ============================================

  /**
   * Create Flash Deals automatically
   * Runs at 10am, 2pm, 8pm daily
   */
  @Cron('0 10,14,20 * * *')
  async createFlashDeals() {
    this.logger.log('Creating Flash Deals...');

    // Get verified merchants
    const merchants = await this.prisma.merchant.findMany({
      where: { verified: true },
      include: { User: true },
      take: 10,
    });

    if (merchants.length === 0) {
      this.logger.warn('No verified merchants found for Flash Deals');
      return;
    }

    // Select random merchants
    const selectedMerchants = merchants
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    for (const merchant of selectedMerchants) {
      const discount = Math.floor(Math.random() * 30) + 20; // 20-50%
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      const deal = await this.prisma.flashDeal.create({
        data: {
          merchantId: merchant.id,
          title: `${discount}% descuento en ${merchant.businessName}`,
          product: merchant.category || 'Producto general',
          description: this.getRandomDealDescription(merchant.category),
          discount,
          maxRedemptions: 20,
          currentRedemptions: 0,
          expiresAt,
          status: 'ACTIVE',
        },
      });

      // Notify nearby users
      if (merchant.User.lat && merchant.User.lng) {
        await this.notifyNearbyUsers({
          lat: merchant.User.lat,
          lng: merchant.User.lng,
          radiusKm: 5,
          title: `🔥 Flash Deal: ${discount}% OFF`,
          body: `${merchant.businessName} - Solo 2 horas`,
          link: `/flash-deals/${deal.id}`,
        });
      }
    }

    this.logger.log(`Created ${selectedMerchants.length} Flash Deals`);
  }

  /**
   * Activate Happy Hour
   * Runs at 6pm daily
   */
  @Cron('0 18 * * *')
  async activateHappyHour() {
    this.logger.log('Activating Happy Hour...');

    // Create live event for Happy Hour
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 2);

    const happyHour = await this.prisma.liveEvent.create({
      data: {
        type: 'HAPPY_HOUR',
        title: '🎉 Happy Hour: Créditos x2',
        description: 'Durante las próximas 2 horas, todos los intercambios dan el doble de créditos',
        startsAt,
        endsAt,
        status: 'ACTIVE',
        prizes: {
          creditsMultiplier: 2,
          freeDelivery: true,
          bonusOnFirstTransaction: 20,
        },
      },
    });

    // Mass notification
    await this.sendMassNotification({
      title: '🎉 ¡HAPPY HOUR ACTIVA!',
      body: 'Créditos x2 durante las próximas 2 horas. ¡Aprovecha!',
      type: 'HAPPY_HOUR',
      link: `/live-events/${happyHour.id}`,
    });

    this.logger.log('Happy Hour activated');
  }

  /**
   * Create Weekly Challenge
   * Runs every Monday at midnight
   */
  @Cron('0 0 * * 1')
  async createWeeklyChallenge() {
    this.logger.log('Creating Weekly Challenge...');

    const challenges = [
      {
        type: 'HELP_STREAK',
        title: 'Semana Solidaria',
        description: 'Ayuda a 5 personas diferentes esta semana',
        targetValue: 5,
        reward: 100,
      },
      {
        type: 'ECO_WARRIOR',
        title: 'Guerrero Ecológico',
        description: 'Completa 10 acciones sostenibles',
        targetValue: 10,
        reward: 80,
      },
      {
        type: 'CONNECTOR',
        title: 'Super Conector',
        description: 'Conecta con 10 personas nuevas',
        targetValue: 10,
        reward: 120,
      },
      {
        type: 'TRANSACTION_MASTER',
        title: 'Maestro de Intercambios',
        description: 'Completa 15 intercambios exitosos',
        targetValue: 15,
        reward: 150,
      },
    ];

    // Select random challenge
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 7);

    const weeklyChallenge = await this.prisma.weeklyChallenge.create({
      data: {
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        targetValue: challenge.targetValue,
        reward: challenge.reward,
        bonusFirst: 50, // Bonus para los primeros 3
        startsAt,
        endsAt,
      },
    });

    // Mass notification
    await this.sendMassNotification({
      title: '🏆 ¡NUEVO RETO SEMANAL!',
      body: `${challenge.title}: ${challenge.reward} créditos de recompensa`,
      type: 'WEEKLY_CHALLENGE',
      link: `/challenges/${weeklyChallenge.id}`,
    });

    this.logger.log(`Created weekly challenge: ${challenge.title}`);
  }

  /**
   * Clean expired stories
   * Runs daily at 2am
   */
  @Cron('0 2 * * *')
  async cleanExpiredStories() {
    const result = await this.prisma.story.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    this.logger.log(`Cleaned ${result.count} expired stories`);
  }

  /**
   * Reset daily actions counter
   * Runs daily at midnight
   */
  @Cron('0 0 * * *')
  async resetDailyActions() {
    await this.prisma.User.updateMany({
      data: {
        dailyActions: 0,
      },
    });

    this.logger.log('Reset daily actions counter');
  }

  /**
   * Update active streaks
   * Runs daily at 1am
   */
  @Cron('0 1 * * *')
  async updateActiveStreaks() {
    // Users who were active yesterday keep streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Increment streak for active users
    await this.prisma.User.updateMany({
      where: {
        lastActiveAt: {
          gte: yesterday,
          lt: today,
        },
      },
      data: {
        activeStreak: { increment: 1 },
      },
    });

    // Reset streak for inactive users
    await this.prisma.User.updateMany({
      where: {
        lastActiveAt: {
          lt: yesterday,
        },
        activeStreak: { gt: 0 },
      },
      data: {
        activeStreak: 0,
      },
    });

    this.logger.log('Updated active streaks');
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private getRandomDealDescription(category: string): string {
    const descriptions = {
      'FOOD': [
        'Menú del día especial',
        'Descuento en productos frescos',
        'Oferta en productos de temporada',
      ],
      'SERVICES': [
        'Descuento en servicios profesionales',
        'Oferta especial por tiempo limitado',
        'Precio especial para la comunidad',
      ],
      'RETAIL': [
        'Descuento en productos seleccionados',
        'Oferta flash en toda la tienda',
        'Promoción especial de hoy',
      ],
    };

    const categoryDescriptions = descriptions[category] || descriptions['RETAIL'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }
}
