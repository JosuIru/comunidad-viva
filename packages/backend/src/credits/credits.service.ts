import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditReason } from '@prisma/client';

// Earning rules configuration (can be moved to database or config file)
const EARNING_RULES: Record<CreditReason, { amount: number; dailyLimit?: number; description: string }> = {
  [CreditReason.TIME_BANK_HOUR]: { amount: 1, description: 'Hora completada en banco de tiempo' },
  [CreditReason.EVENT_ATTENDANCE]: { amount: 3, dailyLimit: 15, description: 'Asistencia a evento' },
  [CreditReason.LOCAL_PURCHASE]: { amount: 1, dailyLimit: 20, description: 'Compra local (1 crédito cada 10€)' },
  [CreditReason.REFERRAL]: { amount: 5, dailyLimit: 20, description: 'Usuario referido verificado' },
  [CreditReason.ECO_ACTION]: { amount: 2, dailyLimit: 10, description: 'Acción ecológica verificada' },
  [CreditReason.OFFER_CREATED]: { amount: 2, dailyLimit: 6, description: 'Oferta publicada' },
  [CreditReason.REVIEW]: { amount: 1, dailyLimit: 10, description: 'Reseña publicada' },
  [CreditReason.ADMIN_GRANT]: { amount: 0, description: 'Otorgado por administrador' },
  [CreditReason.ADMIN_DEDUCT]: { amount: 0, description: 'Deducido por administrador' },
  [CreditReason.PURCHASE]: { amount: 0, description: 'Compra con créditos' },
  [CreditReason.DISCOUNT]: { amount: 0, description: 'Descuento aplicado' },
  [CreditReason.SERVICE]: { amount: 0, description: 'Servicio canjeado' },
  [CreditReason.EVENT_ACCESS]: { amount: 0, description: 'Acceso a evento' },
  [CreditReason.ADJUSTMENT]: { amount: 0, description: 'Ajuste manual' },
  [CreditReason.COMMUNITY_HELP]: { amount: 2, description: 'Ayuda comunitaria' },
  [CreditReason.DAILY_SEED]: { amount: 1, description: 'Semilla diaria' },
  [CreditReason.SUPPORT_POST]: { amount: 1, dailyLimit: 5, description: 'Apoyar publicación' },
  [CreditReason.EXPIRATION]: { amount: 0, description: 'Expiración de créditos' },
  [CreditReason.SYSTEM_REWARD]: { amount: 0, description: 'Recompensa automática del sistema' },
};

