import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BridgeType } from '@prisma/client';

interface CommunityNode {
  id: string;
  name: string;
  slug: string;
  packType?: string;
  memberCount: number;
  createdAt: Date;
}

export interface NetworkCluster {
  id: string;
  name: string;
  communities: string[];
  totalMembers: number;
  dominantPackType: string;
  cohesionScore: number;
}

export interface ConnectionRecommendation {
  targetCommunity: CommunityNode;
  score: number;
  reasons: string[];
  potentialBridgeTypes: BridgeType[];
  estimatedStrength: number;
}

export interface CommunityImpact {
  communityId: string;
  communityName: string;
  bridgeCount: number;
  networkReach: number; // How many communities are reachable
  centralityScore: number; // How central this community is in the network
  influenceScore: number; // Based on bridges strength and connected communities
  reputation: 'emerging' | 'established' | 'hub' | 'connector';
}

/**
 * Advanced networking analytics service
 * Provides network analysis, recommendations, and reputation systems
 */
@Injectable()
export class NetworkAnalyticsService {
  private readonly logger = new Logger(NetworkAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get connection recommendations for a community
   * Uses collaborative filtering and similarity metrics
   */
  async getConnectionRecommendations(
    communityId: string,
    limit: number = 5,
  ): Promise<ConnectionRecommendation[]> {
    const sourceCommunity = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: {
        CommunityPack: true,
        User: true,
      },
    });

    if (!sourceCommunity) {
      throw new Error('Community not found');
    }

