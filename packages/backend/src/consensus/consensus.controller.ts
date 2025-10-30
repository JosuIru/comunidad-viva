import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProofOfHelpService } from './proof-of-help.service';

@ApiTags('consensus')
@Controller('consensus')
@ApiBearerAuth()
export class ConsensusController {
  constructor(private readonly pohService: ProofOfHelpService) {}

  // ============================================
  // TRUST BLOCKS & VALIDATION
  // ============================================

  @Post('blocks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new trust block (Proof of Help)' })
  async createBlock(
    @Request() req,
    @Body() body: {
      type: 'HELP' | 'PROPOSAL' | 'VALIDATION' | 'DISPUTE';
      content: any;
      witnesses?: string[];
    },
  ) {
    return this.pohService.createTrustBlock({
      type: body.type,
      actorId: req.user.userId,
      content: body.content,
      witnesses: body.witnesses,
    });
  }

  @Post('blocks/:blockId/validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate a trust block (community consensus)' })
  async validateBlock(
    @Request() req,
    @Param('blockId') blockId: string,
    @Body() body: {
      decision: 'APPROVE' | 'REJECT';
      reason?: string;
    },
  ) {
    return this.pohService.validateBlock(
      blockId,
      req.user.userId,
      body.decision,
      body.reason,
    );
  }

  @Get('blocks/pending')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get pending blocks for validation' })
  async getPendingBlocks(@Request() req) {
    return this.pohService.getPendingBlocks(req.user.userId);
  }

  // ============================================
  // PROPOSALS (CIPs)
  // ============================================

  @Post('proposals')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a Community Improvement Proposal (CIP)' })
  async createProposal(
    @Request() req,
    @Body() body: {
      type: 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP' | 'COMMUNITY_UPDATE' | 'COMMUNITY_DISSOLUTION';
      title: string;
      description: string;
      requiredBudget?: number;
      implementationPlan?: string;
      communityId?: string;
      updates?: any;
      governanceUpdates?: any;
      recipientId?: string;
      amount?: number;
    },
  ) {
    return this.pohService.createProposal({
      authorId: req.user.userId,
      ...body,
    });
  }

  @Post('proposals/:proposalId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Vote on a proposal using quadratic voting' })
  async voteProposal(
    @Request() req,
    @Param('proposalId') proposalId: string,
    @Body() body: { points: number },
  ) {
    return this.pohService.voteProposal(
      proposalId,
      req.user.userId,
      body.points,
    );
  }

  @Get('proposals')
  @ApiOperation({ summary: 'List all community proposals' })
  async listProposals(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ) {
    return this.pohService.listProposals({
      status,
      type,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get proposal details' })
  async getProposal(@Param('proposalId') proposalId: string) {
    return this.pohService.getProposalDetails(proposalId);
  }

  @Post('proposals/:proposalId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create comment on proposal' })
  async createProposalComment(
    @Request() req,
    @Param('proposalId') proposalId: string,
    @Body() body: { content: string; parentId?: string },
  ) {
    return this.pohService.createProposalComment({
      proposalId,
      authorId: req.user.userId,
      content: body.content,
      parentId: body.parentId,
    });
  }

  @Get('proposals/:proposalId/comments')
  @ApiOperation({ summary: 'Get proposal comments' })
  async getProposalComments(@Param('proposalId') proposalId: string) {
    return this.pohService.getProposalComments(proposalId);
  }

  // ============================================
  // MODERATION
  // ============================================

  @Post('moderation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Report content for community moderation' })
  async reportContent(
    @Request() req,
    @Body() body: {
      contentId: string;
      contentType: 'POST' | 'OFFER' | 'COMMENT' | 'MESSAGE' | 'REVIEW' | 'COMMUNITY' | 'EVENT' | 'TIMEBANK';
      reason: string;
    },
  ) {
    return this.pohService.moderateContent(
      body.contentId,
      body.contentType,
      body.reason,
      req.user.userId,
    );
  }

  @Post('moderation/:daoId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Vote on content moderation' })
  async voteModeration(
    @Request() req,
    @Param('daoId') daoId: string,
    @Body() body: {
      decision: 'KEEP' | 'REMOVE' | 'WARN';
      reason?: string;
    },
  ) {
    return this.pohService.voteModeration(
      daoId,
      req.user.userId,
      body.decision,
      body.reason,
    );
  }

  @Get('moderation/pending')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get pending moderation requests where user is jury' })
  async getPendingModerations(@Request() req) {
    return this.pohService.getPendingModerations(req.user.userId);
  }

  // ============================================
  // DASHBOARD & STATS
  // ============================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get governance dashboard with statistics' })
  async getDashboard() {
    return this.pohService.getGovernanceDashboard();
  }

  // ============================================
  // REPUTATION
  // ============================================

  @Get('reputation')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user reputation score' })
  async getReputation(@Request() req) {
    const reputation = await this.pohService.calculateReputation(req.user.userId);
    return {
      userId: req.user.userId,
      reputation,
      level: this.getLevel(reputation),
      privileges: this.getPrivileges(reputation),
    };
  }

  @Get('reputation/:userId')
  @ApiOperation({ summary: 'Get reputation of any user' })
  async getUserReputation(@Param('userId') userId: string) {
    const reputation = await this.pohService.calculateReputation(userId);
    return {
      userId,
      reputation,
      level: this.getLevel(reputation),
    };
  }

  // Helper methods
  private getLevel(reputation: number): string {
    if (reputation >= 100) return 'EXPERT';
    if (reputation >= 50) return 'EXPERIENCED';
    if (reputation >= 20) return 'CONTRIBUTOR';
    if (reputation >= 10) return 'ACTIVE';
    return 'NEWCOMER';
  }

  private getPrivileges(reputation: number): string[] {
    const privileges: string[] = ['can_help'];

    if (reputation >= 10) privileges.push('can_validate_help');
    if (reputation >= 20) privileges.push('can_create_proposals');
    if (reputation >= 50) privileges.push('can_validate_proposals');
    if (reputation >= 100) privileges.push('can_resolve_disputes', 'can_be_moderator');

    return privileges;
  }
}
