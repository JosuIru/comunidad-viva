import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(`➡️  ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture response
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length');

      // Different log levels based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `⬅️  ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength || 0} bytes`
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `⬅️  ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength || 0} bytes`
        );
      } else {
        this.logger.log(
          `⬅️  ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength || 0} bytes`
        );
      }

      // Log slow requests (> 1000ms)
      if (duration > 1000) {
        this.logger.warn(
          `🐌 Slow request detected: ${method} ${originalUrl} took ${duration}ms`
        );
      }
    });

    next();
  }
}
