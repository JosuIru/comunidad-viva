import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = this.isEmailConfigured();

    if (this.enabled) {
      this.createTransporter();
    } else {
      this.logger.warn('Email service disabled - SMTP not configured');
    }
  }

  private isEmailConfigured(): boolean {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    return !!(host && port && user && pass);
  }

  private createTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
        secure: this.configService.get<string>('SMTP_PORT') === '465',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      this.logger.log('Email transporter created successfully');
    } catch (error) {
      this.logger.error('Failed to create email transporter', error);
      this.transporter = null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      this.logger.debug(`Email not sent (disabled): ${options.subject} to ${options.to}`);
      return false;
    }

    try {
      const from = this.configService.get<string>('SMTP_FROM') ||
                   this.configService.get<string>('SMTP_USER');

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      this.logger.log(`Email sent: ${options.subject} to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${options.subject}`, error);
      return false;
    }
  }

  // Event notifications
  async sendEventRegistrationConfirmation(
    to: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Registro confirmado! 🎉</h2>
        <p>Te has registrado exitosamente en el evento:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${eventTitle}</h3>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(eventDate).toLocaleString('es-ES')}</p>
          <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${eventLocation}</p>
        </div>
        <p>¡Nos vemos allí!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Registro confirmado: ${eventTitle}`,
      html,
    });
  }

  async sendEventCancellation(
    to: string,
    eventTitle: string,
    reason?: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Evento cancelado 😔</h2>
        <p>Lamentamos informarte que el siguiente evento ha sido cancelado:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0;">${eventTitle}</h3>
          ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
        </div>
        <p>Esperamos verte en futuros eventos.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Evento cancelado: ${eventTitle}`,
      html,
    });
  }

  // TimeBank notifications
  async sendTimeBankRequest(
    to: string,
    requesterName: string,
    serviceName: string,
    hours: number,
    scheduledFor: Date,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nueva solicitud de servicio ⏰</h2>
        <p>${requesterName} ha solicitado tu servicio:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${serviceName}</h3>
          <p style="margin: 5px 0;"><strong>Duración:</strong> ${hours} ${hours === 1 ? 'hora' : 'horas'}</p>
          <p style="margin: 5px 0;"><strong>Fecha propuesta:</strong> ${new Date(scheduledFor).toLocaleString('es-ES')}</p>
        </div>
        <p>Por favor, revisa y confirma la solicitud en tu panel de gestión.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Nueva solicitud: ${serviceName}`,
      html,
    });
  }

  async sendTimeBankConfirmation(
    to: string,
    providerName: string,
    serviceName: string,
    accepted: boolean,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${accepted ? '#16a34a' : '#dc2626'};">
          ${accepted ? 'Solicitud aceptada ✅' : 'Solicitud rechazada ❌'}
        </h2>
        <p>${providerName} ha ${accepted ? 'aceptado' : 'rechazado'} tu solicitud de servicio:</p>
        <div style="background: ${accepted ? '#f0fdf4' : '#fef2f2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${serviceName}</h3>
        </div>
        ${accepted
          ? '<p>¡Excelente! Ya puedes coordinar los detalles del servicio.</p>'
          : '<p>No te preocupes, hay muchos otros servicios disponibles en el banco de tiempo.</p>'}
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${accepted ? 'Solicitud aceptada' : 'Solicitud rechazada'}: ${serviceName}`,
      html,
    });
  }

  async sendTimeBankCompletion(
    to: string,
    serviceName: string,
    credits: number,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Servicio completado 🎉</h2>
        <p>El siguiente servicio se ha completado exitosamente:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${serviceName}</h3>
          <p style="margin: 5px 0;"><strong>Créditos:</strong> ${credits}</p>
        </div>
        <p>Gracias por participar en el banco de tiempo de tu comunidad.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Servicio completado: ${serviceName}`,
      html,
    });
  }

  // GroupBuy notifications
  async sendGroupBuyParticipation(
    to: string,
    userName: string,
    groupBuyTitle: string,
    currentParticipants: number,
    minRequired: number,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nueva participación en compra grupal 🛒</h2>
        <p>${userName} se ha unido a tu compra grupal:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${groupBuyTitle}</h3>
          <p style="margin: 5px 0;">
            <strong>Participantes:</strong> ${currentParticipants} / ${minRequired}
          </p>
          <div style="background: #e5e7eb; border-radius: 8px; height: 20px; margin-top: 10px; overflow: hidden;">
            <div style="background: #2563eb; height: 100%; width: ${(currentParticipants / minRequired) * 100}%;"></div>
          </div>
        </div>
        ${currentParticipants >= minRequired
          ? '<p style="color: #16a34a; font-weight: bold;">¡Objetivo alcanzado! La compra está lista para cerrarse.</p>'
          : '<p>Sigue compartiendo para alcanzar el objetivo.</p>'}
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Nueva participación: ${groupBuyTitle}`,
      html,
    });
  }

  async sendGroupBuyClosed(
    to: string,
    groupBuyTitle: string,
    finalPrice: number,
    savings: number,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">¡Compra grupal cerrada! 🎊</h2>
        <p>La compra grupal se ha cerrado exitosamente:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${groupBuyTitle}</h3>
          <p style="margin: 5px 0;"><strong>Precio final:</strong> €${finalPrice.toFixed(2)}</p>
          <p style="margin: 5px 0; color: #16a34a;"><strong>Ahorro:</strong> €${savings.toFixed(2)}</p>
        </div>
        <p>El organizador coordinará la entrega. ¡Gracias por participar!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Compra cerrada: ${groupBuyTitle}`,
      html,
    });
  }

  // Offer notifications
  async sendOfferInterest(
    to: string,
    userName: string,
    userEmail: string,
    offerTitle: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Alguien está interesado en tu oferta 💡</h2>
        <p>${userName} ha mostrado interés en:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${offerTitle}</h3>
        </div>
        <p><strong>Contacto:</strong> ${userEmail}</p>
        <p>Ponte en contacto para coordinar los detalles.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Interés en tu oferta: ${offerTitle}`,
      html,
    });
  }

  // Proposal notifications
  async sendNewProposal(
    to: string,
    proposalTitle: string,
    proposerName: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nueva propuesta de comunidad 📋</h2>
        <p>${proposerName} ha creado una nueva propuesta:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${proposalTitle}</h3>
        </div>
        <p>Revisa la propuesta y vota en tu panel de gobernanza.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Nueva propuesta: ${proposalTitle}`,
      html,
    });
  }

  // Welcome email
  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">¡Bienvenido a Comunidad Viva! 🌱</h1>
        <p>Hola ${userName},</p>
        <p>Gracias por unirte a nuestra plataforma de economía colaborativa.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Primeros pasos:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Completa tu perfil</li>
            <li>Únete a una comunidad local</li>
            <li>Explora ofertas y eventos</li>
            <li>Participa en el banco de tiempo</li>
          </ul>
        </div>
        <p>Juntos construimos una economía más justa y solidaria.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: '¡Bienvenido a Comunidad Viva!',
      html,
    });
  }

  // Achievement notifications
  async sendBadgeUnlocked(
    to: string,
    userName: string,
    badgeName: string,
    badgeDescription: string,
    badgeRarity: string,
    credits?: number,
    xp?: number,
  ): Promise<boolean> {
    const rarityColors = {
      COMMON: '#9ca3af',
      RARE: '#3b82f6',
      EPIC: '#a855f7',
      LEGENDARY: '#f59e0b',
      SECRET: '#ec4899',
    };

    const color = rarityColors[badgeRarity as keyof typeof rarityColors] || '#6b7280';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">¡Nuevo Badge Desbloqueado! 🏆</h2>
        <p>¡Felicidades ${userName}!</p>
        <div style="background: linear-gradient(135deg, ${color}20, ${color}10); padding: 30px; border-radius: 12px; margin: 20px 0; border: 2px solid ${color};">
          <h3 style="margin: 0 0 10px 0; color: ${color};">${badgeName}</h3>
          <p style="margin: 10px 0; font-size: 14px; color: #4b5563;">${badgeDescription}</p>
          <p style="margin: 10px 0 0 0; font-weight: bold; color: ${color}; text-transform: uppercase; font-size: 12px;">
            ${badgeRarity}
          </p>
        </div>
        ${credits || xp ? `
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Recompensas:</h4>
            ${credits ? `<p style="margin: 5px 0;">💰 <strong>${credits} créditos</strong></p>` : ''}
            ${xp ? `<p style="margin: 5px 0;">⭐ <strong>${xp} XP</strong></p>` : ''}
          </div>
        ` : ''}
        <p>¡Sigue participando en la comunidad para desbloquear más badges!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `¡Badge Desbloqueado! ${badgeName}`,
      html,
    });
  }

  async sendLevelUp(
    to: string,
    userName: string,
    newLevel: number,
    levelName: string,
    levelIcon: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">¡Subiste de Nivel! ${levelIcon}</h2>
        <p>¡Increíble ${userName}!</p>
        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 40px; border-radius: 12px; margin: 20px 0; text-align: center; border: 3px solid #f59e0b;">
          <div style="font-size: 60px; margin-bottom: 15px;">${levelIcon}</div>
          <h1 style="margin: 0; color: #92400e;">Nivel ${newLevel}</h1>
          <h3 style="margin: 10px 0 0 0; color: #b45309;">${levelName}</h3>
        </div>
        <p>Tu participación activa en la comunidad está marcando la diferencia.</p>
        <p>¡Sigue adelante y alcanza nuevos logros!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `¡Nivel ${newLevel} alcanzado! ${levelName}`,
      html,
    });
  }

  // Credit Decay notifications
  async sendCreditDecayWarning(
    to: string,
    userName: string,
    credits: number,
    daysUntilExpiration: number,
  ): Promise<boolean> {
    const urgencyColor = daysUntilExpiration <= 1 ? '#dc2626' : daysUntilExpiration <= 7 ? '#f59e0b' : '#3b82f6';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${urgencyColor};">⚠️ Créditos próximos a expirar</h2>
        <p>Hola ${userName},</p>
        <p>Queremos recordarte que tienes créditos que están por expirar:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
          <h3 style="margin: 0 0 10px 0; color: ${urgencyColor};">
            ${credits} créditos expirarán en ${daysUntilExpiration} día${daysUntilExpiration > 1 ? 's' : ''}
          </h3>
          <p style="margin: 10px 0 0 0; color: #7f1d1d;">
            Los créditos sin usar durante 12 meses expiran para mantener la economía circulante.
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">¿Cómo usar tus créditos?</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Participa en compras grupales</li>
            <li>Solicita servicios del banco de tiempo</li>
            <li>Accede a eventos especiales</li>
            <li>Apoya proyectos de ayuda mutua</li>
          </ul>
        </div>
        <p>¡No dejes que tus créditos se pierdan! Úsalos y contribuye a tu comunidad.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `⚠️ ${credits} créditos expiran en ${daysUntilExpiration} día${daysUntilExpiration > 1 ? 's' : ''}`,
      html,
    });
  }

  async sendCreditDecayNotification(
    to: string,
    userName: string,
    decayAmount: number,
    decayRate: number,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Decay Mensual de Créditos 📉</h2>
        <p>Hola ${userName},</p>
        <p>Como parte de nuestro sistema de moneda oxidable, se ha aplicado el decay mensual:</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">
            -${decayAmount} créditos (${decayRate * 100}% mensual)
          </h3>
          <p style="margin: 10px 0 0 0; color: #78350f;">
            El decay fomenta la circulación activa en lugar del ahorro excesivo.
          </p>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">💡 "El dinero es como el abono"</h4>
          <p style="margin: 0; font-style: italic; color: #166534;">
            "Solo sirve si se reparte" - Francis Bacon
          </p>
        </div>
        <p>Recuerda: usa tus créditos regularmente para evitar el decay futuro.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Decay mensual aplicado: -${decayAmount} créditos`,
      html,
    });
  }

  async sendCreditsExpired(
    to: string,
    userName: string,
    expiredAmount: number,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Créditos expirados ⌛</h2>
        <p>Hola ${userName},</p>
        <p>Lamentamos informarte que algunos de tus créditos han expirado:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b;">
            -${expiredAmount} créditos expirados
          </h3>
          <p style="margin: 10px 0 0 0; color: #7f1d1d;">
            Estos créditos no fueron usados durante 12 meses.
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">¿Cómo evitar esto en el futuro?</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Usa tus créditos regularmente</li>
            <li>Activa las notificaciones de expiración</li>
            <li>Revisa tu balance mensualmente</li>
            <li>Participa activamente en la comunidad</li>
          </ul>
        </div>
        <p>Sigue ganando créditos participando en tu comunidad.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `${expiredAmount} créditos han expirado`,
      html,
    });
  }

  // Community notifications
  async sendCommunityWelcome(
    to: string,
    userName: string,
    communityName: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Bienvenido a ${communityName}! 🏘️</h2>
        <p>Hola ${userName},</p>
        <p>Te has unido exitosamente a la comunidad:</p>
        <div style="background: #eff6ff; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; color: #1e40af; font-size: 24px;">${communityName}</h3>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">Próximos pasos:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Explora las ofertas locales</li>
            <li>Conoce a los miembros</li>
            <li>Participa en eventos</li>
            <li>Comparte tus habilidades</li>
          </ul>
        </div>
        <p>Juntos construimos una comunidad más fuerte y solidaria.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          Comunidad Viva - Plataforma de economía colaborativa
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Bienvenido a ${communityName}`,
      html,
    });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}
