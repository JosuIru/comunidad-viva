import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DIDService } from './did.service';
import { ActivityType, ActivityVisibility } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';

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
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  constructor(
    private prisma: PrismaService,
    private didService: DIDService,
  ) {
    this.initializeKeys();
  }

  /**
   * Initialize or load RSA key pair for HTTP Signatures
   */
  private async initializeKeys() {
    try {
      // Try to load existing keys from environment or database
      const existingPrivateKey = process.env.ACTIVITYPUB_PRIVATE_KEY;
      const existingPublicKey = process.env.ACTIVITYPUB_PUBLIC_KEY;

      if (existingPrivateKey && existingPublicKey) {
        this.privateKey = existingPrivateKey;
        this.publicKey = existingPublicKey;
        this.logger.log('Loaded existing ActivityPub keys from environment');
        return;
      }

      // Generate new key pair
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      this.privateKey = privateKey;
      this.publicKey = publicKey;

      this.logger.log('Generated new ActivityPub RSA key pair');
      this.logger.warn(
        'IMPORTANT: Store these keys in your environment variables:\n' +
          `ACTIVITYPUB_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"\n` +
          `ACTIVITYPUB_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize ActivityPub keys:', error);
    }
  }

  /**
   * Get the public key for this node
   */
  getPublicKey(): string | null {
    return this.publicKey;
  }

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
      const activityId = `https://${nodeId}.gailu.net/activities/${Date.now()}-${Math.random()
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
            url: `https://${nodeId}.gailu.net`,
            publicKey: this.publicKey || '',
            description: 'Plataforma de economía colaborativa local',
            updatedAt: new Date(),
          },
        });
      }

      // Create activity record
      const activity = await this.prisma.federatedActivity.create({
        data: {
          id: randomUUID(),
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

      // Push activity to remote nodes
      if (visibility === 'PUBLIC' || visibility === 'FEDERATED' || targetNodes.length > 0) {
        await this.pushActivityToNodes(activity, targetNodes);
      }

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
   * @param signature - HTTP Signature header
   * @param headers - Request headers
   * @param method - HTTP method
   * @param path - Request path
   */
  async receiveActivity(
    activity: any,
    signature?: string,
    headers?: { [key: string]: string },
    method?: string,
    path?: string,
  ) {
    try {
      // Validate activity signature if provided
      if (signature && headers && method && path) {
        const isValid = await this.verifySignature(signature, headers, method, path, activity);
        if (!isValid) {
          this.logger.warn('Invalid signature on incoming activity. Rejecting.');
          throw new Error('Invalid signature');
        }
        this.logger.log('Activity signature verified successfully');
      }

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
          id: randomUUID(),
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
   * Sign an HTTP request using HTTP Signatures
   * @param url - Target URL
   * @param method - HTTP method
   * @param body - Request body (for POST/PUT)
   */
  private signRequest(url: string, method: string, body?: any): { [key: string]: string } {
    if (!this.privateKey) {
      throw new Error('Private key not initialized');
    }

    const urlObj = new URL(url);
    const date = new Date().toUTCString();
    const digest = body
      ? 'SHA-256=' + crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64')
      : undefined;

    // Build signature string
    const signatureString = digest
      ? `(request-target): ${method.toLowerCase()} ${urlObj.pathname}\nhost: ${urlObj.host}\ndate: ${date}\ndigest: ${digest}`
      : `(request-target): ${method.toLowerCase()} ${urlObj.pathname}\nhost: ${urlObj.host}\ndate: ${date}`;

    // Sign the string
    const signer = crypto.createSign('sha256');
    signer.update(signatureString);
    const signature = signer.sign(this.privateKey, 'base64');

    const nodeId = this.didService.getNodeId();
    const keyId = `https://${nodeId}.gailu.net/actor#main-key`;

    const headers: { [key: string]: string } = {
      Date: date,
      Host: urlObj.host,
      Signature: `keyId="${keyId}",algorithm="rsa-sha256",headers="${digest ? '(request-target) host date digest' : '(request-target) host date'}",signature="${signature}"`,
    };

    if (digest) {
      headers['Digest'] = digest;
    }

    return headers;
  }

  /**
   * Verify an HTTP signature from an incoming request
   * @param signature - Signature header value
   * @param headers - Request headers
   * @param method - HTTP method
   * @param path - Request path
   * @param body - Request body
   */
  async verifySignature(
    signature: string,
    headers: { [key: string]: string },
    method: string,
    path: string,
    body?: any,
  ): Promise<boolean> {
    try {
      // Parse signature header
      const sigParts: { [key: string]: string } = {};
      signature.split(',').forEach((part) => {
        const [key, value] = part.split('=');
        sigParts[key.trim()] = value.replace(/"/g, '');
      });

      const keyId = sigParts['keyId'];
      const algorithm = sigParts['algorithm'];
      const headersList = sigParts['headers'].split(' ');
      const signatureValue = sigParts['signature'];

      // Fetch public key from remote actor
      // Extract nodeId from keyId URL
      const keyIdUrl = new URL(keyId);
      const nodeId = keyIdUrl.hostname.split('.')[0];

      const node = await this.prisma.federatedNode.findUnique({
        where: { nodeId },
      });

      if (!node || !node.publicKey) {
        this.logger.warn(`No public key found for node: ${nodeId}`);
        return false;
      }

      // Reconstruct signature string
      const signatureStringParts: string[] = [];
      for (const header of headersList) {
        if (header === '(request-target)') {
          signatureStringParts.push(`(request-target): ${method.toLowerCase()} ${path}`);
        } else {
          const headerValue = headers[header] || headers[header.toLowerCase()];
          if (headerValue) {
            signatureStringParts.push(`${header.toLowerCase()}: ${headerValue}`);
          }
        }
      }
      const signatureString = signatureStringParts.join('\n');

      // Verify signature
      const verifier = crypto.createVerify('sha256');
      verifier.update(signatureString);
      const isValid = verifier.verify(node.publicKey, signatureValue, 'base64');

      return isValid;
    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Push an activity to remote nodes
   * @param activity - The activity to push
   * @param targetNodes - Specific nodes to push to (empty = all active nodes)
   */
  private async pushActivityToNodes(activity: any, targetNodes: string[] = []) {
    try {
      // Get list of nodes to push to
      let nodes;
      if (targetNodes.length > 0) {
        nodes = await this.prisma.federatedNode.findMany({
          where: {
            nodeId: { in: targetNodes },
            status: 'ACTIVE',
          },
        });
      } else {
        nodes = await this.prisma.federatedNode.findMany({
          where: { status: 'ACTIVE' },
        });
      }

      // Push to each node
      const pushPromises = nodes.map(async (node) => {
        try {
          const inboxUrl = `${node.url}/api/federation/inbox`;

          // Build ActivityPub activity object
          const activityObject = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: activity.activityId,
            type: activity.type,
            actor: activity.publisherDID,
            object: activity.object,
            published: activity.publishedAt?.toISOString() || new Date().toISOString(),
          };

          // Sign request
          const signatureHeaders = this.signRequest(inboxUrl, 'POST', activityObject);

          // Send request
          const response = await fetch(inboxUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/activity+json',
              ...signatureHeaders,
            },
            body: JSON.stringify(activityObject),
          });

          if (response.ok) {
            this.logger.log(`Successfully pushed activity to ${node.nodeId}`);
          } else {
            this.logger.warn(
              `Failed to push activity to ${node.nodeId}: ${response.status} ${response.statusText}`,
            );
          }
        } catch (error) {
          this.logger.error(`Error pushing to ${node.nodeId}:`, error);
        }
      });

      await Promise.allSettled(pushPromises);
    } catch (error) {
      this.logger.error('Failed to push activities to nodes:', error);
    }
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
          id: randomUUID(),
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
