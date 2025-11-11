import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Format } from 'logform';

export interface LogMetadata {
  userId?: string;
  requestId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class WinstonLoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor(context?: string) {
    this.context = context || 'Application';
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

    // Custom format for console
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}] [${context || this.context}] ${message}`;

        // Add metadata if present
        const metaString = Object.keys(metadata).length > 0
          ? `\n${JSON.stringify(metadata, null, 2)}`
          : '';

        return msg + metaString;
      }),
    );

    // JSON format for file logs
    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          consoleFormat,
        ),
      }),
    ];

    // File transports only in production or if explicitly enabled
    if (isProduction || process.env.ENABLE_FILE_LOGS === 'true') {
      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: fileFormat,
        }),
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: fileFormat,
        }),
      );

      // Audit logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxSize: '20m',
          maxFiles: '30d',
          format: fileFormat,
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      exitOnError: false,
    });
  }

  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return String(message);
  }

  log(message: any, metadata?: LogMetadata) {
    this.logger.info(this.formatMessage(message), {
      context: this.context,
      ...metadata,
    });
  }

  error(message: any, trace?: string, metadata?: LogMetadata) {
    this.logger.error(this.formatMessage(message), {
      context: this.context,
      stack: trace,
      ...metadata,
    });
  }

  warn(message: any, metadata?: LogMetadata) {
    this.logger.warn(this.formatMessage(message), {
      context: this.context,
      ...metadata,
    });
  }

  debug(message: any, metadata?: LogMetadata) {
    this.logger.debug(this.formatMessage(message), {
      context: this.context,
      ...metadata,
    });
  }

  verbose(message: any, metadata?: LogMetadata) {
    this.logger.verbose(this.formatMessage(message), {
      context: this.context,
      ...metadata,
    });
  }

  // Audit logging - structured logs for security events
  audit(event: string, userId: string, details: any) {
    this.logger.info('AUDIT', {
      context: 'Audit',
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  performance(operation: string, duration: number, metadata?: LogMetadata) {
    this.logger.info('PERFORMANCE', {
      context: 'Performance',
      operation,
      duration,
      ...metadata,
    });
  }

  // Request logging
  request(req: any, res: any, duration: number) {
    const { method, url, headers, ip } = req;
    const { statusCode } = res;

    const logData = {
      context: 'HTTP',
      method,
      url,
      statusCode,
      duration,
      ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
      userAgent: headers['user-agent'],
      userId: req.user?.userId,
      requestId: req.id,
    };

    if (statusCode >= 500) {
      this.logger.error('Request failed', logData);
    } else if (statusCode >= 400) {
      this.logger.warn('Client error', logData);
    } else {
      this.logger.info('Request completed', logData);
    }
  }

  // Security event logging
  security(event: string, details: any) {
    this.logger.warn('SECURITY_EVENT', {
      context: 'Security',
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Set context for this logger instance
  setContext(context: string) {
    this.context = context;
  }

  // Get the underlying Winston logger for advanced usage
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}
