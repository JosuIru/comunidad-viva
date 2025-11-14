import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLoggerService } from '../common/winston-logger.service';
import * as os from 'os';

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
}

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceStatus;
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
    loadAverage: number[];
  };
  process: {
    pid: number;
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
      external: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
  database: {
    connected: boolean;
    latency?: number;
    activeConnections?: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new WinstonLoggerService('HealthService');
  private startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async detailedStatus(): Promise<HealthMetrics> {
    const dbStatus = await this.checkDatabase();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (dbStatus.status === 'down') {
      overallStatus = 'unhealthy';
    } else if (dbStatus.status === 'degraded') {
      overallStatus = 'degraded';
    }

    // Check memory usage
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
        freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
        loadAverage: os.loadavg(),
      },
      process: {
        pid: process.pid,
        uptime: Math.floor(process.uptime()),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024), // MB
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000), // milliseconds
          system: Math.round(cpuUsage.system / 1000), // milliseconds
        },
      },
      database: {
        connected: dbStatus.status === 'up',
        latency: dbStatus.latency,
      },
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;

      // Check if latency is concerning
      let status: 'up' | 'degraded' = 'up';
      if (latency > 1000) { // More than 1 second
        status = 'degraded';
        this.logger.warn('Database latency is high', { latency });
      }

      return {
        status,
        latency,
      };
    } catch (error) {
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : String(error)
      );

      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const [
        userCount,
        communityCount,
        offerCount,
        eventCount,
        transactionCount,
      ] = await Promise.all([
        this.prisma.User.count(),
        this.prisma.community.count(),
        this.prisma.Offer.count(),
        this.prisma.event.count(),
        this.prisma.creditTransaction.count(),
      ]);

      return {
        users: userCount,
        communities: communityCount,
        offers: offerCount,
        events: eventCount,
        transactions: transactionCount,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error instanceof Error ? error.stack : String(error));
      return null;
    }
  }
}
