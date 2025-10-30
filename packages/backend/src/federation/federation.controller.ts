import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { DIDService } from './did.service';
import { SemillaService } from './semilla.service';
import { ActivityPubService } from './activitypub.service';
import { CirculosService } from './circulos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SemillaTransactionType, CirculoType, ActivityVisibility } from '@prisma/client';

/**
 * Federation Controller
 *
 * API endpoints for Gailu Labs federation features
 */
@Controller('federation')
export class FederationController {
  private readonly logger = new Logger(FederationController.name);

  constructor(
    private didService: DIDService,
    private semillaService: SemillaService,
    private activityPubService: ActivityPubService,
    private circulosService: CirculosService,
  ) {}

  // ==================== DID Endpoints ====================

  @Get('did/:userId')
  async generateDID(@Param('userId') userId: string) {
    return this.didService.generateDID(userId);
  }

  @Get('did/resolve/:did')
  async resolveDID(@Param('did') did: string) {
    return this.didService.resolveDID(did);
  }

  @Get('dids')
  async getAllDIDs() {
    return this.didService.getAllDIDs();
  }

  @Post('dids/generate-missing')
  async generateMissingDIDs() {
    const count = await this.didService.generateMissingDIDs();
    return { generated: count };
  }

  @Get('node-info')
  async getNodeInfo() {
    return {
      nodeId: this.didService.getNodeId(),
      name: 'Comunidad Viva',
      type: 'GENESIS',
      version: '1.0.0',
      protocol: 'gailu-share-v1',
    };
  }

  // ==================== SEMILLA Token Endpoints ====================

  @Post('semilla/transfer')
  @UseGuards(JwtAuthGuard)
  async transferSemilla(
    @Body()
    body: {
      toDID: string;
      amount: number;
      reason: string;
      type?: SemillaTransactionType;
    },
    @Req() req: any,
  ) {
    const user = req.user;
    const fromDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.semillaService.transfer(
      fromDID,
      body.toDID,
      body.amount,
      body.reason,
      body.type || 'TRANSFER',
    );
  }

  @Get('semilla/balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    const balance = await this.semillaService.getBalance(userDID);
    return { balance, did: userDID };
  }

  @Get('semilla/transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Req() req: any, @Query('limit') limit?: string) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.semillaService.getTransactionHistory(userDID, limit ? parseInt(limit) : 50);
  }

  @Post('semilla/reward')
  @UseGuards(JwtAuthGuard)
  async rewardUser(
    @Body()
    body: {
      userDID: string;
      amount: number;
      reason: string;
      pohIncrease?: number;
    },
  ) {
    return this.semillaService.rewardProofOfHelp(
      body.userDID,
      body.amount,
      body.reason,
      body.pohIncrease,
    );
  }

  @Get('semilla/stats')
  async getSemillaStats() {
    return this.semillaService.getNodeStats();
  }

  @Post('semilla/grant-initial')
  @UseGuards(JwtAuthGuard)
  async grantInitialTokens(@Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    // Check if user already has tokens
    const balance = await this.semillaService.getBalance(userDID);
    if (balance > 0) {
      return { message: 'User already has SEMILLA tokens', balance };
    }

    return this.semillaService.grantInitialTokens(userDID);
  }

  // ==================== ActivityPub Endpoints ====================

  @Get('feed')
  async getFederatedFeed(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.activityPubService.getFederatedFeed(
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('activities/node/:nodeId')
  async getNodeActivities(@Param('nodeId') nodeId: string, @Query('limit') limit?: string) {
    return this.activityPubService.getNodeActivities(nodeId, limit ? parseInt(limit) : 20);
  }

  @Get('activities/user/:did')
  async getUserActivities(@Param('did') did: string, @Query('limit') limit?: string) {
    return this.activityPubService.getUserActivities(did, limit ? parseInt(limit) : 20);
  }

  @Post('activities/publish-post')
  @UseGuards(JwtAuthGuard)
  async publishPost(
    @Body() body: { postId: string; visibility?: ActivityVisibility },
    @Req() req: any,
  ) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.activityPubService.publishPost(body.postId, userDID, body.visibility);
  }

  @Post('activities/publish-offer')
  @UseGuards(JwtAuthGuard)
  async publishOffer(
    @Body() body: { offerId: string; visibility?: ActivityVisibility },
    @Req() req: any,
  ) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.activityPubService.publishOffer(body.offerId, userDID, body.visibility);
  }

