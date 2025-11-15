import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreditReason } from '@prisma/client';
import { LoggerService } from '../common/logger.service';
import { randomUUID } from 'crypto';

/**
 * Credit Decay Service - Obsolescencia Programada
 *
 * Implementa un sistema de "moneda oxidable" donde los créditos pierden valor con el tiempo
 * para fomentar la circulación activa en lugar del ahorro excesivo.
 *
 * Características:
 * - Decay mensual del 2% de créditos sin usar (por defecto)
 * - Los créditos tienen fecha de expiración (configurable, default: 12 meses)
 * - Notificaciones antes de la expiración (30, 7 y 1 día antes)
 * - Ejecución automática diaria a las 3 AM
 *
 * Filosofía:
 * "El dinero es como el abono: solo sirve si se reparte" - Francis Bacon
 * El decay fomenta el intercambio activo y evita la acumulación improductiva.
 */
@Injectable()
export class CreditDecayService {
  private readonly logger = new LoggerService('CreditDecayService');

  // Configuración del decay
  private readonly DECAY_RATE = 0.02; // 2% mensual
  private readonly EXPIRATION_MONTHS = 12; // Los créditos expiran después de 12 meses
  private readonly NOTIFICATION_DAYS = [30, 7, 1]; // Notificar 30, 7 y 1 día antes

  constructor(private prisma: PrismaService) {}

