import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BridgeSecurityService } from './bridge-security.service';

/**
 * Bridge Admin Controller
 *
 * Endpoints administrativos para gestionar la seguridad del bridge.
 * Solo accesible por administradores.
 */
@ApiTags('Bridge Admin')
@ApiBearerAuth()
@Controller('bridge/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BridgeAdminController {
  constructor(private bridgeSecurity: BridgeSecurityService) {}

  /**
   * Obtener estado del circuit breaker
   */
  @Get('circuit-breaker/status')
  @ApiOperation({ summary: 'Get circuit breaker status' })
  getCircuitBreakerStatus() {
    return this.bridgeSecurity.getCircuitBreakerStatus();
  }

  /**
   * Abrir circuit breaker (emergency stop)
   */
  @Post('circuit-breaker/open')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Open circuit breaker (emergency stop)' })
  async openCircuitBreaker(@Body() body: { reason: string }) {
    await this.bridgeSecurity.openCircuitBreaker(body.reason);
    return {
      success: true,
      message: 'Circuit breaker opened - all bridge operations stopped',
      reason: body.reason,
    };
  }

  /**
   * Cerrar circuit breaker (resume operations)
   */
  @Post('circuit-breaker/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close circuit breaker (resume operations)' })
  async closeCircuitBreaker() {
    await this.bridgeSecurity.closeCircuitBreaker();
    return {
      success: true,
      message: 'Circuit breaker closed - bridge operations resumed',
    };
  }

  /**
   * Añadir DID a lista negra
   */
  @Post('blacklist/did')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add DID to blacklist' })
  async blacklistDID(
    @Body() body: { did: string; reason: string },
  ) {
    await this.bridgeSecurity.addToBlacklist('DID', body.did, body.reason);
    return {
      success: true,
      message: `DID ${body.did} added to blacklist`,
      reason: body.reason,
    };
  }

  /**
   * Añadir dirección a lista negra
   */
  @Post('blacklist/address')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add address to blacklist' })
  async blacklistAddress(
    @Body() body: { address: string; reason: string },
  ) {
    await this.bridgeSecurity.addToBlacklist(
      'ADDRESS',
      body.address,
      body.reason,
    );
    return {
      success: true,
      message: `Address ${body.address} added to blacklist`,
      reason: body.reason,
    };
  }

  /**
   * Obtener eventos de seguridad recientes
   */
  @Get('security-events')
  @ApiOperation({ summary: 'Get recent security events' })
  async getSecurityEvents() {
    const events = await this.bridgeSecurity.getSecurityEvents(100);
    return {
      success: true,
      count: events.length,
      events,
    };
  }

  /**
   * Obtener estadísticas de seguridad
   */
  @Get('security-stats')
  @ApiOperation({ summary: 'Get security statistics' })
  async getSecurityStats() {
    const stats = await this.bridgeSecurity.getSecurityStats();
    return {
      success: true,
      stats,
    };
  }

  /**
   * Obtener lista negra
   */
  @Get('blacklist')
  @ApiOperation({ summary: 'Get blacklist entries' })
  async getBlacklist() {
    const [dids, addresses] = await Promise.all([
      this.bridgeSecurity.getBlacklist('DID'),
      this.bridgeSecurity.getBlacklist('ADDRESS'),
    ]);

    return {
      success: true,
      blacklist: {
        dids,
        addresses,
        total: dids.length + addresses.length,
      },
    };
  }

  /**
   * Remover de la lista negra
   */
  @Post('blacklist/:id/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove from blacklist' })
  async removeFromBlacklist(@Param('id') id: string) {
    await this.bridgeSecurity.removeFromBlacklist(id);
    return {
      success: true,
      message: 'Entry removed from blacklist',
    };
  }
}
