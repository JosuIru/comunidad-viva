import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface RemoteDIDDocument {
  did: string;
  type: string;
  name: string;
  image?: string;
  summary?: string;
  nodeId: string;
  semillaBalance?: number;
  proofOfHelpScore?: number;
  consciousnessLevel?: string;
}

interface CachedDID {
  document: RemoteDIDDocument;
  cachedAt: Date;
  expiresAt: Date;
}

interface FederationNode {
  nodeId: string;
  endpoint: string;
}

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

  // Cache for remote DIDs (TTL: 1 hour)
  private readonly didCache: Map<string, CachedDID> = new Map();
  private readonly cacheTTLMs = 60 * 60 * 1000; // 1 hour

  // Known federation nodes
  private readonly federationNodes: Map<string, string> = new Map();

  constructor(private prisma: PrismaService) {
    // Node ID can be configured via environment variable
    this.nodeId = process.env.GAILU_NODE_ID || 'comunidad-viva-main';

    // Initialize known federation nodes from environment
    this.initializeFederationNodes();
  }

  /**
   * Initialize known federation nodes from environment configuration
   */
  private initializeFederationNodes(): void {
    const nodesConfig = process.env.GAILU_FEDERATION_NODES;
    if (nodesConfig) {
      try {
        // Format: nodeId1:endpoint1,nodeId2:endpoint2
        const nodes = nodesConfig.split(',');
        for (const node of nodes) {
          const [nodeId, endpoint] = node.trim().split(':');
          if (nodeId && endpoint) {
            this.federationNodes.set(nodeId, endpoint.startsWith('http') ? endpoint : `https://${endpoint}`);
            this.logger.log(`Registered federation node: ${nodeId} -> ${endpoint}`);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to parse federation nodes config: ${error.message}`);
      }
    }
  }

  /**
   * Register a new federation node
   */
  registerNode(nodeId: string, endpoint: string): void {
    this.federationNodes.set(nodeId, endpoint);
    this.logger.log(`Registered federation node: ${nodeId} -> ${endpoint}`);
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
        // For remote DIDs, fetch from the federated node
        return await this.resolveRemoteDID(did, parsed.nodeId, parsed.userId);
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

  /**
   * Resolve a DID from a remote federation node
   */
  private async resolveRemoteDID(
    did: string,
    nodeId: string,
    userId: string,
  ): Promise<RemoteDIDDocument | null> {
    // Check cache first
    const cached = this.getCachedDID(did);
    if (cached) {
      this.logger.debug(`Cache hit for DID: ${did}`);
      return cached;
    }

    // Get the endpoint for this node
    const endpoint = this.federationNodes.get(nodeId);
    if (!endpoint) {
      this.logger.warn(`Unknown federation node: ${nodeId}. Cannot resolve DID: ${did}`);
      return null;
    }

    try {
      const resolverUrl = `${endpoint}/api/federation/did/${encodeURIComponent(did)}`;
      this.logger.debug(`Fetching remote DID from: ${resolverUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(resolverUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Federation-Node': this.nodeId,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`DID not found on remote node ${nodeId}: ${did}`);
          return null;
        }
        throw new Error(`Remote node returned ${response.status}: ${response.statusText}`);
      }

      const document = await response.json() as RemoteDIDDocument;

      // Validate the response
      if (!document.did || document.did !== did) {
        this.logger.error(`Invalid DID document received for ${did}`);
        return null;
      }

      // Cache the result
      this.cacheDID(did, document);

      this.logger.log(`Successfully resolved remote DID: ${did} from node ${nodeId}`);
      return document;
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error(`Timeout resolving remote DID ${did} from node ${nodeId}`);
      } else {
        this.logger.error(`Failed to resolve remote DID ${did}: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Get a cached DID if it exists and hasn't expired
   */
  private getCachedDID(did: string): RemoteDIDDocument | null {
    const cached = this.didCache.get(did);
    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      this.didCache.delete(did);
      return null;
    }

    return cached.document;
  }

  /**
   * Cache a resolved DID document
   */
  private cacheDID(did: string, document: RemoteDIDDocument): void {
    const now = new Date();
    this.didCache.set(did, {
      document,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + this.cacheTTLMs),
    });
  }

  /**
   * Clear expired entries from the cache
   */
  clearExpiredCache(): number {
    const now = new Date();
    let cleared = 0;

    for (const [did, cached] of this.didCache.entries()) {
      if (now > cached.expiresAt) {
        this.didCache.delete(did);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.logger.debug(`Cleared ${cleared} expired DID cache entries`);
    }

    return cleared;
  }

  /**
   * Invalidate a specific DID from cache
   */
  invalidateCache(did: string): boolean {
    return this.didCache.delete(did);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; nodes: number } {
    return {
      size: this.didCache.size,
      nodes: this.federationNodes.size,
    };
  }

  /**
   * Get all registered federation nodes
   */
  getFederationNodes(): Array<{ nodeId: string; endpoint: string }> {
    const nodes: Array<{ nodeId: string; endpoint: string }> = [];
    for (const [nodeId, endpoint] of this.federationNodes.entries()) {
      nodes.push({ nodeId, endpoint });
    }
    return nodes;
  }
}
