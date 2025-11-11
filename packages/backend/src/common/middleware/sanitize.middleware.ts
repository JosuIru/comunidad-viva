import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Global XSS Sanitization Middleware
 * Sanitizes all incoming request data to prevent XSS attacks
 */
@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize route params
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed by default
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style'],
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }
}
