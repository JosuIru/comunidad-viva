import { Injectable } from '@nestjs/common';
import { IntegrationPlatform } from './dto/create-integration.dto';

@Injectable()
export class MessageFormatterService {
  /**
   * Format an offer message for a specific platform
   */
  formatOfferMessage(
    offer: any,
    platform: IntegrationPlatform,
    deepLink: string,
  ): string {
    const maxLength = this.getMaxLength(platform);
    const emoji = '🎁';

    let message = '';

    switch (platform) {
      case IntegrationPlatform.TELEGRAM:
        message = this.formatTelegramOffer(offer, emoji, deepLink);
        break;
      case IntegrationPlatform.DISCORD:
        message = this.formatDiscordOffer(offer, emoji, deepLink);
        break;
      case IntegrationPlatform.SLACK:
        message = this.formatSlackOffer(offer, emoji, deepLink);
        break;
      case IntegrationPlatform.WHATSAPP_BUSINESS:
      case IntegrationPlatform.SIGNAL:
        message = this.formatSimpleOffer(offer, emoji, deepLink);
        break;
      default:
        message = this.formatSimpleOffer(offer, emoji, deepLink);
    }

    return this.truncateMessage(message, maxLength);
  }

  /**
   * Format an event message for a specific platform
   */
  formatEventMessage(
    event: any,
    platform: IntegrationPlatform,
    deepLink: string,
  ): string {
    const maxLength = this.getMaxLength(platform);
    const emoji = '📅';

    let message = '';

    switch (platform) {
      case IntegrationPlatform.TELEGRAM:
        message = this.formatTelegramEvent(event, emoji, deepLink);
        break;
      case IntegrationPlatform.DISCORD:
        message = this.formatDiscordEvent(event, emoji, deepLink);
        break;
      case IntegrationPlatform.SLACK:
        message = this.formatSlackEvent(event, emoji, deepLink);
        break;
      case IntegrationPlatform.WHATSAPP_BUSINESS:
      case IntegrationPlatform.SIGNAL:
        message = this.formatSimpleEvent(event, emoji, deepLink);
        break;
      default:
        message = this.formatSimpleEvent(event, emoji, deepLink);
    }

    return this.truncateMessage(message, maxLength);
  }

  /**
   * Format a need message for a specific platform
   */
  formatNeedMessage(
    need: any,
    platform: IntegrationPlatform,
    deepLink: string,
  ): string {
    const maxLength = this.getMaxLength(platform);
    const emoji = '🆘';

    let message = '';

    switch (platform) {
      case IntegrationPlatform.TELEGRAM:
        message = this.formatTelegramNeed(need, emoji, deepLink);
        break;
      case IntegrationPlatform.DISCORD:
        message = this.formatDiscordNeed(need, emoji, deepLink);
        break;
      case IntegrationPlatform.SLACK:
        message = this.formatSlackNeed(need, emoji, deepLink);
        break;
      case IntegrationPlatform.WHATSAPP_BUSINESS:
      case IntegrationPlatform.SIGNAL:
        message = this.formatSimpleNeed(need, emoji, deepLink);
        break;
      default:
        message = this.formatSimpleNeed(need, emoji, deepLink);
    }

    return this.truncateMessage(message, maxLength);
  }

  // Telegram formatters
  private formatTelegramOffer(offer: any, emoji: string, deepLink: string): string {
    const title = offer.title || 'Sin título';
    const description = offer.description || 'Sin descripción';
    const category = offer.category || 'General';
    const userName = offer.user?.name || 'Usuario';

    return `${emoji} <b>Nueva Oferta</b>\n\n` +
      `<b>${title}</b>\n` +
      `${description}\n\n` +
      `📂 Categoría: ${category}\n` +
      `👤 Publicado por: ${userName}\n\n` +
      `<a href="${deepLink}">Ver detalles</a>`;
  }

