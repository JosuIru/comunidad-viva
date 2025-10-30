import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DID Service - Decentralized Identity for Gailu Labs Federation
 *
 * Manages Decentralized Identifiers (DIDs) following the format:
 * did:gailu:nodeId:user:uuid
 *
 * Example: did:gailu:comunidad-viva-main:user:550e8400-e29b-41d4-a716-446655440000
 */
@Injectable()
export class DIDService {
  private readonly logger = new Logger(DIDService.name);
  private readonly nodeId: string;

  constructor(private prisma: PrismaService) {
    // Node ID can be configured via environment variable
    this.nodeId = process.env.GAILU_NODE_ID || 'comunidad-viva-main';
  }

  /**
   * Generate a DID for a user
   * @param userId - User's local UUID
   * @param customNodeId - Optional custom node ID (defaults to this node)
   * @returns DID string
   */
  async generateDID(userId: string, customNodeId?: string): Promise<string> {
    const nodeId = customNodeId || this.nodeId;
    const did = `did:gailu:${nodeId}:user:${userId}`;

    try {
      // Update user with their DID
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          gailuDID: did,
          gailuNodeId: nodeId
        },
      });

      this.logger.log(`Generated DID for user ${userId}: ${did}`);
      return did;
    } catch (error) {
      this.logger.error(`Failed to generate DID for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Resolve a DID to get user information
   * @param did - The DID to resolve
   * @returns User information or null if not found
   */
  async resolveDID(did: string) {
    try {
      // Parse DID
      const parsed = this.parseDID(did);
      if (!parsed) {
        this.logger.warn(`Invalid DID format: ${did}`);
        return null;
      }

      // If it's a local user (this node), fetch from database
      if (parsed.nodeId === this.nodeId) {
        const user = await this.prisma.user.findUnique({
          where: { id: parsed.userId },
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            gailuDID: true,
            gailuNodeId: true,
            semillaBalance: true,
            proofOfHelpScore: true,
            consciousnessLevel: true,
            createdAt: true,
          },
        });

        if (user) {
          return {
            did: user.gailuDID,
            type: 'Person',
            name: user.name,
            image: user.avatar,
            summary: user.bio,
            nodeId: user.gailuNodeId,
            semillaBalance: user.semillaBalance,
            proofOfHelpScore: user.proofOfHelpScore,
            consciousnessLevel: user.consciousnessLevel,
          };
        }
      } else {
        // For remote DIDs, we would fetch from the federated node
        // This would involve an HTTP request to the remote node's DID resolver
        this.logger.log(`Remote DID resolution not yet implemented: ${did}`);
        // TODO: Implement remote DID resolution
        return null;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to resolve DID ${did}:`, error);
      return null;
    }
  }

  /**
   * Parse a DID string into its components
   * @param did - DID string to parse
   * @returns Parsed components or null if invalid
   */
  parseDID(did: string): { nodeId: string; userId: string } | null {
    // Expected format: did:gailu:nodeId:user:uuid
    const parts = did.split(':');

    if (parts.length !== 5 || parts[0] !== 'did' || parts[1] !== 'gailu' || parts[3] !== 'user') {
      return null;
    }

    return {
      nodeId: parts[2],
      userId: parts[4],
    };
  }

  /**
   * Validate if a DID belongs to this node
   * @param did - DID to validate
   * @returns true if local, false otherwise
   */
  isLocalDID(did: string): boolean {
    const parsed = this.parseDID(did);
    return parsed?.nodeId === this.nodeId;
  }

  /**
   * Get all users with DIDs in this node
   * @returns Array of users with DIDs
   */
  async getAllDIDs() {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          gailuDID: { not: null },
        },
        select: {
          id: true,
          name: true,
          gailuDID: true,
          gailuNodeId: true,
          semillaBalance: true,
          proofOfHelpScore: true,
        },
      });

      return users;
    } catch (error) {
      this.logger.error('Failed to fetch DIDs:', error);
      throw error;
    }
  }

  /**
   * Generate DIDs for all users who don't have one yet
   * Useful for migrating existing users to the federation
   */
  async generateMissingDIDs(): Promise<number> {
    try {
      const usersWithoutDID = await this.prisma.user.findMany({
        where: {
          gailuDID: null,
        },
        select: { id: true },
      });

      let generated = 0;
      for (const user of usersWithoutDID) {
        await this.generateDID(user.id);
        generated++;
      }

      this.logger.log(`Generated ${generated} DIDs for existing users`);
      return generated;
    } catch (error) {
      this.logger.error('Failed to generate missing DIDs:', error);
      throw error;
    }
  }

  /**
   * Get the current node's ID
   */
  getNodeId(): string {
    return this.nodeId;
  }
}
