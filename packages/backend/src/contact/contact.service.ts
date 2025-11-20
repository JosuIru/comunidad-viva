import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../notifications/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly adminEmails: string[];

  constructor(
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.adminEmails = (this.configService.get('ADMIN_EMAILS') || '')
      .split(',')
      .filter(Boolean);
  }

  async handleContactForm(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        return {
          success: false,
          message: 'All fields are required',
        };
      }

      // Send email to admins
      const subjectMap: Record<string, string> = {
        general: 'Consulta General',
        support: 'Soporte Técnico',
        bug: 'Reporte de Error',
        feature: 'Solicitud de Funcionalidad',
        partnership: 'Propuesta de Colaboración',
        other: 'Otro',
      };

      const subjectText = subjectMap[formData.subject] || formData.subject;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 5px 0; color: #374151;">De:</h3>
              <p style="margin: 0; font-size: 16px;"><strong>${formData.name}</strong> (${formData.email})</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 5px 0; color: #374151;">Asunto:</h3>
              <p style="margin: 0; font-size: 16px;">${subjectText}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Mensaje:</h3>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
${formData.message}
              </div>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">Recibido: ${new Date().toLocaleString('es-ES')}</p>
              <p style="margin: 5px 0 0 0;">Comunidad Viva - Formulario de Contacto</p>
            </div>
          </div>
        </div>
      `;

      // Send to all admin emails
      if (this.adminEmails.length > 0) {
        for (const adminEmail of this.adminEmails) {
          await this.emailService.sendEmail({
            to: adminEmail,
            subject: `[Contacto] ${subjectText} - ${formData.name}`,
            html,
          });
        }
        this.logger.log(`Contact form submitted by ${formData.name} (${formData.email})`);
      } else {
        this.logger.warn('No admin emails configured. Contact form not sent.');
      }

      // Send confirmation email to user
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Mensaje recibido! 📨</h2>
          <p>Hola ${formData.name},</p>
          <p>Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos lo antes posible.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Resumen de tu mensaje:</h3>
            <p style="margin: 5px 0;"><strong>Asunto:</strong> ${subjectText}</p>
            <p style="margin: 5px 0;"><strong>Mensaje:</strong></p>
            <p style="margin: 5px 0; white-space: pre-wrap;">${formData.message}</p>
          </div>

          <p>Si necesitas ayuda urgente, puedes escribirnos directamente a <a href="mailto:hola@comunidadviva.org">hola@comunidadviva.org</a></p>

          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Comunidad Viva - Plataforma de economía colaborativa
          </p>
        </div>
      `;

      await this.emailService.sendEmail({
        to: formData.email,
        subject: 'Hemos recibido tu mensaje - Comunidad Viva',
        html: confirmationHtml,
      });

      return {
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!',
      };
    } catch (error) {
      this.logger.error(`Failed to handle contact form: ${error.message}`);
      return {
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
      };
    }
  }
}
