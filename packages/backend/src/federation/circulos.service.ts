import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DIDService } from './did.service';
import { CirculoType, CirculoStatus, ParticipacionRole, ParticipacionStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

/**
 * Círculos de Conciencia Service
 *
 * Manages "Consciousness Circles" - spaces for personal and collective transformation.
 * These are the social containers where the evolution of consciousness happens.
 *
 * Based on Ken Wilber's Integral Theory and inspired by practices like:
 * - Authentic Relating circles
 * - Circling practice
 * - Council circles
 * - Mindfulness groups
 * - Deep democracy
 */
@Injectable()
export class CirculosService {
  private readonly logger = new Logger(CirculosService.name);

  constructor(
    private prisma: PrismaService,
    private didService: DIDService,
  ) {}

  /**
   * Create a new Círculo de Conciencia
   */
  async createCirculo(data: {
    name: string;
    description: string;
    level: number; // 1-7
    type: CirculoType;
    facilitatorDID: string;
    maxParticipants?: number;
    isOpen?: boolean;
    requiresInvite?: boolean;
    schedule?: any;
    location?: string;
    language?: string;
    practices?: string[];
  }) {
    if (data.level < 1 || data.level > 7) {
      throw new BadRequestException('Consciousness level must be between 1 and 7');
    }

    const facilitatorParsed = this.didService.parseDID(data.facilitatorDID);
    if (!facilitatorParsed) {
      throw new BadRequestException('Invalid facilitator DID');
    }

    const facilitatorIds = this.didService.isLocalDID(data.facilitatorDID)
      ? [facilitatorParsed.userId]
      : [];

    try {
      const circulo = await this.prisma.circuloConciencia.create({
        data: {
          id: uuidv4(),
          name: data.name,
          description: data.description,
          level: data.level,
          type: data.type,
          facilitatorDID: data.facilitatorDID,
          facilitatorIds,
          maxParticipants: data.maxParticipants,
          isOpen: data.isOpen ?? true,
          requiresInvite: data.requiresInvite ?? false,
          schedule: data.schedule,
          location: data.location,
          language: data.language || 'es',
          practices: data.practices || [],
          updatedAt: new Date(),
        },
      });

      // Add facilitator as participant
      if (facilitatorIds.length > 0) {
        await this.prisma.circuloParticipacion.create({
          data: {
            id: randomUUID(),
            userId: facilitatorIds[0],
            circuloId: circulo.id,
            role: 'FACILITATOR',
            status: 'ACTIVE',
          },
        });
      }

      this.logger.log(`Created Círculo de Conciencia: ${circulo.name} (level ${circulo.level})`);

      return circulo;
    } catch (error) {
      this.logger.error('Failed to create círculo:', error);
      throw error;
    }
  }

  /**
   * Join a círculo
   */
  async joinCirculo(circuloId: string, userDID: string) {
    const circulo = await this.prisma.circuloConciencia.findUnique({
      where: { id: circuloId },
      include: {
        CirculoParticipacion: true,
      },
    });

    if (!circulo) {
      throw new NotFoundException('Círculo not found');
    }

    if (circulo.status !== 'ACTIVE' && circulo.status !== 'FORMING') {
      throw new BadRequestException('This círculo is not accepting new members');
    }

    // Check if círculo is full
    if (circulo.maxParticipants && circulo.CirculoParticipacion.length >= circulo.maxParticipants) {
      throw new BadRequestException('This círculo is full');
    }

    // Check if requires invite
    if (circulo.requiresInvite && !circulo.isOpen) {
      throw new ForbiddenException('This círculo requires an invitation');
    }

    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Can only add local users');
    }

    const userId = userParsed.userId;

    // Check if already a member
    const existing = await this.prisma.circuloParticipacion.findUnique({
      where: {
        userId_circuloId: { userId, circuloId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already a member of this círculo');
    }

    const participation = await this.prisma.circuloParticipacion.create({
      data: {
        id: uuidv4(),
        userId,
        circuloId,
        role: 'MEMBER',
        status: circulo.requiresInvite ? 'INVITED' : 'ACTIVE',
      },
    });

    this.logger.log(`User ${userDID} joined círculo ${circulo.name}`);

    return participation;
  }

  /**
   * Leave a círculo
   */
  async leaveCirculo(circuloId: string, userDID: string) {
    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid user DID');
    }

    const participation = await this.prisma.circuloParticipacion.update({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
      data: {
        status: 'LEFT',
        leftAt: new Date(),
      },
    });

    this.logger.log(`User ${userDID} left círculo ${circuloId}`);

    return participation;
  }

  /**
   * Record attendance at a círculo session
   */
  async recordAttendance(circuloId: string, userDID: string) {
    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid user DID');
    }

    const participation = await this.prisma.circuloParticipacion.findUnique({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Not a member of this círculo');
    }

    // Calculate new attendance rate (simplified)
    const newAttendanceRate = Math.min(participation.attendanceRate + 0.1, 1.0);

    const updated = await this.prisma.circuloParticipacion.update({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
      data: {
        lastAttendedAt: new Date(),
        attendanceRate: newAttendanceRate,
      },
    });

    return updated;
  }

  /**
   * Add a personal reflection to a círculo participation
   */
  async addReflection(circuloId: string, userDID: string, reflection: string) {
    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid user DID');
    }

    const participation = await this.prisma.circuloParticipacion.findUnique({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Not a member of this círculo');
    }

    const reflections = (participation.reflections as any[]) || [];
    reflections.push({
      text: reflection,
      date: new Date().toISOString(),
    });

    const updated = await this.prisma.circuloParticipacion.update({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
      data: {
        reflections,
      },
    });

    return updated;
  }

  /**
   * Get all círculos
   */
  async getAllCirculos(filters?: {
    level?: number;
    type?: CirculoType;
    isOpen?: boolean;
    status?: CirculoStatus;
  }) {
    const where: any = {};

    if (filters) {
      if (filters.level) where.level = filters.level;
      if (filters.type) where.type = filters.type;
      if (filters.isOpen !== undefined) where.isOpen = filters.isOpen;
      if (filters.status) where.status = filters.status;
    }

    const circulos = await this.prisma.circuloConciencia.findMany({
      where,
      include: {
        CirculoParticipacion: {
          where: { status: 'ACTIVE' },
          include: {
            User: {
              select: { id: true, name: true, avatar: true, gailuDID: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return circulos;
  }

  /**
   * Get a single círculo by ID
   */
  async getCirculo(circuloId: string) {
    const circulo = await this.prisma.circuloConciencia.findUnique({
      where: { id: circuloId },
      include: {
        CirculoParticipacion: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
                gailuDID: true,
                consciousnessLevel: true,
              },
            },
          },
        },
      },
    });

    if (!circulo) {
      throw new NotFoundException('Círculo not found');
    }

    return circulo;
  }

  /**
   * Get círculos that a user is participating in
   */
  async getUserCirculos(userDID: string) {
    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid user DID');
    }

    const participations = await this.prisma.circuloParticipacion.findMany({
      where: {
        userId: userParsed.userId,
        status: { in: ['ACTIVE', 'INVITED'] },
      },
      include: {
        CirculoConciencia: {
          include: {
            CirculoParticipacion: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    return participations.map((p) => ({
      ...p.CirculoConciencia,
      myRole: p.role,
      myAttendanceRate: p.attendanceRate,
      myContributionLevel: p.contributionLevel,
      joinedAt: p.joinedAt,
    }));
  }

  /**
   * Update consciousness growth for a user in a círculo
   * This would be called periodically or after assessments
   */
  async updateConsciousnessGrowth(circuloId: string, userDID: string, growth: number) {
    const userParsed = this.didService.parseDID(userDID);
    if (!userParsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid user DID');
    }

    const participation = await this.prisma.circuloParticipacion.update({
      where: {
        userId_circuloId: { userId: userParsed.userId, circuloId },
      },
      data: {
        consciousnessGrowth: { increment: growth },
      },
    });

    // Also update user's overall consciousness level if significant growth
    if (participation.consciousnessGrowth >= 10) {
      await this.prisma.user.update({
        where: { id: userParsed.userId },
        data: {
          consciousnessLevel: { increment: 1 },
        },
      });

      // Reset growth counter
      await this.prisma.circuloParticipacion.update({
        where: {
          userId_circuloId: { userId: userParsed.userId, circuloId },
        },
        data: {
          consciousnessGrowth: 0,
        },
      });
    }

    return participation;
  }

  /**
   * Get círculos statistics
   */
  async getStats() {
    const [totalCirculos, activeCirculos, totalParticipations] = await Promise.all([
      this.prisma.circuloConciencia.count(),
      this.prisma.circuloConciencia.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.circuloParticipacion.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const byLevel = await this.prisma.circuloConciencia.groupBy({
      by: ['level'],
      _count: true,
      where: { status: 'ACTIVE' },
    });

    return {
      totalCirculos,
      activeCirculos,
      totalParticipations,
      byLevel: byLevel.map((item) => ({
        level: item.level,
        count: item._count,
      })),
    };
  }
}
