import { LoggerService } from './logger.service';

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates required environment variables for production
 */
export class EnvironmentValidator {
  private static logger = new LoggerService('EnvironmentValidator');

  private static requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
  ];

  private static recommendedVars = [
    'FRONTEND_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'S3_BUCKET',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'SENTRY_DSN',
  ];

  static validate(): EnvValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Check JWT secret strength in production
    if (process.env.NODE_ENV === 'production') {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret && jwtSecret.length < 32) {
        warnings.push('JWT_SECRET should be at least 32 characters in production');
      }
    }

    // Check recommended variables
    for (const varName of this.recommendedVars) {
      if (!process.env[varName]) {
        warnings.push(`Recommended environment variable not set: ${varName}`);
      }
    }

    // Check database URL format
    if (process.env.DATABASE_URL) {
      if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
        errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
      }
    }

    // Check SMTP configuration completeness
    const smtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const smtpConfigured = smtpVars.every(v => process.env[v]);
    const smtpPartial = smtpVars.some(v => process.env[v]);

    if (smtpPartial && !smtpConfigured) {
      warnings.push('SMTP partially configured - all SMTP variables should be set');
    }

    // Check S3 configuration completeness
    const s3Vars = ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_REGION'];
    const s3Configured = s3Vars.every(v => process.env[v]);
    const s3Partial = s3Vars.some(v => process.env[v]);

    if (s3Partial && !s3Configured) {
      warnings.push('S3 partially configured - all S3 variables should be set');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateAndLog(): void {
    const result = this.validate();

    if (!result.valid) {
      this.logger.error('Environment validation failed:');
      result.errors.forEach(error => this.logger.error(`  - ${error}`));

      if (process.env.NODE_ENV === 'production') {
        throw new Error('Required environment variables are missing. Check logs for details.');
      }
    }

    if (result.warnings.length > 0) {
      this.logger.warn('Environment validation warnings:');
      result.warnings.forEach(warning => this.logger.warn(`  - ${warning}`));
    }

    if (result.valid && result.warnings.length === 0) {
      this.logger.log('Environment validation passed');
    }
  }

  static getConfigSummary(): Record<string, boolean> {
    return {
      database: !!process.env.DATABASE_URL,
      jwt: !!process.env.JWT_SECRET,
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      s3: !!(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY),
      sentry: !!process.env.SENTRY_DSN,
      redis: !!process.env.REDIS_URL,
    };
  }
}