  /**
   * Ejecutar decay de créditos diariamente a las 3 AM
   * Cron pattern: '0 3 * * *' = cada día a las 3:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyDecay() {
    this.logger.log('🕐 Iniciando proceso diario de decay de créditos...');

    try {
      // 1. Procesar créditos expirados
      const expiredCount = await this.processExpiredCredits();

      // 2. Aplicar decay mensual
      const decayedCount = await this.applyMonthlyDecay();

      // 3. Enviar notificaciones de expiración próxima
      const notificationsSent = await this.sendExpirationNotifications();

      this.logger.log(
        `✅ Decay completado: ${expiredCount} expirados, ${decayedCount} con decay, ${notificationsSent} notificaciones enviadas`
      );
    } catch (error) {
      this.logger.error('❌ Error en proceso de decay:', error);
    }
  }

  /**
   * Procesar créditos que han expirado
   */
  private async processExpiredCredits(): Promise<number> {
    const now = new Date();

    // Buscar transacciones expiradas con balance positivo
    const expiredTransactions = await this.prisma.creditTransaction.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        amount: {
          gt: 0, // Solo créditos ganados
        },
      },
      include: {
        User: {
          select: {
            id: true,
            credits: true,
            name: true,
          },
        },
      },
    });

    let processedCount = 0;

    for (const transaction of expiredTransactions) {
      try {
        // Calcular cuántos créditos quedan de esta transacción
        // (asumiendo que se gastan FIFO - First In First Out)
        const creditsToExpire = transaction.amount;

        if (creditsToExpire > 0 && transaction.User.credits > 0) {
          const amountToDeduct = Math.min(creditsToExpire, transaction.User.credits);

          // TRANSACCIÓN ATÓMICA: Prevenir race conditions en expiración de créditos
          await this.prisma.$transaction(async (transactionClient) => {
            // 1. Actualizar balance del usuario atómicamente con decrement
            const updatedUser = await transactionClient.user.update({
              where: { id: transaction.userId },
              data: {
                credits: {
                  decrement: amountToDeduct,
                },
              },
              select: { credits: true },
            });

            // 2. Crear transacción de expiración con el balance actualizado
            await transactionClient.creditTransaction.create({
              data: {
                id: randomUUID(),
                userId: transaction.userId,
                amount: -amountToDeduct,
                balance: updatedUser.credits,
                reason: CreditReason.ADMIN_GRANT, // Usamos ADMIN_GRANT para operaciones del sistema
                description: `Expiración de créditos (${this.EXPIRATION_MONTHS} meses sin usar)`,
                relatedId: transaction.id,
                metadata: {
                  type: 'EXPIRATION',
                  originalTransactionId: transaction.id,
                  expirationDate: now.toISOString(),
                },
              },
            });

            // 3. Crear notificación
            await transactionClient.notification.create({
              data: {
                id: randomUUID(),
                userId: transaction.userId,
                type: 'CREDITS_EXPIRING',
                title: 'Créditos expirados',
                body: `${amountToDeduct} créditos han expirado por no usarse durante ${this.EXPIRATION_MONTHS} meses.`,
                data: {
                  amount: -amountToDeduct,
                  reason: 'EXPIRATION',
                },
                link: '/credits',
              },
            });
          });

          processedCount++;
        }
      } catch (error) {
        this.logger.error(`Error procesando expiración para transacción ${transaction.id}:`, error);
      }
    }

    return processedCount;
  }

  /**
   * Aplicar decay mensual del 2%
   * Solo a usuarios con más de 100 créditos (para no penalizar usuarios nuevos)
   */
  private async applyMonthlyDecay(): Promise<number> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Buscar usuarios con créditos suficientes
    const users = await this.prisma.user.findMany({
      where: {
        credits: {
          gte: 100, // Solo usuarios con más de 100 créditos
        },
      },
      select: {
        id: true,
        credits: true,
        name: true,
        lastActiveAt: true,
      },
    });

    let decayedCount = 0;

    for (const user of users) {
      try {
        // Verificar si ya se aplicó decay este mes
        const lastDecay = await this.prisma.creditTransaction.findFirst({
          where: {
            userId: user.id,
            reason: CreditReason.ADMIN_GRANT,
            description: {
              contains: 'Decay mensual',
            },
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1), // Primer día del mes actual
            },
          },
        });

        if (lastDecay) {
          continue; // Ya se aplicó decay este mes
        }

        // Calcular decay
        const decayAmount = Math.floor(user.credits * this.DECAY_RATE);

        if (decayAmount > 0) {
          // TRANSACCIÓN ATÓMICA: Prevenir race conditions en decay mensual
          await this.prisma.$transaction(async (transactionClient) => {
            // 1. Actualizar balance del usuario atómicamente con decrement
            const updatedUser = await transactionClient.user.update({
              where: { id: user.id },
              data: {
                credits: {
                  decrement: decayAmount,
                },
              },
              select: { credits: true },
            });

            // 2. Crear transacción de decay con el balance actualizado
            await transactionClient.creditTransaction.create({
              data: {
                id: randomUUID(),
                userId: user.id,
                amount: -decayAmount,
                balance: updatedUser.credits,
                reason: CreditReason.ADMIN_GRANT,
                description: `Decay mensual (${this.DECAY_RATE * 100}% de créditos sin usar)`,
                metadata: {
                  type: 'DECAY',
                  rate: this.DECAY_RATE,
                  originalAmount: user.credits + decayAmount, // Balance original antes del decay
                },
              },
            });

            // 3. Crear notificación
            await transactionClient.notification.create({
              data: {
                id: randomUUID(),
                userId: user.id,
                type: 'CREDITS_EXPIRING',
                title: 'Decay mensual de créditos',
                body: `${decayAmount} créditos se han oxidado (${this.DECAY_RATE * 100}%). ¡Úsalos en la comunidad!`,
                data: {
                  amount: -decayAmount,
                  reason: 'DECAY',
                  rate: this.DECAY_RATE,
                },
                link: '/credits',
              },
            });
          });

          decayedCount++;
        }
      } catch (error) {
        this.logger.error(`Error aplicando decay al usuario ${user.id}:`, error);
      }
    }

    return decayedCount;
  }

  /**
   * Enviar notificaciones de créditos próximos a expirar
   */
  private async sendExpirationNotifications(): Promise<number> {
    const now = new Date();
    let notificationsSent = 0;

    for (const days of this.NOTIFICATION_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);

      // Buscar transacciones que expiran en 'days' días
      const expiringTransactions = await this.prisma.creditTransaction.findMany({
        where: {
          expiresAt: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
          amount: {
            gt: 0,
          },
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      for (const transaction of expiringTransactions) {
        try {
          // Verificar si ya se envió notificación para este día
          const existingNotification = await this.prisma.notification.findFirst({
            where: {
              userId: transaction.userId,
              type: 'CREDITS_EXPIRING',
              data: {
                path: ['transactionId'],
                equals: transaction.id,
              },
              createdAt: {
                gte: new Date(now.setHours(0, 0, 0, 0)),
              },
            },
          });

          if (!existingNotification) {
            await this.prisma.notification.create({
              data: {
                id: randomUUID(),
                userId: transaction.userId,
                type: 'CREDITS_EXPIRING',
                title: `⚠️ Créditos próximos a expirar`,
                body: `${transaction.amount} créditos expirarán en ${days} día${days > 1 ? 's' : ''}. ¡Úsalos antes de que se pierdan!`,
                data: {
                  amount: transaction.amount,
                  daysUntilExpiration: days,
                  transactionId: transaction.id,
                  expiresAt: transaction.expiresAt?.toISOString(),
                },
                link: '/credits',
              },
            });

            notificationsSent++;
          }
        } catch (error) {
          this.logger.error(`Error enviando notificación de expiración:`, error);
        }
      }
    }

    return notificationsSent;
  }

  /**
   * Método manual para ejecutar decay (útil para testing y admin)
   */
  async runManualDecay() {
    this.logger.log('🔧 Ejecutando decay manual...');
    await this.handleDailyDecay();
    return {
      success: true,
      message: 'Decay ejecutado manualmente',
      timestamp: new Date(),
    };
  }

  /**
   * Obtener estadísticas de decay
   */
  async getDecayStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [expiredThisMonth, decayedThisMonth, totalCreditsAtRisk] = await Promise.all([
      // Créditos expirados este mes
      this.prisma.creditTransaction.count({
        where: {
          reason: CreditReason.ADMIN_GRANT,
          description: {
            contains: 'Expiración',
          },
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      }),
      // Créditos con decay este mes
      this.prisma.creditTransaction.count({
        where: {
          reason: CreditReason.ADMIN_GRANT,
          description: {
            contains: 'Decay',
          },
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      }),
      // Créditos en riesgo (>100 créditos sin usar)
      this.prisma.user.count({
        where: {
          credits: {
            gte: 100,
          },
        },
      }),
    ]);

    return {
      expiredThisMonth,
      decayedThisMonth,
      totalCreditsAtRisk,
      decayRate: this.DECAY_RATE,
      expirationMonths: this.EXPIRATION_MONTHS,
    };
  }
}
