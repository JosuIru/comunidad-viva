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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsensusController {
  constructor(private readonly pohService: ProofOfHelpService) {}

  // ============================================
  // TRUST BLOCKS & VALIDATION
  // ============================================

  @Post('blocks')
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
  @ApiOperation({ summary: 'Get pending blocks for validation' })
  async getPendingBlocks(@Request() req) {
    // Get blocks where user is a validator
    const reputation = await this.pohService.calculateReputation(req.user.userId);

    // Return blocks that need validation based on user's level
    return {
      reputation,
      message: 'Blocks pendientes de validación',
    };
  }

  // ============================================
  // PROPOSALS (CIPs)
  // ============================================

  @Post('proposals')
  @ApiOperation({ summary: 'Create a Community Improvement Proposal (CIP)' })
  async createProposal(
    @Request() req,
    @Body() body: {
      type: 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP';
      title: string;
      description: string;
      requiredBudget?: number;
      implementationPlan?: string;
    },
  ) {
    return this.pohService.createProposal({
      authorId: req.user.userId,
      ...body,
    });
  }

  @Post('proposals/:proposalId/vote')
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
    @Query('limit') limit?: number,
  ) {
    // Implementation for listing proposals
    return {
      proposals: [],
      message: 'Lista de propuestas comunitarias',
    };
  }

  @Get('proposals/:proposalId')
  @ApiOperation({ summary: 'Get proposal details' })
  async getProposal(@Param('proposalId') proposalId: string) {
    // Implementation for getting proposal details
    return {
      proposalId,
      message: 'Detalles de la propuesta',
    };
  }

  // ============================================
  // MODERATION
  // ============================================

  @Post('moderation')
  @ApiOperation({ summary: 'Report content for community moderation' })
  async reportContent(
    @Request() req,
    @Body() body: {
      contentId: string;
      contentType: 'POST' | 'OFFER' | 'COMMENT' | 'MESSAGE' | 'REVIEW';
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
  @ApiOperation({ summary: 'Get pending moderation requests where user is jury' })
  async getPendingModerations(@Request() req) {
    // Implementation for getting pending moderations
    return {
      pending: [],
      message: 'Moderaciones pendientes donde eres jurado',
    };
  }

  // ============================================
  // REPUTATION
  // ============================================

  @Get('reputation')
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
