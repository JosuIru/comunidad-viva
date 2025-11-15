import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DIDService } from './did.service';
import { ActivityType, ActivityVisibility } from '@prisma/client';
import { randomUUID } from 'crypto';

/**
 * ActivityPub Service
 *
 * Implements ActivityPub protocol for federated content sharing across Gailu Labs nodes.
 * Allows posts, offers, events, and other activities to be shared and consumed
 * across the network.
 *
 * ActivityPub is a W3C standard for decentralized social networking:
 * https://www.w3.org/TR/activitypub/
 */
@Injectable()
export class ActivityPubService {
  private readonly logger = new Logger(ActivityPubService.name);

  constructor(
    private prisma: PrismaService,
    private didService: DIDService,
  ) {}

  /**
   * Publish an activity to the federation
   * @param publisherDID - DID of the user publishing
   * @param type - Type of activity (CREATE, ANNOUNCE, etc.)
   * @param object - The activity object (Post, Offer, Event, etc.)
   * @param visibility - Visibility level
   * @param targetNodes - Specific nodes to share with (empty = all)
   */
  async publishActivity(
    publisherDID: string,
    type: ActivityType,
    object: Record<string, any>,
    visibility: ActivityVisibility = 'PUBLIC',
    targetNodes: string[] = [],
  ) {
    try {
      const parsed = this.didService.parseDID(publisherDID);
      if (!parsed) {
        throw new Error('Invalid publisher DID');
      }

      const publisherId = this.didService.isLocalDID(publisherDID) ? parsed.userId : null;
      const nodeId = this.didService.getNodeId();

      // Generate activity ID (URI)
      const activityId = `https://${nodeId}.gailu.org/activities/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;

      // Get or create federated node record
      let node = await this.prisma.federatedNode.findUnique({
        where: { nodeId },
      });

      if (!node) {
        // Create node record for this instance
        node = await this.prisma.federatedNode.create({
          data: {
            id: randomUUID(),
            nodeId,
            name: 'Comunidad Viva',
            type: 'GENESIS',
            url: `https://${nodeId}.gailu.org`,
            publicKey: 'TODO: Generate public key',
            description: 'Plataforma de economía colaborativa local',
            updatedAt: new Date(),
          },
        });
      }

      // Create activity record
      const activity = await this.prisma.federatedActivity.create({
        data: {
          id: uuidv4(),
          activityId,
          type,
          publisherDID,
          publisherId,
          nodeId: node.id,
          object,
          content: this.extractContent(object),
          visibility,
          targetNodes,
        },
      });

      this.logger.log(`Published activity ${activityId} of type ${type} to federation`);

      // TODO: Push activity to remote nodes (if targetNodes specified or PUBLIC)
      // This would involve HTTP POST to remote node's inbox

      return activity;
    } catch (error) {
      this.logger.error('Failed to publish activity:', error);
      throw error;
    }
  }

  /**
   * Publish a post to the federation
   */
  async publishPost(postId: string, publisherDID: string, visibility: ActivityVisibility = 'PUBLIC') {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        User: {
          select: { name: true, avatar: true, gailuDID: true },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const object = {
      type: 'Note',
      id: postId,
      content: post.content,
      published: post.createdAt,
      attributedTo: publisherDID,
      author: {
        name: post.User.name,
        avatar: post.User.avatar,
      },
      images: post.images || [],
    };

    return this.publishActivity(publisherDID, 'CREATE', object, visibility);
  }

  /**
   * Publish an offer to the federation
   */
  async publishOffer(offerId: string, publisherDID: string, visibility: ActivityVisibility = 'FEDERATED') {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        User: {
          select: { name: true, avatar: true, gailuDID: true },
        },
      },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    const object = {
      type: 'Offer',
      id: offerId,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      offerType: offer.type,
      priceEur: offer.priceEur,
      priceCredits: offer.priceCredits,
      images: offer.images || [],
      location: offer.address,
      published: offer.createdAt,
      attributedTo: publisherDID,
      author: {
        name: offer.User.name,
        avatar: offer.User.avatar,
      },
    };

    return this.publishActivity(publisherDID, 'OFFER_SERVICE', object, visibility);
  }

  /**
   * Receive an activity from a remote node
   * @param activity - ActivityPub activity object
   */
  async receiveActivity(activity: any) {
    try {
      // Validate activity signature (TODO)
      // Parse and store activity

      const { id, type, actor, object } = activity;

      // Get or create the remote node
      const actorParsed = this.didService.parseDID(actor);
      if (!actorParsed) {
        throw new Error('Invalid actor DID');
      }

      let node = await this.prisma.federatedNode.findUnique({
        where: { nodeId: actorParsed.nodeId },
      });

      if (!node) {
        this.logger.warn(`Unknown node: ${actorParsed.nodeId}. Skipping activity.`);
        return null;
      }

      // Store activity
      const stored = await this.prisma.federatedActivity.create({
        data: {
          id: uuidv4(),
          activityId: id,
          type: type as ActivityType,
          publisherDID: actor,
          nodeId: node.id,
          object,
          content: this.extractContent(object),
          visibility: 'FEDERATED',
          receivedAt: new Date(),
          publishedAt: object.published ? new Date(object.published) : new Date(),
        },
      });

      this.logger.log(`Received activity ${id} of type ${type} from ${actorParsed.nodeId}`);

      return stored;
    } catch (error) {
      this.logger.error('Failed to receive activity:', error);
      throw error;
    }
  }

  /**
   * Get federated feed - activities from all nodes
   * @param limit - Number of activities to fetch
   * @param offset - Offset for pagination
   */
  async getFederatedFeed(limit: number = 20, offset: number = 0) {
    const activities = await this.prisma.federatedActivity.findMany({
      where: {
        visibility: {
          in: ['PUBLIC', 'FEDERATED'],
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        FederatedNode: {
          select: { nodeId: true, name: true, type: true },
        },
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return activities;
  }

  /**
   * Get activities from a specific node
   */
  async getNodeActivities(nodeId: string, limit: number = 20) {
    const node = await this.prisma.federatedNode.findUnique({
      where: { nodeId },
    });

    if (!node) {
      throw new Error('Node not found');
    }

    const activities = await this.prisma.federatedActivity.findMany({
      where: { nodeId: node.id },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        FederatedNode: {
          select: { nodeId: true, name: true, type: true },
        },
      },
    });

    return activities;
  }

  /**
   * Get activities from a specific user (by DID)
   */
  async getUserActivities(userDID: string, limit: number = 20) {
    const activities = await this.prisma.federatedActivity.findMany({
      where: { publisherDID: userDID },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        FederatedNode: {
          select: { nodeId: true, name: true, type: true },
        },
      },
    });

    return activities;
  }

  /**
   * Like an activity
   */
  async likeActivity(activityId: string, userDID: string) {
    const activity = await this.prisma.federatedActivity.findUnique({
      where: { activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    await this.prisma.federatedActivity.update({
      where: { activityId },
      data: { likes: { increment: 1 } },
    });

    // Publish a LIKE activity
    await this.publishActivity(userDID, 'LIKE', { object: activityId }, 'PUBLIC');

    return { success: true };
  }

  /**
   * Share/Announce an activity
   */
  async shareActivity(activityId: string, userDID: string) {
    const activity = await this.prisma.federatedActivity.findUnique({
      where: { activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    await this.prisma.federatedActivity.update({
      where: { activityId },
      data: { shares: { increment: 1 } },
    });

    // Publish an ANNOUNCE activity
    await this.publishActivity(userDID, 'ANNOUNCE', { object: activityId }, 'PUBLIC');

    return { success: true };
  }

  /**
   * Extract text content from an activity object
   */
  private extractContent(object: any): string | null {
    if (typeof object === 'string') return object;
    if (object.content) return object.content;
    if (object.summary) return object.summary;
    if (object.description) return object.description;
    if (object.title) return object.title;
    return null;
  }

  /**
   * Register a new federated node
   */
  async registerNode(
    nodeId: string,
    name: string,
    type: string,
    url: string,
    publicKey: string,
    description?: string,
  ) {
    try {
      const node = await this.prisma.federatedNode.create({
        data: {
          id: uuidv4(),
          nodeId,
          name,
          type: type as any,
          url,
          publicKey,
          description,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Registered new federated node: ${nodeId} (${name})`);

      return node;
    } catch (error) {
      this.logger.error('Failed to register node:', error);
      throw error;
    }
  }

  /**
   * Get all federated nodes
   */
  async getAllNodes() {
    return this.prisma.federatedNode.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
