import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

/**
 * Interface for message content structure
 */
interface MessageContent {
  title?: string;
  description?: string;
  price?: number;
  type?: string;
  emoji?: string;
  details?: Record<string, any>;
}

/**
 * Interface for Twilio error responses
 */
interface TwilioError extends Error {
  status?: number;
  code?: number;
  moreInfo?: string;
}

/**
 * WhatsApp Business API Service using Twilio
 *
 * This service provides WhatsApp messaging capabilities through Twilio's API.
 * It handles credential validation, message sending, and formatting.
 *
 * Configuration format: botToken = "accountSid:authToken:fromNumber"
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  // Rate limiting tracking (simple in-memory implementation)
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly maxMessagesPerMinute = 60; // Twilio's default rate limit
  private readonly rateLimitWindow = 60 * 1000; // 1 minute in milliseconds

  /**
   * Validates Twilio credentials by attempting to fetch account information
   *
   * @param accountSid - Twilio account SID
   * @param authToken - Twilio authentication token
   * @returns Promise<boolean> - true if credentials are valid, false otherwise
   */
  async validateCredentials(
    accountSid: string,
    authToken: string,
  ): Promise<boolean> {
    try {
      const client = new Twilio(accountSid, authToken);

      // Attempt to fetch account information to validate credentials
      await client.api.v2010.accounts(accountSid).fetch();

      this.logger.log('Twilio credentials validated successfully');
      return true;
    } catch (error) {
      const twilioError = error as TwilioError;

      if (twilioError.status === 401 || twilioError.code === 20003) {
        this.logger.warn('Invalid Twilio credentials provided');
      } else {
        this.logger.error('Error validating Twilio credentials', {
          status: twilioError.status,
          code: twilioError.code,
          message: twilioError.message,
        });
      }

      return false;
    }
  }

  /**
   * Sends a WhatsApp message through Twilio
   *
   * @param accountSid - Twilio account SID
   * @param authToken - Twilio authentication token
   * @param from - Sender's WhatsApp number (format: whatsapp:+1234567890)
   * @param to - Recipient's WhatsApp number (format: whatsapp:+1234567890)
   * @param message - Message content to send
   * @returns Promise<void>
   * @throws Error if message sending fails or rate limit is exceeded
   */
  async sendMessage(
    accountSid: string,
    authToken: string,
    from: string,
    to: string,
    message: string,
  ): Promise<void> {
    try {
      // Check rate limits
      this.checkRateLimit(accountSid);

      // Ensure phone numbers have WhatsApp prefix
      const formattedFrom = this.formatWhatsAppNumber(from);
      const formattedTo = this.formatWhatsAppNumber(to);

      // Create Twilio client
      const client = new Twilio(accountSid, authToken);

      // Send message
      const messageResponse = await client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo,
      });

      // Update rate limit counter
      this.updateRateLimit(accountSid);

      this.logger.log(
        `WhatsApp message sent successfully. SID: ${messageResponse.sid}, To: ${to}`,
      );
    } catch (error) {
      const twilioError = error as TwilioError;

      // Handle specific Twilio errors
      if (twilioError.code === 20429 || twilioError.status === 429) {
        this.logger.error('Twilio rate limit exceeded', {
          accountSid,
          code: twilioError.code,
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (twilioError.code === 21211) {
        this.logger.error('Invalid WhatsApp number format', {
          from,
          to,
          code: twilioError.code,
        });
        throw new Error('Invalid phone number format for WhatsApp.');
      } else if (twilioError.code === 21608) {
        this.logger.error('WhatsApp number not registered', {
          to,
          code: twilioError.code,
        });
        throw new Error('Recipient phone number is not a WhatsApp number.');
      } else if (twilioError.status === 401) {
        this.logger.error('Invalid Twilio credentials', {
          code: twilioError.code,
        });
        throw new Error('Authentication failed. Invalid credentials.');
      } else {
        this.logger.error('Failed to send WhatsApp message', {
          status: twilioError.status,
          code: twilioError.code,
          message: twilioError.message,
          moreInfo: twilioError.moreInfo,
        });
        throw new Error(
          `Failed to send WhatsApp message: ${twilioError.message}`,
        );
      }
    }
  }

  /**
   * Formats content into a WhatsApp-friendly message
   * WhatsApp doesn't support full markdown, so we use simple text formatting
   *
   * @param content - Content object to format
   * @param deepLink - Deep link URL to include in the message
   * @returns string - Formatted message ready for WhatsApp
   */
  formatMessage(content: any, deepLink: string): string {
    const messageContent = content as MessageContent;

    // Build message parts
    const messageParts: string[] = [];

    // Title with emoji
    if (messageContent.title) {
      const emoji = messageContent.emoji || this.getDefaultEmoji(messageContent.type);
      messageParts.push(`${emoji} *${messageContent.title}*`);
      messageParts.push(''); // Empty line
    }

    // Description
    if (messageContent.description) {
      messageParts.push(messageContent.description);
      messageParts.push(''); // Empty line
    }

    // Price (if applicable)
    if (messageContent.price !== undefined && messageContent.price !== null) {
      const formattedPrice = this.formatPrice(messageContent.price);
      messageParts.push(`💰 Precio: ${formattedPrice}`);
    }

    // Additional details
    if (messageContent.details) {
      const detailsText = this.formatDetails(messageContent.details);
      if (detailsText) {
        messageParts.push(''); // Empty line
        messageParts.push(detailsText);
      }
    }

    // Deep link
    if (deepLink) {
      messageParts.push(''); // Empty line
      messageParts.push(`Ver más: ${deepLink}`);
    }

    // Footer
    messageParts.push(''); // Empty line
    messageParts.push('---');
    messageParts.push('Truk - Economía Colaborativa Local');

    return messageParts.join('\n');
  }

  /**
   * Ensures phone number has WhatsApp prefix
   * @param phoneNumber - Phone number to format
   * @returns Formatted phone number with whatsapp: prefix
   */
  private formatWhatsAppNumber(phoneNumber: string): string {
    if (phoneNumber.startsWith('whatsapp:')) {
      return phoneNumber;
    }
    return `whatsapp:${phoneNumber}`;
  }

  /**
   * Gets default emoji based on content type
   * @param type - Content type
   * @returns Appropriate emoji for the type
   */
  private getDefaultEmoji(type?: string): string {
    const emojiMap: Record<string, string> = {
      event: '🎉',
      offer: '🎁',
      service: '🛠️',
      housing: '🏠',
      groupbuy: '🛒',
      timebank: '⏰',
      'mutual-aid': '🤝',
      community: '🏘️',
      achievement: '🏆',
      notification: '📢',
    };

    return emojiMap[type || ''] || '💬';
  }

  /**
   * Formats price value
   * @param price - Price value to format
   * @returns Formatted price string
   */
  private formatPrice(price: number): string {
    if (price === 0) {
      return 'Gratis';
    }

    // Check if it's in euros or credits
    if (price >= 100) {
      return `€${(price / 100).toFixed(2)}`;
    }

    return `${price} créditos`;
  }

  /**
   * Formats additional details object into readable text
   * @param details - Details object
   * @returns Formatted details string
   */
  private formatDetails(details: Record<string, any>): string {
    const detailLines: string[] = [];

    for (const [key, value] of Object.entries(details)) {
      if (value !== null && value !== undefined && value !== '') {
        const formattedKey = this.formatDetailKey(key);
        const formattedValue = this.formatDetailValue(value);
        detailLines.push(`• ${formattedKey}: ${formattedValue}`);
      }
    }

    return detailLines.join('\n');
  }

  /**
   * Formats detail key to human-readable format
   * @param key - Detail key
   * @returns Formatted key
   */
  private formatDetailKey(key: string): string {
    const keyMap: Record<string, string> = {
      location: 'Ubicación',
      date: 'Fecha',
      time: 'Hora',
      duration: 'Duración',
      participants: 'Participantes',
      organizer: 'Organizador',
      category: 'Categoría',
      status: 'Estado',
    };

    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Formats detail value based on type
   * @param value - Detail value
   * @returns Formatted value
   */
  private formatDetailValue(value: any): string {
    if (value instanceof Date) {
      return value.toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  }

  /**
   * Checks if rate limit has been exceeded for an account
   * @param accountSid - Twilio account SID
   * @throws Error if rate limit is exceeded
   */
  private checkRateLimit(accountSid: string): void {
    const now = Date.now();
    const rateLimitData = this.rateLimitMap.get(accountSid);

    if (!rateLimitData) {
      return; // No previous requests
    }

    // Reset counter if window has passed
    if (now > rateLimitData.resetTime) {
      this.rateLimitMap.delete(accountSid);
      return;
    }

    // Check if limit exceeded
    if (rateLimitData.count >= this.maxMessagesPerMinute) {
      const waitTime = Math.ceil((rateLimitData.resetTime - now) / 1000);
      throw new Error(
        `Rate limit exceeded. Please wait ${waitTime} seconds before sending more messages.`,
      );
    }
  }

  /**
   * Updates rate limit counter for an account
   * @param accountSid - Twilio account SID
   */
  private updateRateLimit(accountSid: string): void {
    const now = Date.now();
    const rateLimitData = this.rateLimitMap.get(accountSid);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      // Start new window
      this.rateLimitMap.set(accountSid, {
        count: 1,
        resetTime: now + this.rateLimitWindow,
      });
    } else {
      // Increment counter
      rateLimitData.count++;
      this.rateLimitMap.set(accountSid, rateLimitData);
    }
  }

  /**
   * Parses bot token from configuration format
   * Expected format: "accountSid:authToken:fromNumber"
   *
   * @param botToken - Configuration token string
   * @returns Object containing accountSid, authToken, and fromNumber
   * @throws Error if token format is invalid
   */
  parseBotToken(botToken: string): {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  } {
    const parts = botToken.split(':');

    if (parts.length < 3) {
      throw new Error(
        'Invalid bot token format. Expected: "accountSid:authToken:fromNumber"',
      );
    }

    // Handle case where auth token might contain colons
    const accountSid = parts[0];
    const fromNumber = parts[parts.length - 1];
    const authToken = parts.slice(1, -1).join(':');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Bot token components cannot be empty');
    }

    return {
      accountSid,
      authToken,
      fromNumber,
    };
  }

  /**
   * Cleans up rate limit map (removes expired entries)
   * This should be called periodically to prevent memory leaks
   */
  cleanupRateLimitMap(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, data] of this.rateLimitMap.entries()) {
      if (now > data.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.rateLimitMap.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }
}
