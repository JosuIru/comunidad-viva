import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

interface TelegramMessage {
  title?: string;
  description?: string;
  price?: number;
  emoji?: string;
  hashtags?: string[];
  customFields?: Record<string, any>;
}

interface SendMessageOptions {
  buttons?: TelegramBot.InlineKeyboardButton[][];
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  disableWebPagePreview?: boolean;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botCache: Map<string, TelegramBot> = new Map();

  /**
   * Validates if a Telegram bot token is valid
   * @param tokenToValidate - The bot token to validate
   * @returns Promise<boolean> - True if token is valid, false otherwise
   */
  async validateToken(tokenToValidate: string): Promise<boolean> {
    if (!tokenToValidate || typeof tokenToValidate !== 'string') {
      this.logger.warn('Invalid token format provided');
      return false;
    }

    try {
      // Create a temporary bot instance to test the token
      const temporaryBot = new TelegramBot(tokenToValidate, { polling: false });

      // Try to get bot info - this will fail if token is invalid
      const botInfo = await temporaryBot.getMe();

      this.logger.log(`Token validated successfully for bot: ${botInfo.username}`);
      return true;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Sends a message to a Telegram channel
   * @param botToken - The bot token
   * @param channelIdentifier - The channel ID (can be @username or numeric ID)
   * @param messageText - The message to send
   * @param additionalButtons - Optional inline keyboard buttons
   * @returns Promise<void>
   */
  async sendMessage(
    botToken: string,
    channelIdentifier: string,
    messageText: string,
    additionalButtons?: TelegramBot.InlineKeyboardButton[][],
  ): Promise<void> {
    if (!botToken || !channelIdentifier || !messageText) {
      throw new Error('Missing required parameters for sendMessage');
    }

    try {
      const telegramBot = this.getBotInstance(botToken);

      const messageOptions: TelegramBot.SendMessageOptions = {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      };

      // Add inline keyboard if buttons are provided
      if (additionalButtons && additionalButtons.length > 0) {
        messageOptions.reply_markup = {
          inline_keyboard: additionalButtons,
        };
      }

      await telegramBot.sendMessage(channelIdentifier, messageText, messageOptions);

      this.logger.log(`Message sent successfully to channel: ${channelIdentifier}`);
    } catch (error) {
      this.handleTelegramError(error, 'sendMessage');
    }
  }

  /**
   * Gets information about a chat or channel
   * @param botToken - The bot token
   * @param chatIdentifier - The chat/channel ID
   * @returns Promise<any> - Chat information
   */
  async getChatInfo(botToken: string, chatIdentifier: string): Promise<any> {
    if (!botToken || !chatIdentifier) {
      throw new Error('Missing required parameters for getChatInfo');
    }

    try {
      const telegramBot = this.getBotInstance(botToken);
      const chatInformation = await telegramBot.getChat(chatIdentifier);

      this.logger.log(`Retrieved chat info for: ${chatIdentifier}`);
      return chatInformation;
    } catch (error) {
      this.handleTelegramError(error, 'getChatInfo');
      throw error;
    }
  }

  /**
   * Formats content into a Telegram message with markdown
   * @param messageContent - Content to format
   * @param applicationDeepLink - Deep link to the app
   * @returns string - Formatted message
   */
  formatMessage(messageContent: TelegramMessage, applicationDeepLink: string): string {
    const {
      title,
      description,
      price,
      emoji = '📢',
      hashtags = [],
      customFields = {},
    } = messageContent;

    let formattedMessage = '';

    // Add title with emoji
    if (title) {
      formattedMessage += `${emoji} *${this.escapeMarkdown(title)}*\n\n`;
    }

    // Add description (truncate if too long - Telegram has 4096 char limit)
    if (description) {
      const maximumDescriptionLength = 800;
      let truncatedDescription = description;

      if (description.length > maximumDescriptionLength) {
        truncatedDescription = description.substring(0, maximumDescriptionLength) + '...';
      }

      formattedMessage += `${this.escapeMarkdown(truncatedDescription)}\n\n`;
    }

    // Add price if applicable
    if (price !== undefined && price !== null) {
      formattedMessage += `💰 *Precio:* €${price.toFixed(2)}\n\n`;
    }

    // Add custom fields
    if (Object.keys(customFields).length > 0) {
      for (const [fieldKey, fieldValue] of Object.entries(customFields)) {
        if (fieldValue) {
          formattedMessage += `*${this.escapeMarkdown(fieldKey)}:* ${this.escapeMarkdown(String(fieldValue))}\n`;
        }
      }
      formattedMessage += '\n';
    }

    // Add deep link
    if (applicationDeepLink) {
      formattedMessage += `[Ver en la app](${applicationDeepLink})\n\n`;
    }

    // Add hashtags
    if (hashtags.length > 0) {
      const formattedHashtags = hashtags
        .map(tag => `#${tag.replace(/[^a-zA-Z0-9_]/g, '')}`)
        .join(' ');
      formattedMessage += formattedHashtags;
    }

    return formattedMessage.trim();
  }

  /**
   * Creates inline keyboard buttons for a message
   * @param buttonText - Text to display on button
   * @param buttonUrl - URL to link to
   * @returns TelegramBot.InlineKeyboardButton[][]
   */
  createInlineButtons(
    buttonText: string,
    buttonUrl: string,
  ): TelegramBot.InlineKeyboardButton[][] {
    return [
      [
        {
          text: buttonText,
          url: buttonUrl,
        },
      ],
    ];
  }

  /**
   * Sends a formatted message with default "View in app" button
   * @param botToken - The bot token
   * @param channelIdentifier - The channel ID
   * @param messageContent - Content to format and send
   * @param applicationDeepLink - Deep link to the app
   * @returns Promise<void>
   */
  async sendFormattedMessage(
    botToken: string,
    channelIdentifier: string,
    messageContent: TelegramMessage,
    applicationDeepLink: string,
  ): Promise<void> {
    const formattedMessageText = this.formatMessage(messageContent, applicationDeepLink);
    const inlineButtons = this.createInlineButtons('Ver en la app / View in app', applicationDeepLink);

    await this.sendMessage(botToken, channelIdentifier, formattedMessageText, inlineButtons);
  }

  /**
   * Tests if bot has access to a channel
   * @param botToken - The bot token
   * @param channelIdentifier - The channel ID
   * @returns Promise<boolean>
   */
  async testChannelAccess(botToken: string, channelIdentifier: string): Promise<boolean> {
    try {
      const chatInformation = await this.getChatInfo(botToken, channelIdentifier);

      // Check if it's a channel
      if (chatInformation.type !== 'channel') {
        this.logger.warn(`Chat ${channelIdentifier} is not a channel, type: ${chatInformation.type}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`Channel access test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Gets or creates a bot instance from cache
   * @param botToken - The bot token
   * @returns TelegramBot instance
   */
  private getBotInstance(botToken: string): TelegramBot {
    if (!this.botCache.has(botToken)) {
      const newBotInstance = new TelegramBot(botToken, {
        polling: false,
        filepath: false, // Disable file download for security
      });
      this.botCache.set(botToken, newBotInstance);
      this.logger.log('Created new bot instance');
    }

    return this.botCache.get(botToken);
  }

  /**
   * Escapes special markdown characters for Telegram
   * @param textToEscape - Text to escape
   * @returns Escaped text
   */
  private escapeMarkdown(textToEscape: string): string {
    if (typeof textToEscape !== 'string') {
      return '';
    }

    // Escape special Markdown characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
    return textToEscape
      .replace(/\\/g, '\\\\')
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '\\>')
      .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/-/g, '\\-')
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!');
  }

  /**
   * Handles Telegram API errors with proper logging and error messages
   * @param error - The error object
   * @param operationName - Name of the operation that failed
   */
  private handleTelegramError(error: any, operationName: string): void {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.response?.statusCode;

    // Handle specific error cases
    if (errorCode === 401) {
      this.logger.error(`${operationName} failed: Invalid bot token (401 Unauthorized)`);
      throw new Error('Invalid Telegram bot token');
    } else if (errorCode === 400) {
      this.logger.error(`${operationName} failed: Bad request (400) - ${errorMessage}`);
      throw new Error(`Telegram API bad request: ${errorMessage}`);
    } else if (errorCode === 403) {
      this.logger.error(`${operationName} failed: Forbidden (403) - Bot may not have access to channel`);
      throw new Error('Bot does not have access to the specified channel');
    } else if (errorCode === 429) {
      this.logger.error(`${operationName} failed: Rate limit exceeded (429)`);
      throw new Error('Telegram API rate limit exceeded. Please try again later.');
    } else if (errorMessage.includes('ETELEGRAM')) {
      this.logger.error(`${operationName} failed: Telegram API error - ${errorMessage}`);
      throw new Error(`Telegram API error: ${errorMessage}`);
    } else {
      this.logger.error(`${operationName} failed: ${errorMessage}`);
      throw new Error(`Failed to ${operationName}: ${errorMessage}`);
    }
  }

  /**
   * Cleans up bot instances (call on module destroy)
   */
  async cleanup(): Promise<void> {
    for (const [token, bot] of this.botCache.entries()) {
      try {
        // Close any open connections
        await bot.close();
      } catch (error) {
        this.logger.warn(`Error closing bot instance: ${error.message}`);
      }
    }
    this.botCache.clear();
    this.logger.log('Telegram service cleaned up');
  }
}
