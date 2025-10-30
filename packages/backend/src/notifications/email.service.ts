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
