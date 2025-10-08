import { Transform } from 'class-transformer';

/**
 * Sanitizes string inputs to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove script tags and their content
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove on* event handlers
    value = value.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    value = value.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    value = value.replace(/javascript:/gi, '');

    // Remove data: protocol (can be used for XSS)
    value = value.replace(/data:text\/html/gi, '');

    // Trim whitespace
    value = value.trim();

    return value;
  });
}

/**
 * Sanitizes and limits string length
 */
export function SanitizeAndTrim(maxLength: number) {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    // Apply sanitization first
    value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    value = value.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    value = value.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    value = value.replace(/javascript:/gi, '');
    value = value.replace(/data:text\/html/gi, '');
    value = value.trim();

    // Limit length
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }

    return value;
  });
}

/**
 * Normalizes email addresses
 */
export function NormalizeEmail() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.toLowerCase().trim();
  });
}

/**
 * Sanitizes URLs
 */
export function SanitizeUrl() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    value = value.trim();

    // Only allow http(s) and mailto protocols
    if (value && !value.match(/^(https?:\/\/|mailto:)/i)) {
      return '';
    }

    // Remove javascript: and data: protocols
    value = value.replace(/javascript:/gi, '');
    value = value.replace(/data:/gi, '');

    return value;
  });
}