  private formatTelegramEvent(event: any, emoji: string, deepLink: string): string {
    const title = event.title || 'Sin título';
    const description = event.description || 'Sin descripción';
    const date = event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Fecha por confirmar';
    const location = event.location || 'Ubicación por confirmar';
    const organizerName = event.organizer?.name || 'Organizador';

    return `${emoji} <b>Nuevo Evento</b>\n\n` +
      `<b>${title}</b>\n` +
      `${description}\n\n` +
      `📍 Ubicación: ${location}\n` +
      `🕐 Fecha: ${date}\n` +
      `👤 Organiza: ${organizerName}\n\n` +
      `<a href="${deepLink}">Ver detalles e inscribirse</a>`;
  }

  private formatTelegramNeed(need: any, emoji: string, deepLink: string): string {
    const title = need.title || 'Sin título';
    const description = need.description || 'Sin descripción';
    const urgency = need.urgency || 'normal';
    const userName = need.user?.name || 'Usuario';

    const urgencyEmoji = urgency === 'high' ? '🔴' : urgency === 'medium' ? '🟡' : '🟢';

    return `${emoji} <b>Nueva Necesidad</b>\n\n` +
      `<b>${title}</b>\n` +
      `${description}\n\n` +
      `${urgencyEmoji} Urgencia: ${this.translateUrgency(urgency)}\n` +
      `👤 Solicitado por: ${userName}\n\n` +
      `<a href="${deepLink}">Ver detalles y ayudar</a>`;
  }

  // Discord formatters
  private formatDiscordOffer(offer: any, emoji: string, deepLink: string): string {
    const title = offer.title || 'Sin título';
    const description = offer.description || 'Sin descripción';
    const category = offer.category || 'General';
    const userName = offer.user?.name || 'Usuario';

    return `${emoji} **Nueva Oferta**\n\n` +
      `**${title}**\n` +
      `${description}\n\n` +
      `📂 Categoría: ${category}\n` +
      `👤 Publicado por: ${userName}\n\n` +
      `[Ver detalles](${deepLink})`;
  }

  private formatDiscordEvent(event: any, emoji: string, deepLink: string): string {
    const title = event.title || 'Sin título';
    const description = event.description || 'Sin descripción';
    const date = event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Fecha por confirmar';
    const location = event.location || 'Ubicación por confirmar';
    const organizerName = event.organizer?.name || 'Organizador';

    return `${emoji} **Nuevo Evento**\n\n` +
      `**${title}**\n` +
      `${description}\n\n` +
      `📍 Ubicación: ${location}\n` +
      `🕐 Fecha: ${date}\n` +
      `👤 Organiza: ${organizerName}\n\n` +
      `[Ver detalles e inscribirse](${deepLink})`;
  }

  private formatDiscordNeed(need: any, emoji: string, deepLink: string): string {
    const title = need.title || 'Sin título';
    const description = need.description || 'Sin descripción';
    const urgency = need.urgency || 'normal';
    const userName = need.user?.name || 'Usuario';

    const urgencyEmoji = urgency === 'high' ? '🔴' : urgency === 'medium' ? '🟡' : '🟢';

    return `${emoji} **Nueva Necesidad**\n\n` +
      `**${title}**\n` +
      `${description}\n\n` +
      `${urgencyEmoji} Urgencia: ${this.translateUrgency(urgency)}\n` +
      `👤 Solicitado por: ${userName}\n\n` +
      `[Ver detalles y ayudar](${deepLink})`;
  }

  // Slack formatters
  private formatSlackOffer(offer: any, emoji: string, deepLink: string): string {
    const title = offer.title || 'Sin título';
    const description = offer.description || 'Sin descripción';
    const category = offer.category || 'General';
    const userName = offer.user?.name || 'Usuario';

    return `${emoji} *Nueva Oferta*\n\n` +
      `*${title}*\n` +
      `${description}\n\n` +
      `📂 Categoría: ${category}\n` +
      `👤 Publicado por: ${userName}\n\n` +
      `<${deepLink}|Ver detalles>`;
  }

