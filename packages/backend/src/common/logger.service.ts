import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(context?: string) {
    this.context = context || 'Application';
  }

  private formatMessage(level: LogLevel, message: string, trace?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    const traceStr = trace ? `\n${trace}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${traceStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return level === LogLevel.ERROR || level === LogLevel.WARN || level === LogLevel.INFO;
    }
    return true; // Log everything in development
  }

  log(message: string) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message));
    }
  }

  error(message: string, trace?: string) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, trace));
    }
  }

  warn(message: string) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message));
    }
  }

  debug(message: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  verbose(message: string) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message));
    }
  }
}