// User level thresholds
const USER_LEVELS = [
  { level: 1, name: 'Semilla', minCredits: 0, badge: '🌱' },
  { level: 2, name: 'Brote', minCredits: 50, badge: '🌿' },
  { level: 3, name: 'Colaborador', minCredits: 150, badge: '🌳' },
  { level: 4, name: 'Conector', minCredits: 300, badge: '🤝' },
  { level: 5, name: 'Impulsor', minCredits: 500, badge: '⭐' },
  { level: 6, name: 'Líder', minCredits: 1000, badge: '👑' },
];

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  // Get earning rule for a reason
  private getEarningRule(reason: CreditReason) {
    return EARNING_RULES[reason];
  }

  // Check daily limit for earning
  private async checkDailyLimit(userId: string, reason: CreditReason, amount: number): Promise<boolean> {
    const rule = this.getEarningRule(reason);
    if (!rule.dailyLimit) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await this.prisma.creditTransaction.findMany({
      where: {
        userId,
        reason,
        amount: { gt: 0 },
        createdAt: { gte: today },
      },
    });

    const todayTotal = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return todayTotal + amount <= rule.dailyLimit;
  }

  // Grant credits with validation and limits
  // TRANSACCIÓN ATÓMICA: Previene race conditions usando increment atómico
  async grantCredits(
    userId: string,
    amount: number,
    reason: CreditReason,
    relatedId?: string,
    description?: string,
  ) {
    // Validaciones previas fuera de la transacción (no modifican datos)
    const user = await this.prisma.User.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check daily limit
    const withinLimit = await this.checkDailyLimit(userId, reason, amount);
    if (!withinLimit) {
      const rule = this.getEarningRule(reason);
      throw new BadRequestException(`Daily limit exceeded for ${rule.description}. Limit: ${rule.dailyLimit} credits/day`);
    }

    // Check for duplicate transactions (anti-fraud)
    if (relatedId) {
      const duplicate = await this.prisma.creditTransaction.findFirst({
        where: {
          userId,
          reason,
          relatedId,
          amount: { gt: 0 },
        },
      });
      if (duplicate) {
        throw new BadRequestException('Credits already granted for this action');
      }
    }

    const oldLevel = this.getUserLevel(user.credits);

    // Calculate expiration date (12 months from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    // TRANSACCIÓN ATÓMICA: Todas las modificaciones dentro de una sola transacción
    // Usar callback para acceso al balance actualizado
    const result = await this.prisma.$transaction(async (transactionClient) => {
      // 1. Actualizar balance atómicamente con increment
      const updatedUser = await transactionClient.User.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
        select: { credits: true }, // Retornar el nuevo balance
      });

      const newBalance = updatedUser.credits;

      // 2. Crear registro de transacción con el balance actualizado
      const creditTransaction = await transactionClient.creditTransaction.create({
        data: {
          userId,
          amount,
          balance: newBalance,
          reason,
          relatedId,
          description: description || this.getEarningRule(reason).description,
          expiresAt,
        },
      });

      return { updatedUser, creditTransaction };
    });

    const newBalance = result.updatedUser.credits;
    const newLevel = this.getUserLevel(newBalance);

    // Level up notification
    const leveledUp = newLevel.level > oldLevel.level;

    return {
      newBalance,
      amount,
      level: newLevel,
      leveledUp,
      transaction: result.creditTransaction,
    };
  }

  // Spend credits
  // TRANSACCIÓN ATÓMICA: Previene double-spending usando decrement atómico con validación
  async spendCredits(
    userId: string,
    amount: number,
    reason: CreditReason,
    relatedId?: string,
    description?: string,
  ) {
    // TRANSACCIÓN ATÓMICA: Validación y modificación dentro de la misma transacción
    // Previene race conditions donde dos operaciones simultáneas podrían gastar más créditos de los disponibles
    const result = await this.prisma.$transaction(async (transactionClient) => {
      // 1. Obtener usuario y verificar existencia dentro de la transacción
      const user = await transactionClient.User.findUnique({
        where: { id: userId },
        select: { id: true, credits: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. Validar balance suficiente DENTRO de la transacción
      if (user.credits < amount) {
        throw new BadRequestException(`Insufficient credits. Balance: ${user.credits}, Required: ${amount}`);
      }

      // 3. Actualizar balance atómicamente con decrement
      const updatedUser = await transactionClient.User.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
        select: { credits: true },
      });

      const newBalance = updatedUser.credits;

      // 4. Crear registro de transacción con el balance actualizado
      const creditTransaction = await transactionClient.creditTransaction.create({
        data: {
          userId,
          amount: -amount, // Negative for spending
          balance: newBalance,
          reason,
          relatedId,
          description: description || `Créditos gastados: ${reason}`,
        },
      });

      return { updatedUser, creditTransaction };
    });

    return {
      newBalance: result.updatedUser.credits,
      spent: amount,
      transaction: result.creditTransaction,
    };
  }

  // Get user level based on credits
  getUserLevel(credits: number) {
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
      if (credits >= USER_LEVELS[i].minCredits) {
        return USER_LEVELS[i];
      }
    }
    return USER_LEVELS[0];
  }

  // Get transactions with pagination
  async getTransactions(userId: string, params?: { limit?: number; offset?: number; type?: 'earning' | 'spending' }) {
    const { limit = 50, offset = 0, type } = params || {};

    const where: any = { userId };
    if (type === 'earning') {
      where.amount = { gt: 0 };
    } else if (type === 'spending') {
      where.amount = { lt: 0 };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.creditTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  // Get balance and stats
  async getBalance(userId: string) {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const level = this.getUserLevel(user.credits);
    const nextLevel = USER_LEVELS.find(l => l.level === level.level + 1);

    return {
      balance: user.credits,
      level,
      nextLevel,
      progress: nextLevel ? ((user.credits - level.minCredits) / (nextLevel.minCredits - level.minCredits)) * 100 : 100,
    };
  }

  // Get earning stats (today, this week, this month)
  async getEarningStats(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [todayEarned, weekEarned, monthEarned, totalEarned, totalSpent] = await Promise.all([
      this.prisma.creditTransaction.aggregate({
        where: { userId, amount: { gt: 0 }, createdAt: { gte: today } },
        _sum: { amount: true },
      }),
      this.prisma.creditTransaction.aggregate({
        where: { userId, amount: { gt: 0 }, createdAt: { gte: weekAgo } },
        _sum: { amount: true },
      }),
      this.prisma.creditTransaction.aggregate({
        where: { userId, amount: { gt: 0 }, createdAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      this.prisma.creditTransaction.aggregate({
        where: { userId, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      this.prisma.creditTransaction.aggregate({
        where: { userId, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    return {
      today: todayEarned._sum.amount || 0,
      week: weekEarned._sum.amount || 0,
      month: monthEarned._sum.amount || 0,
      totalEarned: totalEarned._sum.amount || 0,
      totalSpent: Math.abs(totalSpent._sum.amount || 0),
    };
  }

  // Get earning opportunities (what user can do to earn credits)
  getEarningOpportunities() {
    return Object.entries(EARNING_RULES)
      .filter(([reason, rule]) => rule.amount > 0)
      .map(([reason, rule]) => ({
        reason: reason as CreditReason,
        amount: rule.amount,
        dailyLimit: rule.dailyLimit,
        description: rule.description,
      }));
  }

  // Admin: Get leaderboard
  async getLeaderboard(limit = 10) {
    const users = await this.prisma.User.findMany({
      orderBy: { credits: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        credits: true,
      },
    });

    return users.map(user => ({
      ...user,
      level: this.getUserLevel(user.credits),
    }));
  }
}