  private formatSlackEvent(event: any, emoji: string, deepLink: string): string {
    const title = event.title || 'Sin título';
    const description = event.description || 'Sin descripción';
    const date = event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Fecha por confirmar';
    const location = event.location || 'Ubicación por confirmar';
    const organizerName = event.organizer?.name || 'Organizador';

    return `${emoji} *Nuevo Evento*\n\n` +
      `*${title}*\n` +
      `${description}\n\n` +
      `📍 Ubicación: ${location}\n` +
      `🕐 Fecha: ${date}\n` +
      `👤 Organiza: ${organizerName}\n\n` +
      `<${deepLink}|Ver detalles e inscribirse>`;
  }

  private formatSlackNeed(need: any, emoji: string, deepLink: string): string {
    const title = need.title || 'Sin título';
    const description = need.description || 'Sin descripción';
    const urgency = need.urgency || 'normal';
    const userName = need.user?.name || 'Usuario';

    const urgencyEmoji = urgency === 'high' ? '🔴' : urgency === 'medium' ? '🟡' : '🟢';

    return `${emoji} *Nueva Necesidad*\n\n` +
      `*${title}*\n` +
      `${description}\n\n` +
      `${urgencyEmoji} Urgencia: ${this.translateUrgency(urgency)}\n` +
      `👤 Solicitado por: ${userName}\n\n` +
      `<${deepLink}|Ver detalles y ayudar>`;
  }

  // Simple formatters (for WhatsApp, Signal)
  private formatSimpleOffer(offer: any, emoji: string, deepLink: string): string {
    const title = offer.title || 'Sin título';
    const description = offer.description || 'Sin descripción';
    const category = offer.category || 'General';
    const userName = offer.user?.name || 'Usuario';

    return `${emoji} Nueva Oferta\n\n` +
      `${title}\n` +
      `${description}\n\n` +
      `Categoría: ${category}\n` +
      `Publicado por: ${userName}\n\n` +
      `Ver detalles: ${deepLink}`;
  }

  private formatSimpleEvent(event: any, emoji: string, deepLink: string): string {
    const title = event.title || 'Sin título';
    const description = event.description || 'Sin descripción';
    const date = event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Fecha por confirmar';
    const location = event.location || 'Ubicación por confirmar';
    const organizerName = event.organizer?.name || 'Organizador';

    return `${emoji} Nuevo Evento\n\n` +
      `${title}\n` +
      `${description}\n\n` +
      `Ubicación: ${location}\n` +
      `Fecha: ${date}\n` +
      `Organiza: ${organizerName}\n\n` +
      `Ver detalles: ${deepLink}`;
  }

  private formatSimpleNeed(need: any, emoji: string, deepLink: string): string {
    const title = need.title || 'Sin título';
    const description = need.description || 'Sin descripción';
    const urgency = need.urgency || 'normal';
    const userName = need.user?.name || 'Usuario';

    return `${emoji} Nueva Necesidad\n\n` +
      `${title}\n` +
      `${description}\n\n` +
      `Urgencia: ${this.translateUrgency(urgency)}\n` +
      `Solicitado por: ${userName}\n\n` +
      `Ver detalles: ${deepLink}`;
  }

  // Helper methods
  private getMaxLength(platform: IntegrationPlatform): number {
    switch (platform) {
      case IntegrationPlatform.TELEGRAM:
        return 4096;
      case IntegrationPlatform.DISCORD:
        return 2000;
      case IntegrationPlatform.SLACK:
        return 3000;
      case IntegrationPlatform.WHATSAPP_BUSINESS:
        return 4096;
      case IntegrationPlatform.SIGNAL:
        return 2000;
      default:
        return 2000;
    }
  }

  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }

  private translateUrgency(urgency: string): string {
    const translations: Record<string, string> = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      normal: 'Normal',
    };
    return translations[urgency] || urgency;
  }
}
