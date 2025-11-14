import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private healthService: HealthService,
    private prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @Get()
  async check() {
    return this.healthService.check();
  }

  @ApiOperation({ summary: 'Detailed health status' })
  @Get('status')
  async status() {
    return this.healthService.detailedStatus();
  }

  @ApiOperation({
    summary: 'Populate database with demo data (Development only)',
    description: 'Creates sample users, offers, events, proposals, and consensus data for testing'
  })
  @ApiResponse({
    status: 200,
    description: 'Database seeded successfully',
    schema: {
      example: {
        success: true,
        message: 'Demo data loaded successfully',
        users: [
          { email: 'maria@comunidad.local', role: 'Validador Experto' },
          { email: 'juan@comunidad.local', role: 'Validador Activo' },
          { email: 'ana@comunidad.local', role: 'Usuario Nuevo' },
          { email: 'tienda@comunidad.local', role: 'Comercio Local' },
          { email: 'carlos@comunidad.local', role: 'Organizador' }
        ],
        password: 'Test1234!',
        data: {
          users: 5,
          offers: 4,
          events: 2,
          posts: 3,
          proposals: 1,
          trustBlocks: 2
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only available in development mode'
  })
  @Post('seed-demo')
  async seedDemo() {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      throw new HttpException(
        'Demo data seeding is not available in production',
        HttpStatus.FORBIDDEN
      );
    }

    try {
      // Ejecutar el seed
      const { stdout, stderr } = await execAsync('npm run seed', {
        cwd: process.cwd(),
      });

      console.log('Seed output:', stdout);
      if (stderr) console.error('Seed errors:', stderr);

      // Query actual data from database after seeding
      const [
        proposalsData,
        communitiesCount,
        membershipsCount,
      ] = await Promise.all([
        this.prisma.proposal.findMany({
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }),
        this.prisma.community.count(),
        this.prisma.user.count({ where: { communityId: { not: null } } }),
      ]);

      return {
        success: true,
        message: 'Demo data loaded successfully! 🎉',
        users: [
          {
            email: 'maria@comunidad.local',
            name: 'María García',
            role: 'Validador Experto',
            reputation: 120,
            description: 'Alta reputación - Puede validar propuestas y resolver disputas'
          },
          {
            email: 'juan@comunidad.local',
            name: 'Juan Martínez',
            role: 'Validador Activo',
            reputation: 55,
            description: 'Reputación media - Puede validar transacciones y propuestas'
          },
          {
            email: 'ana@comunidad.local',
            name: 'Ana López',
            role: 'Usuario Nuevo',
            reputation: 8,
            description: 'Nuevo usuario - Necesita más ayudas para validar'
          },
          {
            email: 'tienda@comunidad.local',
            name: 'Tienda Eco Local',
            role: 'Comercio Local',
            reputation: 25,
            description: 'Comercio que acepta créditos comunitarios'
          },
          {
            email: 'carlos@comunidad.local',
            name: 'Carlos Ruiz',
            role: 'Organizador de Eventos',
            reputation: 80,
            description: 'Organizador activo de eventos comunitarios'
          }
        ],
        password: 'Test1234!',
        data: {
          users: 5,
          offers: 4,
          timeBankOffers: 2,
          events: 2,
          posts: 3,
          proposals: 1,
          trustBlocks: 2,
          connections: 4,
          transactions: 3,
          flashDeals: 2,
          challenges: 3,
          swipeCards: 2,
          groupBuys: 2,
          referrals: 2,
          celebrations: 1,
          bridgeEvents: 2,
          delegates: 2,
          delegations: 2,
          streaks: 2,
          happyHours: 1,
          communities: communitiesCount,
          memberships: membershipsCount,
        },
        proposals: proposalsData.map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          status: p.status,
          votesCount: p._count.votes,
        })),
        tips: [
          'Inicia sesión con cualquier email de prueba',
          'María y Juan pueden validar bloques de consenso',
          'Explora las propuestas en /consensus/proposals',
          'Los eventos están en el mapa principal',
          'El banco de tiempo tiene ofertas activas',
          'Explora las 5 comunidades creadas en /communities',
          'Participa en los challenges semanales y flash deals',
        ]
      };
    } catch (error) {
      console.error('Error seeding database:', error);
      throw new HttpException(
        `Failed to seed database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
