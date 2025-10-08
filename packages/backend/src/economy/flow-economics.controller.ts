import { Controller, Get, Post, Put, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { FlowEconomicsService } from './flow-economics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreditReason, PoolType, RequestStatus } from '@prisma/client';

@ApiTags('flow-economics')
@Controller('flow-economics')
export class FlowEconomicsController {
  constructor(private flowEconomicsService: FlowEconomicsService) {}

  @ApiOperation({ summary: 'Get economic metrics and system health' })
  @ApiResponse({ status: 200, description: 'Returns economic metrics' })
  @Get('metrics')
  async getMetrics() {
    return this.flowEconomicsService.getEconomicMetrics();
  }

  @ApiOperation({ summary: 'Get Gini Index (economic equality measure)' })
  @ApiResponse({ status: 200, description: 'Returns Gini index (0 = perfect equality, 1 = perfect inequality)' })
  @Get('gini')
  async getGiniIndex() {
    const gini = await this.flowEconomicsService.calculateGiniIndex();
    return {
      giniIndex: gini,
      interpretation: this.interpretGini(gini),
    };
  }

  @ApiOperation({ summary: 'Get historical economic metrics' })
  @ApiResponse({ status: 200, description: 'Returns historical economic data' })
  @Get('metrics/history')
  async getMetricsHistory(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // This would need to be implemented in the service
    // For now, return placeholder
    return {
      message: 'Historical metrics tracking',
      days: daysNum,
    };
  }

  @ApiOperation({ summary: 'Send credits with flow multiplier' })
  @ApiResponse({ status: 200, description: 'Transaction completed with flow bonus' })
  @ApiResponse({ status: 400, description: 'Invalid transaction' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendWithFlowMultiplier(
    @Request() req,
    @Body() body: { toUserId: string; amount: number; description?: string },
  ) {
    const { toUserId, amount, description } = body;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const result = await this.flowEconomicsService.executePeerTransaction(
      req.user.userId,
      toUserId,
      amount,
      CreditReason.COMMUNITY_HELP,
      description,
    );

    return {
      success: true,
      baseAmount: amount,
      flowMultiplier: result.flowTx.flowMultiplier,
      totalValue: result.flowTx.totalValue,
      bonusValue: result.bonusValue,
      poolContribution: result.poolContribution,
      message: `Enviaste ${amount} créditos con multiplicador ${result.flowTx.flowMultiplier}x. El receptor recibió ${result.flowTx.totalValue} créditos.`,
    };
  }

  @ApiOperation({ summary: 'Create pool request' })
  @ApiResponse({ status: 201, description: 'Pool request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pool-request')
  async createPoolRequest(
    @Request() req,
    @Body() body: { poolType: PoolType; amount: number; reason: string },
  ) {
    const { poolType, amount, reason } = body;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Reason is required');
    }

    const request = await this.flowEconomicsService.createPoolRequest(
      req.user.userId,
      poolType,
      amount,
      reason,
    );

    return {
      success: true,
      request,
      message: 'Solicitud creada exitosamente. La comunidad la revisará pronto.',
    };
  }

  @ApiOperation({ summary: 'Get pool requests' })
  @ApiResponse({ status: 200, description: 'Returns pool requests' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pool-requests')
  async getPoolRequests(@Query('status') status?: RequestStatus) {
    return this.flowEconomicsService.getPoolRequests(status);
  }

  @ApiOperation({ summary: 'Get my pool requests' })
  @ApiResponse({ status: 200, description: 'Returns user pool requests' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-requests')
  async getMyRequests(@Request() req) {
    return this.flowEconomicsService.getMyPoolRequests(req.user.userId);
  }

  @ApiOperation({ summary: 'Get pool request by ID' })
  @ApiResponse({ status: 200, description: 'Returns pool request details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pool-requests/:id')
  async getPoolRequest(@Param('id') id: string) {
    return this.flowEconomicsService.getPoolRequestById(id);
  }

  @ApiOperation({ summary: 'Vote on pool request' })
  @ApiResponse({ status: 200, description: 'Vote recorded successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pool-requests/:id/vote')
  async voteOnRequest(
    @Request() req,
    @Param('id') requestId: string,
    @Body() body: { vote: boolean; comment?: string },
  ) {
    const { vote, comment } = body;

    const result = await this.flowEconomicsService.voteOnPoolRequest(
      requestId,
      req.user.userId,
      vote,
      comment,
    );

    return {
      success: true,
      message: vote ? 'Voto a favor registrado' : 'Voto en contra registrado',
      result,
    };
  }

  @ApiOperation({ summary: 'Approve pool request (admin or auto-approval)' })
  @ApiResponse({ status: 200, description: 'Request approved' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('pool-requests/:id/approve')
  async approveRequest(@Request() req, @Param('id') requestId: string) {
    const result = await this.flowEconomicsService.approvePoolRequest(
      requestId,
      req.user.userId,
    );

    return {
      success: true,
      message: 'Solicitud aprobada exitosamente',
      result,
    };
  }

  @ApiOperation({ summary: 'Reject pool request' })
  @ApiResponse({ status: 200, description: 'Request rejected' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('pool-requests/:id/reject')
  async rejectRequest(@Request() req, @Param('id') requestId: string) {
    const result = await this.flowEconomicsService.rejectPoolRequest(
      requestId,
      req.user.userId,
    );

    return {
      success: true,
      message: 'Solicitud rechazada',
      result,
    };
  }

  @ApiOperation({ summary: 'Distribute approved pool request' })
  @ApiResponse({ status: 200, description: 'Funds distributed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('pool-requests/:id/distribute')
  async distributeRequest(@Param('id') requestId: string) {
    const result = await this.flowEconomicsService.distributePoolRequest(requestId);

    return {
      success: true,
      message: 'Fondos distribuidos exitosamente',
      result,
    };
  }

  private interpretGini(gini: number): string {
    if (gini < 0.3) {
      return 'Excelente: Economía muy equitativa';
    } else if (gini < 0.4) {
      return 'Bueno: Economía equitativa';
    } else if (gini < 0.5) {
      return 'Moderado: Algo de desigualdad';
    } else if (gini < 0.6) {
      return 'Alto: Desigualdad significativa';
    } else {
      return 'Muy alto: Desigualdad extrema';
    }
  }
}
