import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService('PrismaService');
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
      errorFormat: 'minimal',
    });

    // Log Prisma warnings and errors
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`);
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();

    // Configurar nivel de aislamiento para transacciones críticas
    // PostgreSQL por defecto usa READ COMMITTED, que es suficiente para la mayoría de casos
    // ya que estamos usando operaciones atómicas (increment/decrement) en Prisma.
    // SERIALIZABLE sería más estricto pero tiene impacto en performance.
    // READ COMMITTED + increment/decrement atómico = protección contra race conditions
    this.logger.log('Using READ COMMITTED isolation level (default) with atomic operations');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database');
    await this.$disconnect();
  }

  private async connectWithRetry(attempt = 1): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');

      // Test connection
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connection verified');
    } catch (error) {
      if (attempt >= this.MAX_RETRIES) {
        this.logger.error(
          `Failed to connect to database after ${this.MAX_RETRIES} attempts`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }

      this.logger.warn(
        `Database connection attempt ${attempt} failed. Retrying in ${this.RETRY_DELAY / 1000}s...`,
      );

      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      return this.connectWithRetry(attempt + 1);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
