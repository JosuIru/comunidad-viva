import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BridgeService, BridgeChain } from './bridge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('bridge')
@Controller('bridge')
export class BridgeController {
  constructor(private bridgeService: BridgeService) {}

  /**
   * Lock SEMILLA and bridge to external chain
   */
  @ApiOperation({ summary: 'Lock SEMILLA and bridge to external blockchain' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('lock')
  async lockAndBridge(
    @Request() req,
    @Body() body: {
      amount: number;
      targetChain: BridgeChain;
      externalAddress: string;
    },
  ) {
    // Get user DID from auth
    const user = await req.user; // Assuming user has gailuDID

    return await this.bridgeService.lockAndBridge(
      user.gailuDID || `did:gailu:local:user:${user.userId}`,
      body.amount,
      body.targetChain,
      body.externalAddress,
    );
  }

  /**
   * Unlock SEMILLA after burning on external chain
   */
  @ApiOperation({ summary: 'Unlock SEMILLA after burning wrapped tokens on external chain' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('unlock')
  async burnAndUnlock(
    @Request() req,
    @Body() body: {
      amount: number;
      sourceChain: BridgeChain;
      externalTxHash: string;
    },
  ) {
    const user = await req.user;

    return await this.bridgeService.burnAndUnlock(
      user.gailuDID || `did:gailu:local:user:${user.userId}`,
      body.amount,
      body.sourceChain,
      body.externalTxHash,
    );
  }

  /**
   * Get bridge transaction status
   */
  @ApiOperation({ summary: 'Get bridge transaction status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transaction/:id')
  async getBridgeTransaction(@Param('id') id: string) {
    return await this.bridgeService.getBridgeTransaction(id);
  }

  /**
   * Get user's bridge history
   */
  @ApiOperation({ summary: 'Get user bridge transaction history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req) {
    const user = await req.user;

    return await this.bridgeService.getUserBridgeHistory(
      user.gailuDID || `did:gailu:local:user:${user.userId}`,
    );
  }

  /**
   * Get bridge statistics
   */
  @ApiOperation({ summary: 'Get bridge statistics' })
  @Get('stats')
  async getStats() {
    return await this.bridgeService.getBridgeStats();
  }

  /**
   * Get supported chains configuration
   */
  @ApiOperation({ summary: 'Get supported chains and their configuration' })
  @Get('chains')
  async getSupportedChains() {
    return this.bridgeService.getSupportedChains();
  }
}
