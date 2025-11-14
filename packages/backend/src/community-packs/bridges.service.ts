import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BridgeType, CommunityBridgeStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to detect and track bridges (connections) between communities
 *
 * Bridge Types:
 * - GEOGRAPHIC: Communities in same area
 * - THEMATIC: Communities with similar focus (e.g., two consumer groups)
 * - SUPPLY_CHAIN: One supplies to the other
 * - MENTORSHIP: Experienced community helps new one
 * - FEDERATION: Formal federation/network
 * - SPONTANEOUS: Organic connections (shared members, events, etc.)
 */
@Injectable()
export class BridgesService {
  private readonly logger = new Logger(BridgesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Detect and update bridges between communities daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async detectAllBridges() {
    this.logger.log('Starting daily bridge detection');

    try {
      const communities = await this.prisma.community.findMany({
        where: {
          CommunityPack: { isNot: null },
        },
        include: {
          CommunityPack: true,
        },
      });

      let bridgesDetected = 0;
      let bridgesUpdated = 0;

      // Check each pair of communities
      for (let i = 0; i < communities.length; i++) {
        for (let j = i + 1; j < communities.length; j++) {
          const result = await this.detectBridgesBetween(
            communities[i].id,
            communities[j].id,
          );
          bridgesDetected += result.detected;
          bridgesUpdated += result.updated;
        }
      }

      this.logger.log(
        `Bridge detection complete: ${bridgesDetected} new bridges detected, ${bridgesUpdated} bridges updated`,
      );
    } catch (error) {
      this.logger.error('Failed to detect bridges:', error);
    }
  }

  /**
   * Detect bridges between two specific communities
   */
  async detectBridgesBetween(
    communityAId: string,
    communityBId: string,
  ): Promise<{ detected: number; updated: number }> {
    let detected = 0;
    let updated = 0;

    const [communityA, communityB] = await Promise.all([
      this.prisma.community.findUnique({
        where: { id: communityAId },
        include: {
          User: true,
          CommunityPack: true,
          Event: true,
        },
      }),
      this.prisma.community.findUnique({
        where: { id: communityBId },
        include: {
          User: true,
          CommunityPack: true,
          Event: true,
        },
      }),
    ]);

    if (!communityA || !communityB) return { detected, updated };

    // Detect Geographic Bridge
    if (this.areGeographicallyClose(communityA, communityB)) {
      const result = await this.createOrUpdateBridge(
        communityAId,
        communityBId,
        'GEOGRAPHIC',
        this.calculateGeographicStrength(communityA, communityB),
      );
      if (result === 'created') detected++;
      if (result === 'updated') updated++;
    }

    // Detect Thematic Bridge (same pack type)
    if (
      communityA.CommunityPack?.packType === communityB.CommunityPack?.packType
    ) {
      const result = await this.createOrUpdateBridge(
        communityAId,
        communityBId,
        'THEMATIC',
        0.7, // Base strength for same type
      );
      if (result === 'created') detected++;
      if (result === 'updated') updated++;
    }

    // Detect Spontaneous Bridge (shared members)
    const sharedMembers = await this.getSharedMembersCount(communityAId, communityBId);
    if (sharedMembers > 0) {
      const strength = Math.min(
        sharedMembers / Math.min(communityA.User.length, communityB.User.length),
        1,
      );
      const result = await this.createOrUpdateBridge(
        communityAId,
        communityBId,
        'SPONTANEOUS',
        strength,
        sharedMembers,
      );
      if (result === 'created') detected++;
      if (result === 'updated') updated++;
    }

    return { detected, updated };
  }

  /**
   * Check if two communities are geographically close (< 50km)
   */
  private areGeographicallyClose(communityA: any, communityB: any): boolean {
    if (!communityA.lat || !communityA.lng || !communityB.lat || !communityB.lng) {
      return false;
    }

    const distance = this.calculateDistance(
      communityA.lat,
      communityA.lng,
      communityB.lat,
      communityB.lng,
    );

    return distance <= 50; // Within 50km
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate strength of geographic bridge based on distance
   */
  private calculateGeographicStrength(communityA: any, communityB: any): number {
    const distance = this.calculateDistance(
      communityA.lat,
      communityA.lng,
      communityB.lat,
      communityB.lng,
    );

    // Closer = stronger (max 1.0 at 0km, min 0.2 at 50km)
    return Math.max(0.2, 1 - distance / 50);
  }

  /**
   * Get count of shared members between two communities
   */
  private async getSharedMembersCount(
    communityAId: string,
    communityBId: string,
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT cm1."userId") as count
      FROM "CommunityMember" cm1
      INNER JOIN "CommunityMember" cm2
        ON cm1."userId" = cm2."userId"
      WHERE cm1."communityId" = ${communityAId}
        AND cm2."communityId" = ${communityBId}
        AND cm1.active = true
        AND cm2.active = true
    `;

    return Number(result[0]?.count || 0);
  }

  /**
   * Create or update a bridge between two communities
   */
  private async createOrUpdateBridge(
    sourceCommunityId: string,
    targetCommunityId: string,
    bridgeType: BridgeType,
    strength: number,
    sharedMembers: number = 0,
  ): Promise<'created' | 'updated' | 'unchanged'> {
    try {
      const existing = await this.prisma.communityBridge.findFirst({
        where: {
          OR: [
            { sourceCommunityId, targetCommunityId, bridgeType },
            {
              sourceCommunityId: targetCommunityId,
              targetCommunityId: sourceCommunityId,
              bridgeType
            },
          ],
        },
      });

      if (existing) {
        // Update if strength changed significantly (> 0.1 difference)
        if (Math.abs(existing.strength - strength) > 0.1) {
          await this.prisma.communityBridge.update({
            where: { id: existing.id },
            data: {
              strength,
              sharedMembers,
              lastInteractionAt: new Date(),
              status: 'ACTIVE',
            },
          });
          return 'updated';
        }
        return 'unchanged';
      }

      // Create new bridge
      await this.prisma.communityBridge.create({
        data: {
          id: uuidv4(),
          sourceCommunityId,
          targetCommunityId,
          bridgeType,
          strength,
          sharedMembers,
          status: 'ACTIVE',
          lastInteractionAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.debug(
        `Created ${bridgeType} bridge between ${sourceCommunityId} and ${targetCommunityId} (strength: ${strength.toFixed(2)})`,
      );

      return 'created';
    } catch (error) {
      this.logger.error(`Failed to create/update bridge:`, error);
      return 'unchanged';
    }
  }

  /**
   * Get all bridges for a community
   */
  async getBridgesForCommunity(communityId: string) {
    const bridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId: communityId }, { targetCommunityId: communityId }],
        status: 'ACTIVE',
      },
      orderBy: { strength: 'desc' },
    });

    // Manually fetch community details
    const enrichedBridges = await Promise.all(
      bridges.map(async (bridge) => {
        const [sourceCommunity, targetCommunity] = await Promise.all([
          this.prisma.community.findUnique({
            where: { id: bridge.sourceCommunityId },
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
              CommunityPack: {
                select: { packType: true },
              },
            },
          }),
          this.prisma.community.findUnique({
            where: { id: bridge.targetCommunityId },
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
              CommunityPack: {
                select: { packType: true },
              },
            },
          }),
        ]);

        return {
          ...bridge,
          sourceCommunity,
          targetCommunity,
        };
      }),
    );

    return enrichedBridges;
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    const [totalBridges, bridgesByType, strongestBridges] = await Promise.all([
      this.prisma.communityBridge.count({ where: { status: 'ACTIVE' } }),
      this.prisma.communityBridge.groupBy({
        by: ['bridgeType'],
        where: { status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.communityBridge.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { strength: 'desc' },
        take: 10,
      }),
    ]);

    // Manually fetch community details for strongest bridges
    const enrichedStrongestBridges = await Promise.all(
      strongestBridges.map(async (bridge) => {
        const [sourceCommunity, targetCommunity] = await Promise.all([
          this.prisma.community.findUnique({
            where: { id: bridge.sourceCommunityId },
            select: { name: true, slug: true },
          }),
          this.prisma.community.findUnique({
            where: { id: bridge.targetCommunityId },
            select: { name: true, slug: true },
          }),
        ]);

        return {
          ...bridge,
          sourceCommunity,
          targetCommunity,
        };
      }),
    );

    return {
      totalBridges,
      bridgesByType: bridgesByType.reduce(
        (acc, item) => {
          acc[item.bridgeType] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      strongestBridges: enrichedStrongestBridges,
      averageStrength:
        enrichedStrongestBridges.length > 0
          ? enrichedStrongestBridges.reduce((sum, b) => sum + b.strength, 0) /
            enrichedStrongestBridges.length
          : 0,
    };
  }

  /**
   * Propose a mentorship bridge (manual)
   */
  async proposeMentorship(
    mentorCommunityId: string,
    menteeCommunityId: string,
    initiatedBy: string,
    notes?: string,
  ) {
    const mentor = await this.prisma.community.findUnique({
      where: { id: mentorCommunityId },
      include: { CommunityPack: true },
    });

    const mentee = await this.prisma.community.findUnique({
      where: { id: menteeCommunityId },
      include: { CommunityPack: true },
    });

    if (!mentor || !mentee) {
      throw new Error('Communities not found');
    }

    // Calculate strength based on mentor maturity
    const mentorMonths =
      (new Date().getTime() - mentor.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const strength = Math.min(mentorMonths / 12, 1); // Max strength after 1 year

    const bridge = await this.prisma.communityBridge.create({
      data: {
        id: uuidv4(),
        sourceCommunityId: mentorCommunityId,
        targetCommunityId: menteeCommunityId,
        bridgeType: 'MENTORSHIP',
        strength,
        initiatedBy,
        notes,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    // Fetch community names for logging
    const [sourceCommunity, targetCommunity] = await Promise.all([
      this.prisma.community.findUnique({
        where: { id: mentorCommunityId },
        select: { name: true },
      }),
      this.prisma.community.findUnique({
        where: { id: menteeCommunityId },
        select: { name: true },
      }),
    ]);

    this.logger.log(
      `Mentorship proposed: ${sourceCommunity?.name} → ${targetCommunity?.name}`,
    );

    return {
      ...bridge,
      sourceCommunity,
      targetCommunity,
    };
  }

  /**
   * Accept a mentorship bridge
   */
  async acceptMentorship(bridgeId: string) {
    return this.prisma.communityBridge.update({
      where: { id: bridgeId },
      data: { status: 'ACTIVE' },
    });
  }
}
