import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BadgeType } from '@prisma/client';

/**
 * Achievements Controller
 *
 * Endpoints:
 * - GET /achievements/my-badges - Badges del usuario
 * - GET /achievements/progress - Progreso de todos los badges
 * - GET /achievements/stats - Estadísticas de badges
 * - GET /achievements/catalog - Catálogo completo de badges
 * - POST /achievements/check - Forzar check de achievements
 * - POST /achievements/mark-seen - Marcar badges como vistos
 */
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  /**
   * GET /achievements/my-badges
   * Obtener todos los badges desbloqueados del usuario
   */
  @Get('my-badges')
  async getMyBadges(@Request() req) {
    const userId = req.user.userId;
    return this.achievementsService.getUserBadges(userId);
  }

  /**
   * GET /achievements/progress
   * Obtener progreso hacia todos los badges (desbloqueados y bloqueados)
   */
  @Get('progress')
  async getBadgeProgress(@Request() req) {
    const userId = req.user.userId;
    return this.achievementsService.getBadgeProgress(userId);
  }

  /**
   * GET /achievements/stats
   * Estadísticas generales de badges del usuario
   */
  @Get('stats')
  async getStats(@Request() req) {
    const userId = req.user.userId;
    return this.achievementsService.getUserBadgeStats(userId);
  }

  /**
   * GET /achievements/catalog
   * Catálogo completo de todos los badges disponibles
   */
  @Get('catalog')
  async getCatalog() {
    return this.achievementsService.getAllBadgeDefinitions().map((def) => ({
      type: def.type,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      category: def.category,
      maxProgress: def.maxProgress,
      rewards: def.rewards,
    }));
  }

  /**
   * GET /achievements/badge/:badgeType
   * Información detallada de un badge específico
   */
  @Get('badge/:badgeType')
  async getBadgeInfo(@Param('badgeType') badgeType: BadgeType) {
    const definition = this.achievementsService.getBadgeDefinition(badgeType);
    if (!definition) {
      return { error: 'Badge not found' };
    }

    return {
      type: definition.type,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      rarity: definition.rarity,
      category: definition.category,
      maxProgress: definition.maxProgress,
      rewards: definition.rewards,
    };
  }

  /**
   * POST /achievements/check
   * Forzar verificación de achievements
   * (normalmente se hace automáticamente después de acciones)
   */
  @Post('check')
  async checkAchievements(@Request() req) {
    const userId = req.user.userId;
    const newBadges = await this.achievementsService.checkAchievements(userId);

    return {
      checked: true,
      newBadges,
      message: newBadges.length > 0
        ? `¡Desbloqueaste ${newBadges.length} nuevo(s) badge(s)!`
        : 'No hay nuevos badges por ahora',
    };
  }

  /**
   * POST /achievements/mark-seen
   * Marcar badges como vistos (quita flag "isNew")
   */
  @Post('mark-seen')
  async markBadgesAsSeen(
    @Request() req,
    @Body() body: { badgeTypes: BadgeType[] },
  ) {
    const userId = req.user.userId;
    await this.achievementsService.markBadgesAsSeen(userId, body.badgeTypes);

    return {
      success: true,
      message: 'Badges marcados como vistos',
    };
  }

  /**
   * GET /achievements/leaderboard/:category
   * Leaderboard por categoría de badges
   */
  @Get('leaderboard/:category')
  async getLeaderboard(@Param('category') category: string) {
    // TODO: Implementar leaderboard por categoría
    return {
      category,
      message: 'Leaderboard coming soon',
    };
  }
}
