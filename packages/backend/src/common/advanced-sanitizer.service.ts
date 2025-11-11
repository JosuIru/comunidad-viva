import { Injectable } from '@nestjs/common';
import * as validator from 'validator';

/**
 * Advanced sanitization service for inputs
 * Uses validator.js for robust sanitization
 */
@Injectable()
export class AdvancedSanitizerService {
  
  /**
   * Sanitize general text input (names, titles, etc.)
   */
  sanitizeText(input: string, maxLength: number = 500): string {
    if (!input || typeof input !== 'string') return '';
    
    // Trim and limit length
    let sanitized = input.trim().substring(0, maxLength);
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Escape HTML to prevent XSS
    sanitized = validator.escape(sanitized);
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  }

  /**
   * Sanitize HTML content (descriptions, posts, etc.)
   * Allows safe HTML tags only
   */
  sanitizeHTML(input: string, maxLength: number = 10000): string {
    if (!input || typeof input !== 'string') return '';
    
    // Limit length first
    let sanitized = input.substring(0, maxLength);
    
    // Whitelist of safe tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'];
    
    // Remove dangerous tags
    sanitized = this.stripDangerousTags(sanitized);
    
    // Remove javascript: and data: protocols
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    return sanitized;
  }

  /**
   * Sanitize email
   */
  sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Normalize and validate
    const normalized = validator.normalizeEmail(input, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
    });
    
    if (!normalized || !validator.isEmail(normalized)) {
      throw new Error('Email inválido');
    }
    
    return normalized;
  }

  /**
   * Sanitize URL
   */
  sanitizeURL(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    const trimmed = input.trim();
    
    // Validate URL format
    if (!validator.isURL(trimmed, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: false,
    })) {
      throw new Error('URL inválida');
    }
    
    // Reject javascript: and data: protocols
    if (/^(javascript|data):/i.test(trimmed)) {
      throw new Error('Protocolo de URL no permitido');
    }
    
    return trimmed;
  }

  /**
   * Sanitize phone number
   */
  sanitizePhone(input: string, locale: string = 'es-ES'): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all non-numeric characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // Validate phone number format
    if (!validator.isMobilePhone(cleaned, locale as any)) {
      throw new Error('Número de teléfono inválido');
    }
    
    return cleaned;
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove path traversal attempts
    let sanitized = input.replace(/\.\./g, '');
    
    // Remove special characters except dash, underscore, dot
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Limit length
    sanitized = sanitized.substring(0, 255);
    
    // Ensure it doesn't start with dot (hidden file)
    if (sanitized.startsWith('.')) {
      sanitized = '_' + sanitized;
    }
    
    return sanitized;
  }

  /**
   * Sanitize JSON input
   */
  sanitizeJSON(input: any, maxDepth: number = 5): any {
    if (maxDepth <= 0) {
      return null;
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJSON(item, maxDepth - 1));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize key
        const sanitizedKey = this.sanitizeText(key, 100);
        // Recursively sanitize value
        sanitized[sanitizedKey] = this.sanitizeJSON(value, maxDepth - 1);
      }
      return sanitized;
    }
    
    if (typeof input === 'string') {
      return this.sanitizeText(input, 1000);
    }
    
    // Return primitive values as-is
    return input;
  }

  /**
   * Validate and sanitize numeric input
   */
  sanitizeNumber(input: any, min?: number, max?: number): number {
    const num = Number(input);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Número inválido');
    }
    
    if (min !== undefined && num < min) {
      throw new Error(`Número debe ser mayor o igual a ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new Error(`Número debe ser menor o igual a ${max}`);
    }
    
    return num;
  }

  /**
   * Validate and sanitize boolean
   */
  sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') return input;
    if (input === 'true' || input === '1' || input === 1) return true;
    if (input === 'false' || input === '0' || input === 0) return false;
    throw new Error('Valor booleano inválido');
  }

  /**
   * Strip dangerous HTML tags
   */
  private stripDangerousTags(html: string): string {
    const dangerousTags = [
      'script', 'iframe', 'object', 'embed', 'applet',
      'form', 'input', 'button', 'select', 'textarea',
      'link', 'style', 'meta', 'base'
    ];
    
    let sanitized = html;
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      // Also remove self-closing tags
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });
    
    return sanitized;
  }

  /**
   * Validate UUID format
   */
  validateUUID(input: string): boolean {
    return validator.isUUID(input, '4');
  }

  /**
   * Sanitize SQL-like inputs (additional layer, Prisma handles this)
   */
  sanitizeSQL(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove SQL keywords and special characters
    const dangerous = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 
      'UNION', 'EXEC', 'EXECUTE', '--', ';', '/*', '*/'
    ];
    
    let sanitized = input;
    dangerous.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized.trim();
  }
}
