/**
 * Production-safe logger utility
 * - Logs to console only in development
 * - Can be extended to send logs to external service (Sentry, LogRocket, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    // Always log errors
    if (level === 'error') {
      console.error(`[${level.toUpperCase()}]`, message, context || '');
      // In production, you could send to error tracking service
      // Example: Sentry.captureException(new Error(message), { extra: context });
      return;
    }

    // Log warnings in development and production
    if (level === 'warn') {
      console.warn(`[${level.toUpperCase()}]`, message, context || '');
      return;
    }

    // Only log debug and info in development
    if (this.isDevelopment) {
      const logMethod = level === 'debug' ? console.log : console[level];
      logMethod(`[${level.toUpperCase()}]`, message, context || '');
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // Utility for measuring performance
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group related logs
  group(label: string) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