    // Get existing connections
    const existingBridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId: communityId }, { targetCommunityId: communityId }],
        status: 'ACTIVE',
      },
    });

    const connectedIds = new Set(
      existingBridges.flatMap((b) =>
        b.sourceCommunityId === communityId ? [b.targetCommunityId] : [b.sourceCommunityId],
      ),
    );

    // Get all potential communities
    const allCommunities = await this.prisma.community.findMany({
      where: {
        id: { not: communityId },
        CommunityPack: { isNot: null },
      },
      include: {
        CommunityPack: true,
        User: { select: { id: true } },
      },
    });

    const recommendations: ConnectionRecommendation[] = [];

    for (const targetCommunity of allCommunities) {
      if (connectedIds.has(targetCommunity.id)) continue;

      const analysis = await this.analyzeConnectionPotential(
        sourceCommunity,
        targetCommunity,
      );

      if (analysis.score > 0.3) {
        recommendations.push({
          targetCommunity: {
            id: targetCommunity.id,
            name: targetCommunity.name,
            slug: targetCommunity.slug,
            packType: targetCommunity.CommunityPack?.packType,
            memberCount: targetCommunity.User.length,
            createdAt: targetCommunity.createdAt,
          },
          score: analysis.score,
          reasons: analysis.reasons,
          potentialBridgeTypes: analysis.bridgeTypes,
          estimatedStrength: analysis.estimatedStrength,
        });
      }
    }

    // Sort by score and return top N
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Analyze connection potential between two communities
   */
  private async analyzeConnectionPotential(sourceCommunity: any, targetCommunity: any) {
    let score = 0;
    const reasons: string[] = [];
    const bridgeTypes: BridgeType[] = [];
    let estimatedStrength = 0;

    // 1. Geographic proximity (30% weight)
    if (sourceCommunity.lat && targetCommunity.lat) {
      const distance = this.calculateDistance(
        sourceCommunity.lat,
        sourceCommunity.lng,
        targetCommunity.lat,
        targetCommunity.lng,
      );

      if (distance <= 50) {
        const proximityScore = (50 - distance) / 50;
        score += proximityScore * 0.3;
        estimatedStrength += proximityScore * 0.4;
        reasons.push(
          `Proximidad geográfica: ${distance.toFixed(1)}km (${(proximityScore * 100).toFixed(0)}%)`,
        );
        bridgeTypes.push('GEOGRAPHIC');
      }
    }

    // 2. Same pack type (25% weight)
    if (
      sourceCommunity.CommunityPack?.packType === targetCommunity.CommunityPack?.packType
    ) {
      score += 0.25;
      estimatedStrength += 0.3;
      reasons.push(
        `Mismo tipo: ${this.getPackTypeName(sourceCommunity.CommunityPack.packType)}`,
      );
      bridgeTypes.push('THEMATIC');
    }

    // 3. Similar size communities (15% weight)
    const sizeRatio =
      Math.min(sourceCommunity.User.length, targetCommunity.User.length) /
      Math.max(sourceCommunity.User.length, targetCommunity.User.length);

    if (sizeRatio > 0.5) {
      score += sizeRatio * 0.15;
      estimatedStrength += sizeRatio * 0.2;
      reasons.push(
        `Tamaño similar: ${sourceCommunity.User.length} ↔ ${targetCommunity.User.length} miembros`,
      );
    }

    // 4. Mutual connections (friends-of-friends) (20% weight)
    const mutualConnections = await this.getMutualConnections(
      sourceCommunity.id,
      targetCommunity.id,
    );

    if (mutualConnections > 0) {
      const mutualScore = Math.min(mutualConnections / 3, 1);
      score += mutualScore * 0.2;
      estimatedStrength += mutualScore * 0.25;
      reasons.push(`${mutualConnections} conexiones en común`);
    }

    // 5. Complementary pack types (10% weight)
    if (this.areComplementaryPackTypes(sourceCommunity, targetCommunity)) {
      score += 0.1;
      estimatedStrength += 0.15;
      reasons.push('Tipos complementarios (posible cadena de suministro)');
      bridgeTypes.push('SUPPLY_CHAIN');
    }

    // Normalize estimated strength
    estimatedStrength = Math.min(estimatedStrength, 1);

    return { score, reasons, bridgeTypes, estimatedStrength };
  }

  /**
   * Get communities that are connected to both source and target
   */
  private async getMutualConnections(
    sourceCommunityId: string,
    targetCommunityId: string,
  ): Promise<number> {
    const sourceBridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId }, { targetCommunityId: sourceCommunityId }],
        status: 'ACTIVE',
      },
    });

    const targetBridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId: targetCommunityId }, { targetCommunityId }],
        status: 'ACTIVE',
      },
    });

    const sourceConnected = new Set(
      sourceBridges.flatMap((b) =>
        b.sourceCommunityId === sourceCommunityId
          ? [b.targetCommunityId]
          : [b.sourceCommunityId],
      ),
    );

    const targetConnected = new Set(
      targetBridges.flatMap((b) =>
        b.sourceCommunityId === targetCommunityId
          ? [b.targetCommunityId]
          : [b.sourceCommunityId],
      ),
    );

    const mutual = [...sourceConnected].filter((id) => targetConnected.has(id));
    return mutual.length;
  }

  /**
   * Check if pack types are complementary
   */
  private areComplementaryPackTypes(communityA: any, communityB: any): boolean {
    const typeA = communityA.CommunityPack?.packType;
    const typeB = communityB.CommunityPack?.packType;

    if (!typeA || !typeB) return false;

    // Consumer groups can connect with housing coops (shared bulk buying)
    if (
      (typeA === 'CONSUMER_GROUP' && typeB === 'HOUSING_COOP') ||
      (typeA === 'HOUSING_COOP' && typeB === 'CONSUMER_GROUP')
    ) {
      return true;
    }

    // Community bars can connect with consumer groups (local products)
    if (
      (typeA === 'COMMUNITY_BAR' && typeB === 'CONSUMER_GROUP') ||
      (typeA === 'CONSUMER_GROUP' && typeB === 'COMMUNITY_BAR')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate network impact metrics for a community
   */
  async calculateCommunityImpact(communityId: string): Promise<CommunityImpact> {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { name: true },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Get direct bridges
    const bridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId: communityId }, { targetCommunityId: communityId }],
        status: 'ACTIVE',
      },
    });

    const bridgeCount = bridges.length;

    // Calculate network reach (BFS to find all reachable communities)
    const networkReach = await this.calculateNetworkReach(communityId);

    // Calculate centrality (how central is this node in the network)
    const centralityScore = await this.calculateCentrality(communityId);

    // Calculate influence (weighted by bridge strengths)
    const influenceScore = bridges.reduce((sum, bridge) => sum + bridge.strength, 0);

    // Determine reputation
    let reputation: 'emerging' | 'established' | 'hub' | 'connector' = 'emerging';

    if (bridgeCount >= 5 && centralityScore > 0.7) {
      reputation = 'hub';
    } else if (networkReach >= 10 && centralityScore > 0.5) {
      reputation = 'connector';
    } else if (bridgeCount >= 3 || influenceScore > 2) {
      reputation = 'established';
    }

    return {
      communityId,
      communityName: community.name,
      bridgeCount,
      networkReach,
      centralityScore,
      influenceScore,
      reputation,
    };
  }

  /**
   * Calculate how many communities are reachable from this community
   * Using breadth-first search
   */
  private async calculateNetworkReach(startCommunityId: string): Promise<number> {
    const visited = new Set<string>();
    const queue: string[] = [startCommunityId];
    visited.add(startCommunityId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      const bridges = await this.prisma.communityBridge.findMany({
        where: {
          OR: [{ sourceCommunityId: currentId }, { targetCommunityId: currentId }],
          status: 'ACTIVE',
        },
      });

      for (const bridge of bridges) {
        const neighborId =
          bridge.sourceCommunityId === currentId
            ? bridge.targetCommunityId
            : bridge.sourceCommunityId;

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    return visited.size - 1; // Exclude the starting community
  }

  /**
   * Calculate centrality score (betweenness centrality approximation)
   */
  private async calculateCentrality(communityId: string): Promise<number> {
    // Simplified version: ratio of bridges to network size
    const bridges = await this.prisma.communityBridge.findMany({
      where: {
        OR: [{ sourceCommunityId: communityId }, { targetCommunityId: communityId }],
        status: 'ACTIVE',
      },
    });

    const totalCommunities = await this.prisma.community.count({
      where: { CommunityPack: { isNot: null } },
    });

    if (totalCommunities <= 1) return 0;

    // Normalized by maximum possible connections
    return Math.min(bridges.length / (totalCommunities - 1), 1);
  }

  /**
   * Detect network clusters/ecosystems
   */
  async detectClusters(): Promise<NetworkCluster[]> {
    const communities = await this.prisma.community.findMany({
      where: { CommunityPack: { isNot: null } },
      include: {
        CommunityPack: true,
        User: { select: { id: true } },
      },
    });

    const bridges = await this.prisma.communityBridge.findMany({
      where: { status: 'ACTIVE' },
    });

    // Build adjacency list
    const adjacency = new Map<string, Set<string>>();
    for (const community of communities) {
      adjacency.set(community.id, new Set());
    }

    for (const bridge of bridges) {
      adjacency.get(bridge.sourceCommunityId)?.add(bridge.targetCommunityId);
      adjacency.get(bridge.targetCommunityId)?.add(bridge.sourceCommunityId);
    }

    // Find connected components using DFS
    const visited = new Set<string>();
    const clusters: NetworkCluster[] = [];
    let clusterIndex = 0;

    for (const community of communities) {
      if (visited.has(community.id)) continue;

      const clusterCommunities: string[] = [];
      const stack = [community.id];

      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) continue;

        visited.add(currentId);
        clusterCommunities.push(currentId);

        const neighbors = adjacency.get(currentId) || new Set();
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            stack.push(neighborId);
          }
        }
      }

      // Only include clusters with 2+ communities
      if (clusterCommunities.length >= 2) {
        const clusterCommunitiesData = communities.filter((c) =>
          clusterCommunities.includes(c.id),
        );

        const totalMembers = clusterCommunitiesData.reduce(
          (sum, c) => sum + c.User.length,
          0,
        );

        // Find dominant pack type
        const packTypeCounts = new Map<string, number>();
        for (const c of clusterCommunitiesData) {
          const packType = c.CommunityPack?.packType || 'UNKNOWN';
          packTypeCounts.set(packType, (packTypeCounts.get(packType) || 0) + 1);
        }

        const dominantPackType = [...packTypeCounts.entries()].sort(
          (a, b) => b[1] - a[1],
        )[0][0];

        // Calculate cohesion score (density of connections)
        const clusterBridges = bridges.filter(
          (b) =>
            clusterCommunities.includes(b.sourceCommunityId) &&
            clusterCommunities.includes(b.targetCommunityId),
        );

        const maxPossibleEdges =
          (clusterCommunities.length * (clusterCommunities.length - 1)) / 2;
        const cohesionScore =
          maxPossibleEdges > 0 ? clusterBridges.length / maxPossibleEdges : 0;

        clusters.push({
          id: `cluster-${clusterIndex++}`,
          name: `Ecosistema ${this.getPackTypeName(dominantPackType)} (${clusterCommunities.length} comunidades)`,
          communities: clusterCommunities,
          totalMembers,
          dominantPackType,
          cohesionScore,
        });
      }
    }

    return clusters.sort((a, b) => b.totalMembers - a.totalMembers);
  }

  /**
   * Get network-wide leaderboard
   */
  async getNetworkLeaderboard(limit: number = 10) {
    const communities = await this.prisma.community.findMany({
      where: { CommunityPack: { isNot: null } },
      select: { id: true, name: true, slug: true },
    });

    const impacts = await Promise.all(
      communities.map((c) => this.calculateCommunityImpact(c.id)),
    );

    return impacts
      .sort((a, b) => {
        // Sort by reputation tier first, then by influence
        const repRank = { hub: 4, connector: 3, established: 2, emerging: 1 };
        const diff = repRank[b.reputation] - repRank[a.reputation];
        if (diff !== 0) return diff;
        return b.influenceScore - a.influenceScore;
      })
      .slice(0, limit);
  }

  // Helper methods
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
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

  private getPackTypeName(packType: string): string {
    const names: Record<string, string> = {
      CONSUMER_GROUP: 'Grupo de Consumo',
      HOUSING_COOP: 'Cooperativa de Vivienda',
      COMMUNITY_BAR: 'Bar Comunitario',
    };
    return names[packType] || packType;
  }
}
