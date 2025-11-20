import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../notifications/email.service';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
}

export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface NotificationPayload {
  title: string;
  message: string;
  severity: NotificationSeverity;
  details?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // Admin contacts for critical alerts
  private readonly adminEmails: string[];
  private readonly discordWebhook: string | null;
  private readonly telegramBotToken: string | null;
  private readonly telegramChatId: string | null;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.adminEmails = (this.configService.get('ADMIN_EMAILS') || '')
      .split(',')
      .filter(Boolean);
    this.discordWebhook = this.configService.get('DISCORD_WEBHOOK_URL') || null;
    this.telegramBotToken = this.configService.get('TELEGRAM_BOT_TOKEN') || null;
    this.telegramChatId = this.configService.get('TELEGRAM_CHAT_ID') || null;
  }

  /**
   * Send alert to all configured channels
   */
  async sendAlert(payload: NotificationPayload): Promise<void> {
    const promises: Promise<void>[] = [];

    // Always log to console
    this.logAlert(payload);

    // Send to Discord if configured
    if (this.discordWebhook) {
      promises.push(this.sendDiscordAlert(payload));
    }

    // Send to Telegram if configured
    if (this.telegramBotToken && this.telegramChatId) {
      promises.push(this.sendTelegramAlert(payload));
    }

    // Send email for critical alerts
    if (payload.severity === NotificationSeverity.CRITICAL && this.adminEmails.length > 0) {
      promises.push(this.sendEmailAlert(payload));
    }

    // Wait for all notifications to complete
    await Promise.allSettled(promises);
  }

  /**
   * Send emergency pause alert
   */
  async sendEmergencyPauseAlert(
    network: string,
    pauser: string,
    reason: string,
    txHash: string,
  ): Promise<void> {
    await this.sendAlert({
      title: '🚨 EMERGENCY: Contract Paused',
      message: `The SEMILLA contract has been paused on ${network}`,
      severity: NotificationSeverity.CRITICAL,
      details: {
        network,
        pauser,
        reason,
        txHash,
        action: 'Investigate immediately and determine if unpause is safe',
      },
    });
  }

  /**
   * Send emergency unpause alert
   */
  async sendEmergencyUnpauseAlert(
    network: string,
    unpauser: string,
    txHash: string,
  ): Promise<void> {
    await this.sendAlert({
      title: '✅ Contract Unpaused',
      message: `The SEMILLA contract has been unpaused on ${network}`,
      severity: NotificationSeverity.WARNING,
      details: {
        network,
        unpauser,
        txHash,
      },
    });
  }

  /**
   * Send bridge failure alert
   */
  async sendBridgeFailureAlert(
    network: string,
    from: string,
    amount: string,
    error: string,
  ): Promise<void> {
    await this.sendAlert({
      title: '❌ Bridge Transaction Failed',
      message: `A bridge unlock failed on ${network}`,
      severity: NotificationSeverity.ERROR,
      details: {
        network,
        from,
        amount,
        error,
      },
    });
  }

  /**
   * Send suspicious activity alert
   */
  async sendSuspiciousActivityAlert(
    type: string,
    details: Record<string, any>,
  ): Promise<void> {
    await this.sendAlert({
      title: '⚠️ Suspicious Activity Detected',
      message: `Suspicious ${type} activity detected`,
      severity: NotificationSeverity.WARNING,
      details,
    });
  }

  // ============= PRIVATE METHODS =============

  private logAlert(payload: NotificationPayload): void {
    const severityEmoji = {
      [NotificationSeverity.INFO]: 'ℹ️',
      [NotificationSeverity.WARNING]: '⚠️',
      [NotificationSeverity.ERROR]: '❌',
      [NotificationSeverity.CRITICAL]: '🚨',
    };

    const emoji = severityEmoji[payload.severity];
    const logMethod = payload.severity === NotificationSeverity.CRITICAL
      ? 'error'
      : payload.severity === NotificationSeverity.ERROR
        ? 'error'
        : 'warn';

    this.logger[logMethod](
      `${emoji} [${payload.severity}] ${payload.title}: ${payload.message}`,
    );

    if (payload.details) {
      this.logger.debug('Details:', payload.details);
    }
  }

  private async sendDiscordAlert(payload: NotificationPayload): Promise<void> {
    if (!this.discordWebhook) return;

    try {
      const color = {
        [NotificationSeverity.INFO]: 0x3498db,
        [NotificationSeverity.WARNING]: 0xf39c12,
        [NotificationSeverity.ERROR]: 0xe74c3c,
        [NotificationSeverity.CRITICAL]: 0x9b59b6,
      };

      const embed = {
        title: payload.title,
        description: payload.message,
        color: color[payload.severity],
        fields: payload.details
          ? Object.entries(payload.details).map(([name, value]) => ({
              name,
              value: String(value),
              inline: true,
            }))
          : [],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Truk Blockchain Monitor',
        },
      };

      const response = await fetch(this.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!response.ok) {
        throw new Error(`Discord API returned ${response.status}`);
      }

      this.logger.debug('Discord alert sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Discord alert: ${error.message}`);
    }
  }

  private async sendTelegramAlert(payload: NotificationPayload): Promise<void> {
    if (!this.telegramBotToken || !this.telegramChatId) return;

    try {
      const severityEmoji = {
        [NotificationSeverity.INFO]: 'ℹ️',
        [NotificationSeverity.WARNING]: '⚠️',
        [NotificationSeverity.ERROR]: '❌',
        [NotificationSeverity.CRITICAL]: '🚨',
      };

      let text = `${severityEmoji[payload.severity]} *${payload.title}*\n\n${payload.message}`;

      if (payload.details) {
        text += '\n\n*Details:*\n';
        for (const [key, value] of Object.entries(payload.details)) {
          text += `• ${key}: \`${value}\`\n`;
        }
      }

      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.telegramChatId,
          text,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API returned ${response.status}`);
      }

      this.logger.debug('Telegram alert sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Telegram alert: ${error.message}`);
    }
  }

  private async sendEmailAlert(payload: NotificationPayload): Promise<void> {
    if (this.adminEmails.length === 0) return;

    try {
      const severityEmoji = {
        [NotificationSeverity.INFO]: 'ℹ️',
        [NotificationSeverity.WARNING]: '⚠️',
        [NotificationSeverity.ERROR]: '❌',
        [NotificationSeverity.CRITICAL]: '🚨',
      };

      const severityColors = {
        [NotificationSeverity.INFO]: '#3498db',
        [NotificationSeverity.WARNING]: '#f39c12',
        [NotificationSeverity.ERROR]: '#e74c3c',
        [NotificationSeverity.CRITICAL]: '#9b59b6',
      };

      const emoji = severityEmoji[payload.severity];
      const color = severityColors[payload.severity];

      // Format details as HTML
      let detailsHtml = '';
      if (payload.details) {
        detailsHtml = '<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;"><h3 style="margin: 0 0 10px 0;">Details:</h3><ul style="margin: 0; padding-left: 20px;">';
        for (const [key, value] of Object.entries(payload.details)) {
          detailsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        detailsHtml += '</ul></div>';
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${emoji} ${payload.severity} ALERT</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="margin: 0 0 15px 0; color: ${color};">${payload.title}</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #374151;">${payload.message}</p>
            ${detailsHtml}
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0;">Time: ${new Date().toISOString()}</p>
              <p style="margin: 5px 0 0 0;">Truk Blockchain Monitor</p>
            </div>
          </div>
        </div>
      `;

      // Send email to all admin emails
      for (const adminEmail of this.adminEmails) {
        await this.emailService.sendEmail({
          to: adminEmail,
          subject: `[${payload.severity}] ${payload.title}`,
          html,
        });
      }

      this.logger.log(
        `📧 Email alert sent to ${this.adminEmails.join(', ')}: ${payload.title}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email alert: ${error.message}`);
    }
  }
}
