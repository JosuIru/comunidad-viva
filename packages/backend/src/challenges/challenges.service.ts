import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeedType, CreditReason } from '@prisma/client';
import { ViralFeaturesService } from '../engagement/viral-features.service';

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private viralFeaturesService: ViralFeaturesService,
  ) {}

  async getTodayChallenge() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await this.prisma.dailySeed.findUnique({
      where: { date: today },
      include: {
        completions: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!challenge) {
      // Create a new challenge for today
      const newChallenge = await this.createDailyChallenge(today);
      // Fetch it again with completions included
      challenge = await this.prisma.dailySeed.findUnique({
        where: { date: today },
        include: {
          completions: {
            select: {
              userId: true,
            },
          },
        },
      });
    }

    return challenge;
  }

  async getTodayChallengeForUser(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let challenge = await this.prisma.dailySeed.findUnique({
      where: { date: today },
      include: {
        completions: {
          where: {
            userId,
          },
        },
      },
    });

    if (!challenge) {
      await this.createDailyChallenge(today);
      // Refetch with user completions
      challenge = await this.prisma.dailySeed.findUnique({
        where: { date: today },
        include: {
          completions: {
            where: {
              userId,
            },
          },
        },
      });
    }

    return {
      ...challenge,
      completed: challenge.completions.length > 0,
    };
  }

  async completeChallenge(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await this.prisma.dailySeed.findUnique({
      where: { date: today },
    });

    if (!challenge) {
      throw new NotFoundException('No challenge available for today');
    }

    // Check if user already completed today's challenge
    const existingCompletion = await this.prisma.userDailySeedCompletion.findUnique({
      where: {
        userId_dailySeedId: {
          userId,
          dailySeedId: challenge.id,
        },
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('You have already completed today\'s challenge');
    }

    // Get user's current credits
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    // Create completion record and award credits
    const [completion] = await this.prisma.$transaction([
      this.prisma.userDailySeedCompletion.create({
        data: {
          userId,
          dailySeedId: challenge.id,
          creditsAwarded: challenge.creditsReward,
        },
      }),
      this.prisma.dailySeed.update({
        where: { id: challenge.id },
        data: {
          participantsCount: {
            increment: 1,
          },
        },
      }),
      this.prisma.User.update({
        where: { id: userId },
        data: {
          credits: {
            increment: challenge.creditsReward,
          },
          experience: {
            increment: 5,
          },
        },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: challenge.creditsReward,
          balance: user.credits + challenge.creditsReward,
          reason: CreditReason.DAILY_SEED,
          description: `Completado: ${challenge.challenge}`,
          relatedId: challenge.id,
        },
      }),
    ]);

    // Check for level up
    const levelUp = await this.viralFeaturesService.checkLevelUp(userId);

    return {
      success: true,
      creditsAwarded: challenge.creditsReward,
      message: `¡Felicidades! Has ganado ${challenge.creditsReward} créditos`,
      levelUp,
    };
  }

  private async createDailyChallenge(date: Date) {
    const challenges = this.getChallengePool();
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    return this.prisma.dailySeed.create({
      data: {
        date,
        type: randomChallenge.type,
        challenge: randomChallenge.challenge,
        description: randomChallenge.description,
        creditsReward: randomChallenge.creditsReward,
      },
    });
  }

  private getChallengePool() {
    return [
      {
        type: SeedType.GREETING,
        challenge: 'Saluda a 3 vecinos nuevos',
        description: 'Rompe el hielo y conecta con tu comunidad',
        creditsReward: 5,
      },
      {
        type: SeedType.SHARING,
        challenge: 'Comparte algo que no uses',
        description: 'Ofrece un objeto o habilidad en el marketplace',
        creditsReward: 5,
      },
      {
        type: SeedType.HELPING,
        challenge: 'Ayuda a alguien con una tarea',
        description: 'Ofrece tu tiempo o conocimiento a un vecino',
        creditsReward: 5,
      },
      {
        type: SeedType.LEARNING,
        challenge: 'Aprende algo nuevo de un vecino',
        description: 'Participa en un intercambio de conocimientos',
        creditsReward: 5,
      },
      {
        type: SeedType.CONNECTING,
        challenge: 'Conecta a dos personas que puedan ayudarse',
        description: 'Facilita una nueva conexión comunitaria',
        creditsReward: 5,
      },
      {
        type: SeedType.ECO_ACTION,
        challenge: 'Realiza una acción ecológica',
        description: 'Participa en una limpieza o acción sostenible',
        creditsReward: 5,
      },
    ];
  }
}
