import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from './winston-logger.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new WinstonLoggerService('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // Add request ID for tracking
    const requestId = randomUUID();
    (req as any).id = requestId;

    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;

    // Get IP address (handle both string and array)
    let ipAddress = ip;
    if (!ipAddress) {
      const forwardedFor = headers['x-forwarded-for'];
      const realIp = headers['x-real-ip'];
      ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || (Array.isArray(realIp) ? realIp[0] : realIp);
    }

    // Log incoming request
    this.logger.debug('Incoming request', {
      requestId,
      method,
      url: originalUrl,
      ip: ipAddress,
      userAgent: headers['user-agent'],
    });

    // Capture response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // Use the request logging method from Winston logger
      this.logger.request(req, res, duration);

      // Log slow requests (> 1 second)
      if (duration > 1000) {
        this.logger.warn('Slow request detected', {
          requestId,
          method,
          url: originalUrl,
          duration,
          statusCode,
        });
      }
    });

    // Capture errors
    res.on('error', (error: Error) => {
      const duration = Date.now() - startTime;
      this.logger.error('Request error', error.stack, {
        requestId,
        method,
        url: originalUrl,
        duration,
        error: error.message,
      });
    });

    next();
  }
}
