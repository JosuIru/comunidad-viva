import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * Tipos de acciones de auditoría
 */
export enum AuditAction {
  // Autenticación
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  REGISTER = 'register',

  // Verificación y Seguridad
  EMAIL_VERIFICATION = 'email_verification',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_FAILED = 'two_factor_failed',

  // Tokens
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REVOKED = 'token_revoked',

  // Actividad crítica
  OFFER_CREATED = 'offer_created',
  OFFER_UPDATED = 'offer_updated',
  OFFER_DELETED = 'offer_deleted',
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_DELETED = 'event_deleted',
  CREDIT_SENT = 'credit_sent',
  CREDIT_RECEIVED = 'credit_received',
  PROPOSAL_CREATED = 'proposal_created',
  PROPOSAL_VOTED = 'proposal_voted',

  // Administración
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  ROLE_CHANGED = 'role_changed',
}

/**
 * Servicio de auditoría para registrar acciones de seguridad
 */
@Injectable()
export class AuditLoggerService {
  private readonly logger = new WinstonLoggerService('AuditLogger');

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar una acción de auditoría
   */
  async log(params: {
    userId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const {
        userId,
        action,
        entity,
        entityId,
        oldData,
        newData,
        ip,
        userAgent,
        metadata = {},
      } = params;

      // Registrar en base de datos
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
          newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
          ip,
          userAgent,
        },
      });

      // Log en Winston para procesamiento adicional
      this.logger.security(
        `${action} - ${entity}${entityId ? `:${entityId}` : ''}`,
        {
          userId,
          action,
          entity,
          entityId,
          ip,
          userAgent,
          ...metadata,
        }
      );
    } catch (error) {
      // No fallar si el audit log falla
      this.logger.error('Failed to create audit log', error, {
        action: params.action,
        entity: params.entity,
      });
    }
  }

  /**
   * Registrar login exitoso
   */
  async logLogin(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string,
    with2FA: boolean = false
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: userId,
      newData: { email, with2FA },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar login fallido
   */
  async logFailedLogin(
    email: string,
    reason: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.FAILED_LOGIN,
      entity: 'User',
      newData: { email, reason },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar logout
   */
  async logLogout(userId: string, ip?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar registro de nuevo usuario
   */
  async logRegister(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.REGISTER,
      entity: 'User',
      entityId: userId,
      newData: { email },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar verificación de email
   */
  async logEmailVerification(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.EMAIL_VERIFICATION,
      entity: 'User',
      entityId: userId,
      newData: { email },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar envío de email de verificación
   */
  async logEmailVerificationSent(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.EMAIL_VERIFICATION_SENT,
      entity: 'User',
      entityId: userId,
      newData: { email },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar cambio de contraseña
   */
  async logPasswordChange(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar solicitud de reset de contraseña
   */
  async logPasswordResetRequest(
    email: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PASSWORD_RESET_REQUEST,
      entity: 'User',
      newData: { email },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar reset de contraseña completado
   */
  async logPasswordReset(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PASSWORD_RESET,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar activación de 2FA
   */
  async logTwoFactorEnabled(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TWO_FACTOR_ENABLED,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar desactivación de 2FA
   */
  async logTwoFactorDisabled(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TWO_FACTOR_DISABLED,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar fallo de 2FA
   */
  async logTwoFactorFailed(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TWO_FACTOR_FAILED,
      entity: 'User',
      entityId: userId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar refresco de token
   */
  async logTokenRefresh(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TOKEN_REFRESH,
      entity: 'RefreshToken',
      ip,
      userAgent,
    });
  }

  /**
   * Registrar revocación de token
   */
  async logTokenRevoked(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TOKEN_REVOKED,
      entity: 'RefreshToken',
      ip,
      userAgent,
    });
  }

  /**
   * Registrar creación de oferta
   */
  async logOfferCreated(
    userId: string,
    offerId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.OFFER_CREATED,
      entity: 'Offer',
      entityId: offerId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar creación de evento
   */
  async logEventCreated(
    userId: string,
    eventId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.EVENT_CREATED,
      entity: 'Event',
      entityId: eventId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar envío de créditos
   */
  async logCreditSent(
    userId: string,
    transactionId: string,
    amount: number,
    recipientId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.CREDIT_SENT,
      entity: 'Transaction',
      entityId: transactionId,
      newData: { amount, recipientId },
      ip,
      userAgent,
    });
  }

  /**
   * Registrar creación de propuesta
   */
  async logProposalCreated(
    userId: string,
    proposalId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PROPOSAL_CREATED,
      entity: 'Proposal',
      entityId: proposalId,
      ip,
      userAgent,
    });
  }

  /**
   * Registrar voto en propuesta
   */
  async logProposalVoted(
    userId: string,
    proposalId: string,
    vote: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PROPOSAL_VOTED,
      entity: 'Proposal',
      entityId: proposalId,
      newData: { vote },
      ip,
      userAgent,
    });
  }

  /**
   * Obtener logs de un usuario
   */
  async getUserAuditLogs(userId: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtener logs de seguridad recientes
   */
  async getSecurityLogs(limit: number = 100) {
    const securityActions = [
      AuditAction.FAILED_LOGIN,
      AuditAction.TWO_FACTOR_FAILED,
      AuditAction.PASSWORD_CHANGE,
      AuditAction.PASSWORD_RESET,
      AuditAction.TWO_FACTOR_ENABLED,
      AuditAction.TWO_FACTOR_DISABLED,
    ];

    return this.prisma.auditLog.findMany({
      where: {
        action: { in: securityActions },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtener intentos de login fallidos por IP
   */
  async getFailedLoginsByIP(ip: string, since: Date) {
    return this.prisma.auditLog.count({
      where: {
        action: AuditAction.FAILED_LOGIN,
        ip,
        createdAt: { gte: since },
      },
    });
  }

  /**
   * Obtener intentos de login fallidos por email
   */
  async getFailedLoginsByEmail(email: string, since: Date) {
    return this.prisma.auditLog.count({
      where: {
        action: AuditAction.FAILED_LOGIN,
        newData: {
          path: ['email'],
          equals: email,
        },
        createdAt: { gte: since },
      },
    });
  }
}
