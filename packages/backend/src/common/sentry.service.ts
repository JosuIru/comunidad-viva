import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
}

@Injectable()
export class SentryService {
  private readonly logger = new LoggerService('SentryService');
  private initialized = false;
  private sentry: any;

  constructor() {
    this.initializeSentry();
  }

  private async initializeSentry() {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
      this.logger.warn('SENTRY_DSN not configured - error tracking disabled');
      return;
    }

    try {
      // Dynamic import to avoid errors if @sentry/node is not installed
      // Use eval to prevent TypeScript from checking this import at compile time
      const sentryModule = await eval('import("@sentry/node")');
      this.sentry = sentryModule;

      const config: SentryConfig = {
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      };

      this.sentry.init(config);
      this.initialized = true;
      this.logger.log('Sentry error tracking initialized');
    } catch (error) {
      this.logger.warn(
        'Failed to initialize Sentry - install @sentry/node if you want error tracking',
      );
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.initialized || !this.sentry) {
      return;
    }

    try {
      if (context) {
        this.sentry.setContext('additional', context);
      }
      this.sentry.captureException(error);
    } catch (err) {
      this.logger.error('Failed to capture exception in Sentry', err);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.initialized || !this.sentry) {
      return;
    }

    try {
      this.sentry.captureMessage(message, level);
    } catch (err) {
      this.logger.error('Failed to capture message in Sentry', err);
    }
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.initialized || !this.sentry) {
      return;
    }

    try {
      this.sentry.setUser(user);
    } catch (err) {
      this.logger.error('Failed to set user in Sentry', err);
    }
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    if (!this.initialized || !this.sentry) {
      return;
    }

    try {
      this.sentry.addBreadcrumb({
        ...breadcrumb,
        timestamp: Date.now() / 1000,
      });
    } catch (err) {
      this.logger.error('Failed to add breadcrumb in Sentry', err);
    }
  }
}
