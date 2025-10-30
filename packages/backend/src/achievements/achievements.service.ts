import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeType } from '@prisma/client';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

/**
 * Achievements Service
 *
 * Sistema completo de achievements/badges con:
 * - Auto-checking de condiciones para cada badge
 * - Notificaciones en tiempo real via WebSocket
 * - Progreso hacia siguiente badge
 * - Sistema de tiers (10 -> 50 -> 100 -> 500 -> 1000)
 * - Badges especiales y secretos
 */

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string; // Emoji o nombre de ícono
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'SECRET';
  category: string;
  checkCondition: (userId: string, prisma: PrismaService) => Promise<boolean>;
  getProgress?: (userId: string, prisma: PrismaService) => Promise<number>;
  maxProgress?: number;
  rewards?: {
    credits?: number;
    xp?: number;
    title?: string;
  };
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);
  private badgeDefinitions: Map<BadgeType, BadgeDefinition>;

  constructor(
    private prisma: PrismaService,
    private wsGateway: AppWebSocketGateway,
  ) {
    this.badgeDefinitions = this.initializeBadgeDefinitions();
  }

  /**
   * Definiciones completas de todos los badges
   */
  private initializeBadgeDefinitions(): Map<BadgeType, BadgeDefinition> {
    const definitions: BadgeDefinition[] = [
      // === AYUDA MUTUA ===
      {
        type: BadgeType.HELPER_10,
        name: 'Ayudante',
        description: 'Ayudaste a 10 personas a través del banco de tiempo',
        icon: '🤝',
        rarity: 'COMMON',
        category: 'AYUDA_MUTUA',
        maxProgress: 10,
        rewards: { credits: 50, xp: 100 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.peopleHelped || 0) >= 10;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.peopleHelped || 0;
        },
      },
      {
        type: BadgeType.HELPER_50,
        name: 'Gran Ayudante',
        description: 'Ayudaste a 50 personas',
        icon: '🤝✨',
        rarity: 'RARE',
        category: 'AYUDA_MUTUA',
        maxProgress: 50,
        rewards: { credits: 200, xp: 500 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.peopleHelped || 0) >= 50;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.peopleHelped || 0;
        },
      },
      {
        type: BadgeType.HELPER_100,
        name: 'Héroe Comunitario',
        description: 'Ayudaste a 100 personas',
        icon: '🦸',
        rarity: 'EPIC',
        category: 'AYUDA_MUTUA',
        maxProgress: 100,
        rewards: { credits: 500, xp: 1000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.peopleHelped || 0) >= 100;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.peopleHelped || 0;
        },
      },
      {
        type: BadgeType.HELPER_500,
        name: 'Ángel de la Comunidad',
        description: 'Ayudaste a 500 personas - ¡Eres una inspiración!',
        icon: '👼',
        rarity: 'LEGENDARY',
        category: 'AYUDA_MUTUA',
        maxProgress: 500,
        rewards: { credits: 2000, xp: 5000, title: 'Ángel' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.peopleHelped || 0) >= 500;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.peopleHelped || 0;
        },
      },
      {
        type: BadgeType.HELPER_1000,
        name: 'Santo Patrono',
        description: 'Ayudaste a 1000 personas - ¡LEGENDARIO!',
        icon: '🌟',
        rarity: 'LEGENDARY',
        category: 'AYUDA_MUTUA',
        maxProgress: 1000,
        rewards: { credits: 5000, xp: 10000, title: 'Santo' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.peopleHelped || 0) >= 1000;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.peopleHelped || 0;
        },
      },

      // === TIEMPO COMPARTIDO ===
      {
        type: BadgeType.TIME_GIVER_10,
        name: 'Donante de Tiempo',
        description: 'Compartiste 10 horas de tu tiempo',
        icon: '⏰',
        rarity: 'COMMON',
        category: 'TIEMPO',
        maxProgress: 10,
        rewards: { credits: 50, xp: 100 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.hoursShared || 0) >= 10;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.hoursShared || 0);
        },
      },
      {
        type: BadgeType.TIME_GIVER_50,
        name: 'Generoso Temporal',
        description: 'Compartiste 50 horas',
        icon: '⏰✨',
        rarity: 'RARE',
        category: 'TIEMPO',
        maxProgress: 50,
        rewards: { credits: 200, xp: 500 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.hoursShared || 0) >= 50;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.hoursShared || 0);
        },
      },
      {
        type: BadgeType.TIME_GIVER_100,
        name: 'Maestro del Tiempo',
        description: 'Compartiste 100 horas - ¡4 días completos!',
        icon: '🕰️',
        rarity: 'EPIC',
        category: 'TIEMPO',
        maxProgress: 100,
        rewards: { credits: 500, xp: 1000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.hoursShared || 0) >= 100;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.hoursShared || 0);
        },
      },
      {
        type: BadgeType.TIME_GIVER_500,
        name: 'Crononauta',
        description: 'Compartiste 500 horas - ¡Más de 20 días!',
        icon: '⌛',
        rarity: 'LEGENDARY',
        category: 'TIEMPO',
        maxProgress: 500,
        rewards: { credits: 2000, xp: 5000, title: 'Crononauta' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.hoursShared || 0) >= 500;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.hoursShared || 0);
        },
      },
      {
        type: BadgeType.TIME_GIVER_1000,
        name: 'Señor del Tiempo',
        description: 'Compartiste 1000 horas - ¡41 días!',
        icon: '⏳🌟',
        rarity: 'LEGENDARY',
        category: 'TIEMPO',
        maxProgress: 1000,
        rewards: { credits: 5000, xp: 10000, title: 'Señor del Tiempo' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.hoursShared || 0) >= 1000;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.hoursShared || 0);
        },
      },

      // === ORGANIZACIÓN DE EVENTOS ===
      {
        type: BadgeType.ORGANIZER_FIRST,
        name: 'Primer Evento',
        description: 'Organizaste tu primer evento comunitario',
        icon: '🎪',
        rarity: 'COMMON',
        category: 'EVENTOS',
        rewards: { credits: 100, xp: 200 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.event.count({
            where: { organizerId: userId },
          });
          return count >= 1;
        },
      },
      {
        type: BadgeType.ORGANIZER_5,
        name: 'Organizador Activo',
        description: 'Organizaste 5 eventos',
        icon: '🎭',
        rarity: 'RARE',
        category: 'EVENTOS',
        maxProgress: 5,
        rewards: { credits: 300, xp: 600 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.event.count({
            where: { organizerId: userId },
          });
          return count >= 5;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.event.count({
            where: { organizerId: userId },
          });
        },
      },
      {
        type: BadgeType.ORGANIZER_20,
        name: 'Maestro de Eventos',
        description: 'Organizaste 20 eventos',
        icon: '🎪✨',
        rarity: 'EPIC',
        category: 'EVENTOS',
        maxProgress: 20,
        rewards: { credits: 1000, xp: 2000 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.event.count({
            where: { organizerId: userId },
          });
          return count >= 20;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.event.count({
            where: { organizerId: userId },
          });
        },
      },
      {
        type: BadgeType.ORGANIZER_50,
        name: 'Maestro de Ceremonias',
        description: 'Organizaste 50 eventos - ¡Eres el alma de la comunidad!',
        icon: '🎩',
        rarity: 'LEGENDARY',
        category: 'EVENTOS',
        maxProgress: 50,
        rewards: { credits: 3000, xp: 6000, title: 'Maestro de Ceremonias' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.event.count({
            where: { organizerId: userId },
          });
          return count >= 50;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.event.count({
            where: { organizerId: userId },
          });
        },
      },

      // === ECO-SOSTENIBILIDAD ===
      {
        type: BadgeType.ECO_STARTER,
        name: 'Eco-Iniciado',
        description: 'Ahorraste 10kg de CO2',
        icon: '🌱',
        rarity: 'COMMON',
        category: 'ECO',
        maxProgress: 10,
        rewards: { credits: 50, xp: 100 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.co2Avoided || 0) >= 10;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.co2Avoided || 0);
        },
      },
      {
        type: BadgeType.ECO_WARRIOR,
        name: 'Guerrero Ecológico',
        description: 'Ahorraste 100kg de CO2',
        icon: '🌿',
        rarity: 'RARE',
        category: 'ECO',
        maxProgress: 100,
        rewards: { credits: 300, xp: 600 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.co2Avoided || 0) >= 100;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.co2Avoided || 0);
        },
      },
      {
        type: BadgeType.ECO_CHAMPION,
        name: 'Campeón Ecológico',
        description: 'Ahorraste 500kg de CO2',
        icon: '🌳',
        rarity: 'EPIC',
        category: 'ECO',
        maxProgress: 500,
        rewards: { credits: 1000, xp: 2000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.co2Avoided || 0) >= 500;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.co2Avoided || 0);
        },
      },
      {
        type: BadgeType.ECO_LEGEND,
        name: 'Guardián del Planeta',
        description: 'Ahorraste 1 tonelada de CO2 - ¡LEGENDARIO!',
        icon: '🌍',
        rarity: 'LEGENDARY',
        category: 'ECO',
        maxProgress: 1000,
        rewards: { credits: 5000, xp: 10000, title: 'Guardián del Planeta' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.co2Avoided || 0) >= 1000;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.co2Avoided || 0);
        },
      },

      // === CONEXIONES SOCIALES ===
      {
        type: BadgeType.CONNECTOR_10,
        name: 'Conector',
        description: 'Conectaste a 10 personas',
        icon: '🔗',
        rarity: 'COMMON',
        category: 'SOCIAL',
        maxProgress: 10,
        rewards: { credits: 100, xp: 200 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.connectionsCount || 0) >= 10;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.connectionsCount || 0;
        },
      },
      {
        type: BadgeType.CONNECTOR_50,
        name: 'Gran Conector',
        description: 'Conectaste a 50 personas',
        icon: '🔗✨',
        rarity: 'RARE',
        category: 'SOCIAL',
        maxProgress: 50,
        rewards: { credits: 400, xp: 800 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.connectionsCount || 0) >= 50;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.connectionsCount || 0;
        },
      },
      {
        type: BadgeType.CONNECTOR_100,
        name: 'Tejedor Social',
        description: 'Conectaste a 100 personas - ¡Eres el pegamento de la comunidad!',
        icon: '🕸️',
        rarity: 'EPIC',
        category: 'SOCIAL',
        maxProgress: 100,
        rewards: { credits: 1000, xp: 2000, title: 'Tejedor Social' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.connectionsCount || 0) >= 100;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return user?.connectionsCount || 0;
        },
      },

      // === APRENDIZAJE ===
      {
        type: BadgeType.LEARNER_FIRST,
        name: 'Primera Habilidad',
        description: 'Registraste tu primera habilidad',
        icon: '📚',
        rarity: 'COMMON',
        category: 'APRENDIZAJE',
        rewards: { credits: 50, xp: 100 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.skill.count({
            where: { userId },
          });
          return count >= 1;
        },
      },
      {
        type: BadgeType.LEARNER_5,
        name: 'Estudiante Curioso',
        description: 'Registraste 5 habilidades',
        icon: '🎓',
        rarity: 'RARE',
        category: 'APRENDIZAJE',
        maxProgress: 5,
        rewards: { credits: 200, xp: 400 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.skill.count({
            where: { userId },
          });
          return count >= 5;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.skill.count({
            where: { userId },
          });
        },
      },
      {
        type: BadgeType.LEARNER_20,
        name: 'Polímata',
        description: 'Registraste 20 habilidades - ¡Dominas múltiples disciplinas!',
        icon: '🧠',
        rarity: 'EPIC',
        category: 'APRENDIZAJE',
        maxProgress: 20,
        rewards: { credits: 1000, xp: 2000, title: 'Polímata' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.skill.count({
            where: { userId },
          });
          return count >= 20;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.skill.count({
            where: { userId },
          });
        },
      },

      // === ENSEÑANZA ===
      {
        type: BadgeType.TEACHER_FIRST,
        name: 'Primera Enseñanza',
        description: 'Compartiste tu conocimiento por primera vez',
        icon: '👨‍🏫',
        rarity: 'COMMON',
        category: 'ENSENANZA',
        rewards: { credits: 100, xp: 200 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.timeBankOffer.count({
            where: { skill: { userId } },
          });
          return count >= 1;
        },
      },
      {
        type: BadgeType.TEACHER_10,
        name: 'Profesor',
        description: 'Enseñaste a 10 personas',
        icon: '🎓',
        rarity: 'RARE',
        category: 'ENSENANZA',
        maxProgress: 10,
        rewards: { credits: 400, xp: 800 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
          return count >= 10;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
        },
      },
      {
        type: BadgeType.TEACHER_50,
        name: 'Mentor',
        description: 'Enseñaste a 50 personas',
        icon: '🧑‍🎓',
        rarity: 'EPIC',
        category: 'ENSENANZA',
        maxProgress: 50,
        rewards: { credits: 1500, xp: 3000, title: 'Mentor' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
          return count >= 50;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
        },
      },
      {
        type: BadgeType.TEACHER_100,
        name: 'Gurú',
        description: 'Enseñaste a 100 personas - ¡Eres un maestro!',
        icon: '🧙',
        rarity: 'LEGENDARY',
        category: 'ENSENANZA',
        maxProgress: 100,
        rewards: { credits: 3000, xp: 6000, title: 'Gurú' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
          return count >= 100;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.timeBankTransaction.count({
            where: {
              providerId: userId,
              status: 'COMPLETED',
            },
          });
        },
      },

      // === AHORRO ECONÓMICO ===
      {
        type: BadgeType.SAVER_100,
        name: 'Ahorrador Inteligente',
        description: 'Ahorraste 100€',
        icon: '💰',
        rarity: 'COMMON',
        category: 'AHORRO',
        maxProgress: 100,
        rewards: { credits: 100, xp: 200 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.totalSaved || 0) >= 100;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.totalSaved || 0);
        },
      },
      {
        type: BadgeType.SAVER_500,
        name: 'Gran Ahorrador',
        description: 'Ahorraste 500€',
        icon: '💎',
        rarity: 'RARE',
        category: 'AHORRO',
        maxProgress: 500,
        rewards: { credits: 400, xp: 800 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.totalSaved || 0) >= 500;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.totalSaved || 0);
        },
      },
      {
        type: BadgeType.SAVER_1000,
        name: 'Maestro del Ahorro',
        description: 'Ahorraste 1000€',
        icon: '💸',
        rarity: 'EPIC',
        category: 'AHORRO',
        maxProgress: 1000,
        rewards: { credits: 1000, xp: 2000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.totalSaved || 0) >= 1000;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.totalSaved || 0);
        },
      },
      {
        type: BadgeType.SAVER_5000,
        name: 'Genio de las Finanzas',
        description: 'Ahorraste 5000€ - ¡Increíble!',
        icon: '🏆',
        rarity: 'LEGENDARY',
        category: 'AHORRO',
        maxProgress: 5000,
        rewards: { credits: 5000, xp: 10000, title: 'Genio de las Finanzas' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return (user?.totalSaved || 0) >= 5000;
        },
        getProgress: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          return Math.floor(user?.totalSaved || 0);
        },
      },

      // === PARTICIPACIÓN COMUNITARIA ===
      {
        type: BadgeType.PIONEER,
        name: 'Pionero',
        description: 'Eres uno de los primeros 100 usuarios',
        icon: '🚀',
        rarity: 'RARE',
        category: 'COMUNIDAD',
        rewards: { credits: 500, xp: 1000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user) return false;

          const position = await prisma.user.count({
            where: {
              createdAt: {
                lte: user.createdAt,
              },
            },
          });

          return position <= 100;
        },
      },
      {
        type: BadgeType.VETERAN,
        name: 'Veterano',
        description: 'Llevas 1 año activo en la comunidad',
        icon: '🎖️',
        rarity: 'EPIC',
        category: 'COMUNIDAD',
        rewards: { credits: 1000, xp: 2000 },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user) return false;

          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          return user.createdAt <= oneYearAgo;
        },
      },
      {
        type: BadgeType.LEGEND,
        name: 'Leyenda',
        description: 'Llevas 3 años activo - ¡Eres una leyenda!',
        icon: '👑',
        rarity: 'LEGENDARY',
        category: 'COMUNIDAD',
        rewards: { credits: 3000, xp: 6000, title: 'Leyenda' },
        checkCondition: async (userId, prisma) => {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user) return false;

          const threeYearsAgo = new Date();
          threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

          return user.createdAt <= threeYearsAgo;
        },
      },

      // === GOBERNANZA ===
      {
        type: BadgeType.VOTER_FIRST,
        name: 'Primer Voto',
        description: 'Participaste en tu primera votación',
        icon: '🗳️',
        rarity: 'COMMON',
        category: 'GOBERNANZA',
        rewards: { credits: 100, xp: 200 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.proposalVote.count({
            where: { voterId: userId },
          });
          return count >= 1;
        },
      },
      {
        type: BadgeType.VOTER_10,
        name: 'Votante Activo',
        description: 'Participaste en 10 votaciones',
        icon: '🗳️✨',
        rarity: 'RARE',
        category: 'GOBERNANZA',
        maxProgress: 10,
        rewards: { credits: 300, xp: 600 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.proposalVote.count({
            where: { voterId: userId },
          });
          return count >= 10;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.proposalVote.count({
            where: { voterId: userId },
          });
        },
      },
      {
        type: BadgeType.VOTER_50,
        name: 'Demócrata Activo',
        description: 'Participaste en 50 votaciones',
        icon: '⚖️',
        rarity: 'EPIC',
        category: 'GOBERNANZA',
        maxProgress: 50,
        rewards: { credits: 1000, xp: 2000, title: 'Demócrata Activo' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.proposalVote.count({
            where: { voterId: userId },
          });
          return count >= 50;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.proposalVote.count({
            where: { voterId: userId },
          });
        },
      },
      {
        type: BadgeType.PROPOSER_FIRST,
        name: 'Primera Propuesta',
        description: 'Creaste tu primera propuesta',
        icon: '💡',
        rarity: 'COMMON',
        category: 'GOBERNANZA',
        rewards: { credits: 200, xp: 400 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.proposal.count({
            where: { authorId: userId },
          });
          return count >= 1;
        },
      },
      {
        type: BadgeType.PROPOSER_APPROVED,
        name: 'Propuesta Aprobada',
        description: 'Una de tus propuestas fue aprobada por la comunidad',
        icon: '✅',
        rarity: 'RARE',
        category: 'GOBERNANZA',
        rewards: { credits: 500, xp: 1000 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.proposal.count({
            where: {
              authorId: userId,
              status: 'APPROVED',
            },
          });
          return count >= 1;
        },
      },

      // === MODERACIÓN ===
      {
        type: BadgeType.MODERATOR_FAIR,
        name: 'Moderador Justo',
        description: '100 moderaciones justas',
        icon: '⚔️',
        rarity: 'EPIC',
        category: 'MODERACION',
        maxProgress: 100,
        rewards: { credits: 1000, xp: 2000 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.moderationVote.count({
            where: {
              voterId: userId,
            },
          });
          return count >= 100;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.moderationVote.count({
            where: {
              voterId: userId,
            },
          });
        },
      },
      {
        type: BadgeType.MODERATOR_TRUSTED,
        name: 'Guardián de la Paz',
        description: '500 moderaciones justas',
        icon: '🛡️',
        rarity: 'LEGENDARY',
        category: 'MODERACION',
        maxProgress: 500,
        rewards: { credits: 3000, xp: 6000, title: 'Guardián de la Paz' },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.moderationVote.count({
            where: {
              voterId: userId,
            },
          });
          return count >= 500;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.moderationVote.count({
            where: {
              voterId: userId,
            },
          });
        },
      },

      // === SOCIAL MEDIA ===
      {
        type: BadgeType.INFLUENCER_100,
        name: 'Voz Emergente',
        description: '100 reacciones en tus posts',
        icon: '📣',
        rarity: 'RARE',
        category: 'SOCIAL',
        maxProgress: 100,
        rewards: { credits: 300, xp: 600 },
        checkCondition: async (userId, prisma) => {
          const posts = await prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
          });

          const postIds = posts.map((p) => p.id);

          const count = await prisma.reaction.count({
            where: {
              postId: { in: postIds },
            },
          });

          return count >= 100;
        },
        getProgress: async (userId, prisma) => {
          const posts = await prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
          });

          const postIds = posts.map((p) => p.id);

          return await prisma.reaction.count({
            where: {
              postId: { in: postIds },
            },
          });
        },
      },
      {
        type: BadgeType.INFLUENCER_1000,
        name: 'Voz de la Comunidad',
        description: '1000 reacciones en tus posts',
        icon: '📢',
        rarity: 'LEGENDARY',
        category: 'SOCIAL',
        maxProgress: 1000,
        rewards: { credits: 2000, xp: 4000, title: 'Influencer' },
        checkCondition: async (userId, prisma) => {
          const posts = await prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
          });

          const postIds = posts.map((p) => p.id);

          const count = await prisma.reaction.count({
            where: {
              postId: { in: postIds },
            },
          });

          return count >= 1000;
        },
        getProgress: async (userId, prisma) => {
          const posts = await prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
          });

          const postIds = posts.map((p) => p.id);

          return await prisma.reaction.count({
            where: {
              postId: { in: postIds },
            },
          });
        },
      },
      {
        type: BadgeType.STORYTELLER,
        name: 'Narrador',
        description: 'Creaste 50 posts',
        icon: '📝',
        rarity: 'RARE',
        category: 'SOCIAL',
        maxProgress: 50,
        rewards: { credits: 400, xp: 800 },
        checkCondition: async (userId, prisma) => {
          const count = await prisma.post.count({
            where: { authorId: userId },
          });
          return count >= 50;
        },
        getProgress: async (userId, prisma) => {
          return await prisma.post.count({
            where: { authorId: userId },
          });
        },
      },

      // ... (Continuará en siguiente parte debido a límite de longitud)
    ];

    // Convertir array a Map para acceso rápido
    const map = new Map<BadgeType, BadgeDefinition>();
    definitions.forEach((def) => {
      map.set(def.type, def);
    });

    return map;
  }

  /**
   * Verificar todos los achievements para un usuario
   * Se ejecuta después de acciones importantes
   */
  async checkAchievements(userId: string): Promise<BadgeType[]> {
    const newBadges: BadgeType[] = [];

    // Obtener badges actuales del usuario
    const existingBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeType: true },
    });

    const existingBadgeTypes = new Set(existingBadges.map((b) => b.badgeType));

    // Verificar cada badge
    for (const [badgeType, definition] of this.badgeDefinitions) {
      // Skip si ya tiene este badge
      if (existingBadgeTypes.has(badgeType)) continue;

      try {
        const achieved = await definition.checkCondition(userId, this.prisma);

        if (achieved) {
          // ¡Badge desbloqueado!
          await this.awardBadge(userId, badgeType);
          newBadges.push(badgeType);
        }
      } catch (error) {
        this.logger.error(
          `Error checking badge ${badgeType} for user ${userId}:`,
          error,
        );
      }
    }

    return newBadges;
  }

  /**
   * Otorgar un badge a un usuario
   */
  async awardBadge(userId: string, badgeType: BadgeType): Promise<void> {
    const definition = this.badgeDefinitions.get(badgeType);
    if (!definition) return;

    // Crear badge
    await this.prisma.userBadge.create({
      data: {
        userId,
        badgeType,
        isNew: true,
        metadata: {
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          rarity: definition.rarity,
          category: definition.category,
        },
      },
    });

    // Otorgar recompensas
    if (definition.rewards) {
      const { credits, xp } = definition.rewards;

      if (credits || xp) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...(credits && { credits: { increment: credits } }),
            ...(xp && { experience: { increment: xp } }),
          },
        });
      }

      // Si tiene créditos, crear transacción
      if (credits) {
        // Obtener balance actual
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId,
            amount: credits,
            balance: (user?.credits || 0) + credits,
            reason: 'ADMIN_GRANT', // Para badges
            description: `Badge desbloqueado: ${definition.name}`,
            metadata: { badgeType, badgeName: definition.name },
          },
        });
      }
    }

    // Notificar via WebSocket
    this.wsGateway.sendNotificationToUser(userId, {
      type: 'badge_unlocked',
      data: {
        badgeType,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        rewards: definition.rewards,
      },
      timestamp: new Date(),
    });

    this.logger.log(`Badge ${badgeType} awarded to user ${userId}`);
  }

  /**
   * Obtener todos los badges de un usuario
   */
  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  /**
   * Obtener progreso de todos los badges
   */
  async getBadgeProgress(userId: string) {
    const progress = [];

    for (const [badgeType, definition] of this.badgeDefinitions) {
      const has = await this.prisma.userBadge.findFirst({
        where: { userId, badgeType },
      });

      let currentProgress = 0;
      if (definition.getProgress) {
        currentProgress = await definition.getProgress(userId, this.prisma);
      }

      progress.push({
        badgeType,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        category: definition.category,
        unlocked: !!has,
        progress: currentProgress,
        maxProgress: definition.maxProgress || 0,
        percentage:
          definition.maxProgress
            ? Math.min(100, (currentProgress / definition.maxProgress) * 100)
            : 0,
        rewards: definition.rewards,
      });
    }

    return progress;
  }

  /**
   * Marcar badges vistos (para animación)
   */
  async markBadgesAsSeen(userId: string, badgeTypes: BadgeType[]) {
    await this.prisma.userBadge.updateMany({
      where: {
        userId,
        badgeType: { in: badgeTypes },
      },
      data: {
        isNew: false,
      },
    });
  }

  /**
   * Obtener definición de un badge
   */
  getBadgeDefinition(badgeType: BadgeType): BadgeDefinition | undefined {
    return this.badgeDefinitions.get(badgeType);
  }

  /**
   * Obtener todas las definiciones de badges
   */
  getAllBadgeDefinitions() {
    return Array.from(this.badgeDefinitions.values());
  }

  /**
   * Estadísticas de badges del usuario
   */
  async getUserBadgeStats(userId: string) {
    const badges = await this.getUserBadges(userId);
    const totalBadges = this.badgeDefinitions.size;

    const byRarity = {
      COMMON: badges.filter((b) => {
        const def = this.badgeDefinitions.get(b.badgeType);
        return def?.rarity === 'COMMON';
      }).length,
      RARE: badges.filter((b) => {
        const def = this.badgeDefinitions.get(b.badgeType);
        return def?.rarity === 'RARE';
      }).length,
      EPIC: badges.filter((b) => {
        const def = this.badgeDefinitions.get(b.badgeType);
        return def?.rarity === 'EPIC';
      }).length,
      LEGENDARY: badges.filter((b) => {
        const def = this.badgeDefinitions.get(b.badgeType);
        return def?.rarity === 'LEGENDARY';
      }).length,
      SECRET: badges.filter((b) => {
        const def = this.badgeDefinitions.get(b.badgeType);
        return def?.rarity === 'SECRET';
      }).length,
    };

    return {
      totalUnlocked: badges.length,
      totalBadges,
      completionPercentage: (badges.length / totalBadges) * 100,
      byRarity,
      recent: badges.slice(0, 5), // 5 más recientes
    };
  }
}
