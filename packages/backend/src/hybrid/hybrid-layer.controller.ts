import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { HybridLayerService } from './hybrid-layer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MigrateLayerDto } from './dto/migrate-layer.dto';
import { AnnounceAbundanceDto } from './dto/announce-abundance.dto';
import { ExpressNeedDto } from './dto/express-need.dto';
import { CreateBridgeEventDto } from './dto/create-bridge-event.dto';
import { UpdateCommunityLayerConfigDto } from './dto/update-community-layer-config.dto';

@Controller('hybrid')
@UseGuards(JwtAuthGuard)
export class HybridLayerController {
  constructor(private readonly hybridService: HybridLayerService) {}

  /**
   * POST /hybrid/migrate
   * Migrar usuario a una capa económica diferente
   */
  @Post('migrate')
  async migrateLayer(@Request() req, @Body() dto: MigrateLayerDto) {
    return this.hybridService.migrateUser(req.user.userId, dto);
  }

  /**
   * GET /hybrid/layer
   * Obtener capa económica actual del usuario
   */
  @Get('layer')
  async getCurrentLayer(@Request() req) {
    return this.hybridService.getUserLayer(req.user.userId);
  }

  /**
   * GET /hybrid/stats
   * Estadísticas de distribución de capas en la comunidad
   */
  @Get('stats')
  async getLayerStats(@Request() req, @Query('communityId') communityId?: string) {
    return this.hybridService.getLayerStats(communityId);
  }

  /**
   * POST /hybrid/abundance
   * Anunciar abundancia (anónimo en GIFT_PURE)
   */
  @Post('abundance')
  async announceAbundance(@Request() req, @Body() dto: AnnounceAbundanceDto) {
    return this.hybridService.announceAbundance(req.user.userId, dto);
  }

  /**
   * GET /hybrid/abundance
   * Feed de abundancia filtrado por capa del usuario
   */
  @Get('abundance')
  async getAbundanceFeed(
    @Request() req,
    @Query('communityId') communityId?: string,
    @Query('limit') limit?: string,
  ) {
    const user = await this.hybridService.getUserLayer(req.user.userId);

    return this.hybridService.getAbundanceFeed(
      user.layer,
      communityId,
      parseInt(limit) || 50,
    );
  }

  /**
   * POST /hybrid/needs
   * Expresar necesidad (puede ser anónima)
   */
  @Post('needs')
  async expressNeed(@Request() req, @Body() dto: ExpressNeedDto) {
    return this.hybridService.expressNeed(req.user.userId, dto);
  }

  /**
   * GET /hybrid/needs
   * Feed de necesidades filtrado por capa del usuario
   */
  @Get('needs')
  async getNeedsFeed(
    @Request() req,
    @Query('communityId') communityId?: string,
    @Query('urgency') urgency?: string,
    @Query('limit') limit?: string,
  ) {
    const user = await this.hybridService.getUserLayer(req.user.userId);

    return this.hybridService.getNeedsFeed(
      user.layer,
      communityId,
      urgency,
      parseInt(limit) || 50,
    );
  }

  /**
   * GET /hybrid/celebrations
   * Celebraciones anónimas de la comunidad
   */
  @Get('celebrations')
  async getCelebrations(
    @Query('communityId') communityId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hybridService.getCelebrations(
      communityId,
      parseInt(limit) || 20,
    );
  }

  /**
   * GET /hybrid/migrations
   * Historial de migraciones del usuario
   */
  @Get('migrations')
  async getMigrationHistory(@Request() req) {
    return this.hybridService.getUserMigrationHistory(req.user.userId);
  }

  /**
   * GET /hybrid/bridge-events
   * Eventos puente disponibles (Gift Days, etc.)
   */
  @Get('bridge-events')
  async getBridgeEvents(@Query('communityId') communityId?: string) {
    return this.hybridService.getActiveBridgeEvents(communityId);
  }

  /**
   * POST /hybrid/abundance/:id/take
   * Tomar abundancia anunciada
   */
  @Post('abundance/:id/take')
  async takeAbundance(@Request() req, @Param('id') abundanceId: string) {
    return this.hybridService.takeAbundance(req.user.userId, abundanceId);
  }

  /**
   * POST /hybrid/needs/:id/fulfill
   * Cumplir una necesidad expresada
   */
  @Post('needs/:id/fulfill')
  async fulfillNeed(@Request() req, @Param('id') needId: string) {
    return this.hybridService.fulfillNeed(req.user.userId, needId);
  }

  /**
   * POST /hybrid/bridge-events
   * Crear evento puente (Gift Day, Debt Amnesty, etc.)
   */
  @Post('bridge-events')
  async createBridgeEvent(@Body() dto: CreateBridgeEventDto) {
    return this.hybridService.createBridgeEvent(dto);
  }

  /**
   * GET /hybrid/community/:communityId/config
   * Obtener configuración de capas de la comunidad
   */
  @Get('community/:communityId/config')
  async getCommunityLayerConfig(@Param('communityId') communityId: string) {
    return this.hybridService.getCommunityLayerConfig(communityId);
  }

  /**
   * PUT /hybrid/community/:communityId/config
   * Actualizar configuración de capas de la comunidad
   */
  @Put('community/:communityId/config')
  async updateCommunityLayerConfig(
    @Param('communityId') communityId: string,
    @Body() dto: UpdateCommunityLayerConfigDto,
  ) {
    return this.hybridService.updateCommunityLayerConfig(communityId, dto);
  }

  /**
   * GET /hybrid/community/:communityId/gift-threshold
   * Verificar si comunidad alcanzó umbral para migración a GIFT_PURE
   */
  @Get('community/:communityId/gift-threshold')
  async checkGiftThreshold(@Param('communityId') communityId: string) {
    return this.hybridService.checkGiftMigrationThreshold(communityId);
  }
}