  @Post('activities/:activityId/like')
  @UseGuards(JwtAuthGuard)
  async likeActivity(@Param('activityId') activityId: string, @Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.activityPubService.likeActivity(activityId, userDID);
  }

  @Post('activities/:activityId/share')
  @UseGuards(JwtAuthGuard)
  async shareActivity(@Param('activityId') activityId: string, @Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.activityPubService.shareActivity(activityId, userDID);
  }

  @Get('nodes')
  async getAllNodes() {
    return this.activityPubService.getAllNodes();
  }

  @Post('nodes/register')
  async registerNode(
    @Body()
    body: {
      nodeId: string;
      name: string;
      type: string;
      url: string;
      publicKey: string;
      description?: string;
    },
  ) {
    return this.activityPubService.registerNode(
      body.nodeId,
      body.name,
      body.type,
      body.url,
      body.publicKey,
      body.description,
    );
  }

  // ==================== Círculos de Conciencia Endpoints ====================

  @Post('circulos')
  @UseGuards(JwtAuthGuard)
  async createCirculo(
    @Body()
    body: {
      name: string;
      description: string;
      level: number;
      type: CirculoType;
      maxParticipants?: number;
      isOpen?: boolean;
      requiresInvite?: boolean;
      schedule?: any;
      location?: string;
      language?: string;
      practices?: string[];
    },
    @Req() req: any,
  ) {
    const user = req.user;
    const facilitatorDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.createCirculo({
      ...body,
      facilitatorDID,
    });
  }

  @Get('circulos')
  async getAllCirculos(
    @Query('level') level?: string,
    @Query('type') type?: CirculoType,
    @Query('isOpen') isOpen?: string,
  ) {
    const filters: any = {};
    if (level) filters.level = parseInt(level);
    if (type) filters.type = type;
    if (isOpen !== undefined) filters.isOpen = isOpen === 'true';

    return this.circulosService.getAllCirculos(filters);
  }

  @Get('circulos/my')
  @UseGuards(JwtAuthGuard)
  async getMyCirculos(@Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.getUserCirculos(userDID);
  }

  @Get('circulos/stats')
  async getCirculosStats() {
    return this.circulosService.getStats();
  }

  @Get('circulos/:id')
  async getCirculo(@Param('id') id: string) {
    return this.circulosService.getCirculo(id);
  }

  @Post('circulos/:id/join')
  @UseGuards(JwtAuthGuard)
  async joinCirculo(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.joinCirculo(id, userDID);
  }

  @Post('circulos/:id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveCirculo(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.leaveCirculo(id, userDID);
  }

  @Post('circulos/:id/attendance')
  @UseGuards(JwtAuthGuard)
  async recordAttendance(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.recordAttendance(id, userDID);
  }

  @Post('circulos/:id/reflection')
  @UseGuards(JwtAuthGuard)
  async addReflection(
    @Param('id') id: string,
    @Body() body: { reflection: string },
    @Req() req: any,
  ) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    return this.circulosService.addReflection(id, userDID, body.reflection);
  }

  // ==================== Ecosystem Dashboard ====================

  @Get('ecosystem/dashboard')
  @UseGuards(JwtAuthGuard)
  async getEcosystemDashboard(@Req() req: any) {
    const user = req.user;
    const userDID = user.gailuDID || (await this.didService.generateDID(user.userId));

    const [balance, semillaStats, circulos, circulosStats, nodes] = await Promise.all([
      this.semillaService.getBalance(userDID),
      this.semillaService.getNodeStats(),
      this.circulosService.getUserCirculos(userDID),
      this.circulosService.getStats(),
      this.activityPubService.getAllNodes(),
    ]);

    const userData = await this.didService.resolveDID(userDID);

    return {
      user: {
        did: userDID,
        semillaBalance: balance,
        proofOfHelpScore: userData?.proofOfHelpScore || 0,
        consciousnessLevel: userData?.consciousnessLevel || 1,
      },
      semilla: {
        balance,
        totalSupply: semillaStats.totalSupply,
        recentTransactions: semillaStats.recentTransactions,
      },
      circulos: {
        myCirculos: circulos.length,
        totalCirculos: circulosStats.totalCirculos,
        activeCirculos: circulosStats.activeCirculos,
      },
      federation: {
        nodes: nodes.length,
        nodeId: this.didService.getNodeId(),
      },
    };
  }
}
