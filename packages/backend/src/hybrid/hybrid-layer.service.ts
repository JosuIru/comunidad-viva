import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EconomicLayer } from '@prisma/client';
import { MigrateLayerDto } from './dto/migrate-layer.dto';
import { AnnounceAbundanceDto } from './dto/announce-abundance.dto';
import { ExpressNeedDto } from './dto/express-need.dto';
import { CreateBridgeEventDto } from './dto/create-bridge-event.dto';
import { UpdateCommunityLayerConfigDto } from './dto/update-community-layer-config.dto';

@Injectable()
export class HybridLayerService {
  constructor(private prisma: PrismaService) {}

  /**
   * MIGRACIÓN ENTRE CAPAS
   */
  async migrateUser(userId: string, dto: MigrateLayerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        economicLayer: true,
        credits: true,
        softCredits: true,
        communityId: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const fromLayer = user.economicLayer;
    const toLayer = dto.toLayer;

    if (fromLayer === toLayer) {
      throw new BadRequestException('Ya estás en esa capa');
    }

    // Ejecutar migración específica
    const migrationResult = await this.executeMigration(userId, fromLayer, toLayer, user);

    // Registrar migración
    await this.prisma.layerMigration.create({
      data: {
        userId,
        fromLayer,
        toLayer,
        reason: dto.reason,
        creditsConverted: migrationResult.creditsConverted,
      },
    });

    // Actualizar usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        economicLayer: toLayer,
        lastLayerChange: new Date(),
        ...(migrationResult.updates || {}),
      },
    });

    // Actualizar contador de comunidad si existe
    if (user.communityId) {
      await this.updateCommunityLayerStats(user.communityId);
    }

    return migrationResult.message;
  }

  /**
   * LÓGICA ESPECÍFICA DE CADA MIGRACIÓN
   */
  private async executeMigration(
    userId: string,
    fromLayer: EconomicLayer,
    toLayer: EconomicLayer,
    user: any,
  ) {
    const key = `${fromLayer}_TO_${toLayer}`;

    const migrations = {
      // TRADICIONAL → TRANSICIONAL
      TRADITIONAL_TO_TRANSITIONAL: async () => {
        const currentBalance = user.credits || 0;

        return {
          creditsConverted: 0,
          updates: {
            softCredits: currentBalance,
          },
          message: {
            title: 'Bienvenid@ al modo transición 🌿',
            body: 'Tus créditos ahora son opcionales. Puedes usarlos o ignorarlos.',
            preserved: ['Créditos (opcionales)', 'Conexiones', 'Historial suave'],
            removed: ['Rankings', 'Historial detallado permanente'],
            new: ['Estado de flujo', 'Métricas colectivas', 'Olvido automático (30 días)'],
          },
        };
      },

      // TRANSICIONAL → REGALO PURO
      TRANSITIONAL_TO_GIFT_PURE: async () => {
        const softCredits = user.softCredits || 0;

        // Donar créditos al común si existen
        if (softCredits > 0) {
          // TODO: Implementar donación a pool común
          await this.createCelebration({
            event: `${softCredits} créditos liberados al flujo común ✨`,
            communityId: user.communityId,
          });
        }

        return {
          creditsConverted: softCredits,
          updates: {
            softCredits: null,
          },
          message: {
            title: 'Has entrado al regalo puro 🌳',
            body: 'Ya no hay cuentas que llevar. Solo flujo y celebración.',
            released: ['Créditos al común', 'Identidad transaccional'],
            gained: ['Libertad total', 'Presencia en el regalo', 'Cero cálculo mental'],
          },
        };
      },

      // TRADICIONAL → REGALO PURO (salto directo)
      TRADITIONAL_TO_GIFT_PURE: async () => {
        const credits = user.credits || 0;

        if (credits > 0) {
          await this.createCelebration({
            event: `${credits} créditos liberados al flujo común 🎉`,
            communityId: user.communityId,
          });
        }

        return {
          creditsConverted: credits,
          updates: {
            softCredits: null,
          },
          message: {
            title: '¡Salto cuántico al regalo puro! 🌳✨',
            body: 'Has dado el salto completo. Total libertad.',
            released: ['Todo el sistema de medición', 'Créditos', 'Balances', 'Historiales'],
            gained: ['Libertad absoluta', 'Confianza total', 'Flujo puro'],
            note: 'Siempre puedes volver si lo necesitas, sin juicio.',
          },
        };
      },

      // REGALO PURO → TRANSICIONAL (regreso)
      GIFT_PURE_TO_TRANSITIONAL: async () => {
        return {
          creditsConverted: 0,
          updates: {
            softCredits: 50, // Regalo de bienvenida
          },
          message: {
            title: 'Bienvenid@ de vuelta al modo transición 🌿',
            body: 'Perfil suave creado. 50 créditos de regalo para empezar.',
            note: 'Tu tiempo en regalo puro no se perdió, fue un regalo para todos.',
            gained: ['Flexibilidad', 'Créditos opcionales'],
          },
        };
      },

      // TRANSICIONAL → TRADICIONAL (regreso completo)
      TRANSITIONAL_TO_TRADITIONAL: async () => {
        const softCredits = user.softCredits || 0;

        return {
          creditsConverted: 0,
          updates: {
            credits: softCredits > 0 ? softCredits : 50,
            softCredits: null,
          },
          message: {
            title: 'Regreso al modo tradicional 🌱',
            body: 'Seguimiento completo restaurado.',
            startingBalance: softCredits > 0 ? softCredits : 50,
            note: 'Empiezas con tus créditos anteriores, o 50 de regalo.',
          },
        };
      },

      // REGALO PURO → TRADICIONAL (regreso completo)
      GIFT_PURE_TO_TRADITIONAL: async () => {
        return {
          creditsConverted: 0,
          updates: {
            credits: 100, // Regalo generoso de bienvenida
          },
          message: {
            title: 'Regreso al modo tradicional 🌱',
            body: 'Sistema completo de seguimiento activado.',
            startingBalance: 100,
            note: 'Recibes 100 créditos de regalo. Tu experiencia en regalo fue valiosa.',
          },
        };
      },

      // CAMALEÓN → Cualquiera
      CHAMELEON_TO_TRADITIONAL: async () => ({
        creditsConverted: 0,
        updates: { credits: 50 },
        message: {
          title: 'Modo tradicional activado 🌱',
          body: 'Has fijado tu capa. Ya no te adaptas automáticamente.',
        },
      }),

      CHAMELEON_TO_TRANSITIONAL: async () => ({
        creditsConverted: 0,
        updates: { softCredits: 50 },
        message: {
          title: 'Modo transición activado 🌿',
          body: 'Has fijado tu capa. Ya no te adaptas automáticamente.',
        },
      }),

      CHAMELEON_TO_GIFT_PURE: async () => ({
        creditsConverted: 0,
        updates: {},
        message: {
          title: 'Modo regalo puro activado 🌳',
          body: 'Has fijado tu capa. Ya no te adaptas automáticamente.',
        },
      }),

      // Cualquiera → CAMALEÓN
      TRADITIONAL_TO_CHAMELEON: async () => ({
        creditsConverted: 0,
        updates: {},
        message: {
          title: 'Modo camaleón activado 🦎',
          body: 'Ahora te adaptas a la capa de quien interactúas. Eres un puente.',
          ability: 'Traductor universal entre capas',
        },
      }),

      TRANSITIONAL_TO_CHAMELEON: async () => ({
        creditsConverted: 0,
        updates: {},
        message: {
          title: 'Modo camaleón activado 🦎',
          body: 'Ahora te adaptas a la capa de quien interactúas. Eres un puente.',
        },
      }),

      GIFT_PURE_TO_CHAMELEON: async () => ({
        creditsConverted: 0,
        updates: {},
        message: {
          title: 'Modo camaleón activado 🦎',
          body: 'Mantienes la consciencia del regalo, pero puedes hablar todos los idiomas.',
        },
      }),
    };

    if (!migrations[key]) {
      throw new BadRequestException(`Migración ${key} no implementada`);
    }

    return await migrations[key]();
  }

  /**
   * ANUNCIAR ABUNDANCIA
   */
  async announceAbundance(userId: string, dto: AnnounceAbundanceDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { economicLayer: true, communityId: true },
    });

    // En regalo puro, el anuncio es anónimo
    const isAnonymous = user.economicLayer === 'GIFT_PURE';

    const announcement = await this.prisma.abundanceAnnouncement.create({
      data: {
        communityId: user.communityId,
        providerId: isAnonymous ? null : userId,
        what: dto.what,
        quantity: dto.quantity,
        where: dto.where,
        lat: dto.lat,
        lng: dto.lng,
        availableUntil: dto.availableUntil ? new Date(dto.availableUntil) : null,
        visibleToLayers: dto.visibleToLayers || ['TRADITIONAL', 'TRANSITIONAL', 'GIFT_PURE'],
      },
    });

    return {
      id: announcement.id,
      message: isAnonymous
        ? `🎁 Abundancia anunciada: ${dto.what}`
        : `✨ Has compartido: ${dto.what}`,
      anonymous: isAnonymous,
    };
  }

  /**
   * EXPRESAR NECESIDAD
   */
  async expressNeed(userId: string, dto: ExpressNeedDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { economicLayer: true, communityId: true },
    });

    // Permitir anonimato si se solicita o si está en regalo puro
    const isAnonymous = dto.anonymous || user.economicLayer === 'GIFT_PURE';

    const need = await this.prisma.needExpression.create({
      data: {
        communityId: user.communityId,
        requesterId: isAnonymous ? null : userId,
        what: dto.what,
        why: dto.why,
        where: dto.where,
        urgency: dto.urgency,
        visibleToLayers: dto.visibleToLayers || ['TRADITIONAL', 'TRANSITIONAL', 'GIFT_PURE'],
      },
    });

    return {
      id: need.id,
      message: isAnonymous
        ? `💝 Necesidad expresada: ${dto.what}`
        : `🙏 Has expresado una necesidad: ${dto.what}`,
      anonymous: isAnonymous,
    };
  }

  /**
   * CREAR CELEBRACIÓN ANÓNIMA
   */
  async createCelebration(data: {
    event: string;
    description?: string;
    emoji?: string;
    communityId?: string;
    approximateParticipants?: number;
  }) {
    return this.prisma.anonymousCelebration.create({
      data: {
        event: data.event,
        description: data.description,
        emoji: data.emoji || '🎉',
        communityId: data.communityId,
        approximateParticipants: data.approximateParticipants,
      },
    });
  }

  /**
   * OBTENER FEED DE ABUNDANCIA
   */
  async getAbundanceFeed(userLayer: EconomicLayer, communityId?: string, limit = 50) {
    return this.prisma.abundanceAnnouncement.findMany({
      where: {
        communityId,
        visibleToLayers: {
          has: userLayer,
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * OBTENER FEED DE NECESIDADES
   */
  async getNeedsFeed(userLayer: EconomicLayer, communityId?: string, urgency?: string, limit = 50) {
    const where: any = {
      communityId,
      visibleToLayers: {
        has: userLayer,
      },
      fulfilledAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (urgency) {
      where.urgency = urgency;
    }

    return this.prisma.needExpression.findMany({
      where,
      orderBy: [
        { urgency: 'desc' }, // URGENT primero
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * OBTENER CELEBRACIONES RECIENTES
   */
  async getCelebrations(communityId?: string, limit = 20) {
    return this.prisma.anonymousCelebration.findMany({
      where: {
        communityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * ACTUALIZAR ESTADÍSTICAS DE CAPAS EN COMUNIDAD
   */
  private async updateCommunityLayerStats(communityId: string) {
    const stats = await this.prisma.user.groupBy({
      by: ['economicLayer'],
      where: {
        communityId,
      },
      _count: true,
    });

    const counts = {
      traditionalCount: 0,
      transitionalCount: 0,
      giftCount: 0,
      chameleonCount: 0,
    };

    stats.forEach((stat) => {
      switch (stat.economicLayer) {
        case 'TRADITIONAL':
          counts.traditionalCount = stat._count;
          break;
        case 'TRANSITIONAL':
          counts.transitionalCount = stat._count;
          break;
        case 'GIFT_PURE':
          counts.giftCount = stat._count;
          break;
        case 'CHAMELEON':
          counts.chameleonCount = stat._count;
          break;
      }
    });

    // Actualizar o crear config de comunidad
    await this.prisma.communityLayerConfig.upsert({
      where: { communityId },
      create: {
        communityId,
        ...counts,
      },
      update: counts,
    });

    return counts;
  }

  /**
   * OBTENER ESTADÍSTICAS DE CAPAS
   */
  async getLayerStats(communityId?: string) {
    if (communityId) {
      const config = await this.prisma.communityLayerConfig.findUnique({
        where: { communityId },
      });

      if (!config) {
        await this.updateCommunityLayerStats(communityId);
        return this.getLayerStats(communityId);
      }

      const total =
        config.traditionalCount +
        config.transitionalCount +
        config.giftCount +
        config.chameleonCount;

      return {
        distribution: {
          traditional: config.traditionalCount,
          transitional: config.transitionalCount,
          gift: config.giftCount,
          chameleon: config.chameleonCount,
        },
        percentages: {
          traditional: total > 0 ? Math.round((config.traditionalCount / total) * 100) : 0,
          transitional: total > 0 ? Math.round((config.transitionalCount / total) * 100) : 0,
          gift: total > 0 ? Math.round((config.giftCount / total) * 100) : 0,
          chameleon: total > 0 ? Math.round((config.chameleonCount / total) * 100) : 0,
        },
        total,
      };
    }

    // Estadísticas globales
    const stats = await this.prisma.user.groupBy({
      by: ['economicLayer'],
      _count: true,
    });

    const counts = {
      traditional: 0,
      transitional: 0,
      gift: 0,
      chameleon: 0,
    };

    let total = 0;

    stats.forEach((stat) => {
      const count = stat._count;
      total += count;

      switch (stat.economicLayer) {
        case 'TRADITIONAL':
          counts.traditional = count;
          break;
        case 'TRANSITIONAL':
          counts.transitional = count;
          break;
        case 'GIFT_PURE':
          counts.gift = count;
          break;
        case 'CHAMELEON':
          counts.chameleon = count;
          break;
      }
    });

    return {
      distribution: counts,
      percentages: {
        traditional: total > 0 ? Math.round((counts.traditional / total) * 100) : 0,
        transitional: total > 0 ? Math.round((counts.transitional / total) * 100) : 0,
        gift: total > 0 ? Math.round((counts.gift / total) * 100) : 0,
        chameleon: total > 0 ? Math.round((counts.chameleon / total) * 100) : 0,
      },
      total,
    };
  }

  /**
   * OBTENER HISTORIAL DE MIGRACIONES DE UN USUARIO
   */
  async getUserMigrationHistory(userId: string) {
    return this.prisma.layerMigration.findMany({
      where: { userId },
      orderBy: { migratedAt: 'desc' },
    });
  }

  /**
   * OBTENER CAPA ACTUAL DEL USUARIO
   */
  async getUserLayer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        economicLayer: true,
        layerConfig: true,
        softCredits: true,
        credits: true,
        lastLayerChange: true,
      },
    });

    return {
      ...user,
      layer: user.economicLayer,
    };
  }

  /**
   * OBTENER EVENTOS PUENTE ACTIVOS
   */
  async getActiveBridgeEvents(communityId?: string) {
    const now = new Date();

    return this.prisma.bridgeEvent.findMany({
      where: {
        communityId,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: {
        startsAt: 'desc',
      },
    });
  }

  /**
   * TOMAR ABUNDANCIA ANUNCIADA
   */
  async takeAbundance(userId: string, abundanceId: string) {
    const abundance = await this.prisma.abundanceAnnouncement.findUnique({
      where: { id: abundanceId },
    });

    if (!abundance) {
      throw new BadRequestException('Abundancia no encontrada');
    }

    // Verificar que no haya expirado
    if (abundance.expiresAt && abundance.expiresAt < new Date()) {
      throw new BadRequestException('Esta abundancia ya expiró');
    }

    // Agregar usuario a la lista de quien lo tomó
    const updatedTakenBy = [...(abundance.takenBy || []), userId];

    await this.prisma.abundanceAnnouncement.update({
      where: { id: abundanceId },
      data: {
        takenBy: updatedTakenBy,
      },
    });

    // Crear celebración anónima
    await this.createCelebration({
      event: 'Una abundancia encontró quien la necesitaba 🌿',
      communityId: abundance.communityId,
      emoji: '💚',
    });

    return {
      message: `✨ Has recibido: ${abundance.what}`,
      what: abundance.what,
      where: abundance.where,
    };
  }

  /**
   * CUMPLIR UNA NECESIDAD EXPRESADA
   */
  async fulfillNeed(userId: string, needId: string) {
    const need = await this.prisma.needExpression.findUnique({
      where: { id: needId },
    });

    if (!need) {
      throw new BadRequestException('Necesidad no encontrada');
    }

    if (need.fulfilledAt) {
      throw new BadRequestException('Esta necesidad ya fue cumplida');
    }

    // Verificar que no haya expirado
    if (need.expiresAt && need.expiresAt < new Date()) {
      throw new BadRequestException('Esta necesidad ya expiró');
    }

    // Agregar usuario a la lista de quien la cumplió
    const updatedFulfilledBy = [...(need.fulfilledBy || []), userId];

    await this.prisma.needExpression.update({
      where: { id: needId },
      data: {
        fulfilledBy: updatedFulfilledBy,
        fulfilledAt: new Date(),
      },
    });

    // Crear celebración anónima
    await this.createCelebration({
      event: 'Una necesidad encontró abundancia 💝',
      communityId: need.communityId,
      emoji: '🎁',
    });

    return {
      message: `💚 Has ayudado con: ${need.what}`,
      what: need.what,
    };
  }

  /**
   * CREAR EVENTO PUENTE
   */
  async createBridgeEvent(dto: CreateBridgeEventDto) {
    return this.prisma.bridgeEvent.create({
      data: {
        type: dto.type,
        title: dto.title,
        description: dto.description,
        forceLayer: dto.forceLayer,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        recurring: dto.recurring || false,
        frequency: dto.frequency,
        communityId: dto.communityId,
      },
    });
  }

  /**
   * OBTENER CONFIGURACIÓN DE CAPAS DE COMUNIDAD
   */
  async getCommunityLayerConfig(communityId: string) {
    let config = await this.prisma.communityLayerConfig.findUnique({
      where: { communityId },
    });

    if (!config) {
      // Crear configuración por defecto
      config = await this.prisma.communityLayerConfig.create({
        data: {
          communityId,
          defaultLayer: 'TRADITIONAL',
          allowMixedMode: true,
          autoGiftDays: true,
          autoDebtAmnesty: true,
          giftThreshold: 60,
        },
      });
    }

    return config;
  }

  /**
   * ACTUALIZAR CONFIGURACIÓN DE CAPAS DE COMUNIDAD
   */
  async updateCommunityLayerConfig(
    communityId: string,
    dto: UpdateCommunityLayerConfigDto,
  ) {
    // Verificar que existe o crear
    await this.getCommunityLayerConfig(communityId);

    return this.prisma.communityLayerConfig.update({
      where: { communityId },
      data: dto,
    });
  }

  /**
   * VERIFICAR SI COMUNIDAD DEBE PROPONER MIGRACIÓN A GIFT_PURE
   */
  async checkGiftMigrationThreshold(communityId: string) {
    const config = await this.getCommunityLayerConfig(communityId);
    const stats = await this.getLayerStats(communityId);

    const giftPercentage = stats.percentages.gift;

    if (giftPercentage >= config.giftThreshold) {
      return {
        shouldPropose: true,
        currentPercentage: giftPercentage,
        threshold: config.giftThreshold,
        message: `🌳 ¡${giftPercentage}% de la comunidad ya vive en regalo puro!

¿Quieren migrar toda la comunidad al modo GIFT_PURE?`,
      };
    }

    return {
      shouldPropose: false,
      currentPercentage: giftPercentage,
      threshold: config.giftThreshold,
    };
  }
}
