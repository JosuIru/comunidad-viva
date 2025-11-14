// Backend main entry point - handles NestJS application bootstrap and configuration (v1.0.1)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { LoggerService } from './common/logger.service';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { EnvironmentValidator } from './common/env-validation';
// import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { webcrypto } from 'crypto';

// Polyfill for crypto - needed for @nestjs/schedule
if (!(global as any).crypto) {
  (global as any).crypto = webcrypto;
}

async function bootstrap() {
  const logger = new LoggerService('Bootstrap');

  // Validate environment variables
  try {
    EnvironmentValidator.validateAndLog();
  } catch (error) {
    logger.error('Environment validation failed', error);
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new LoggerService(),
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS - Enable first before other middleware
  const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
  const allowedOrigins = frontendUrl
    ? frontendUrl.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  };

  app.enableCors(corsOptions);

  // Static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security Headers with Helmet
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // Scripts: self only in production, allow unsafe-eval in dev for hot reload
        scriptSrc: isProduction
          ? ["'self'"]
          : ["'self'", "'unsafe-eval'"],

        // Styles: self + unsafe-inline for styled-components/tailwind
        styleSrc: ["'self'", "'unsafe-inline'"],

        // Images: self, data URIs, and trusted CDNs
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.amazonaws.com', // S3 buckets
          'https://*.cloudflare.com', // Cloudflare R2
          'https://*.googleapis.com', // Google services
          'https://ipfs.io', // IPFS gateway (for NFTs)
          'https://gateway.pinata.cloud', // Pinata IPFS
        ],

        // Fonts: self and trusted CDNs
        fontSrc: [
          "'self'",
          'data:',
          'https://fonts.gstatic.com',
        ],

        // Connect (AJAX/WebSocket): self and API endpoints
        connectSrc: [
          "'self'",
          'https://*.amazonaws.com',
          'wss://localhost:*', // WebSocket in development
          'ws://localhost:*',
          isProduction ? 'wss://*.truk.app' : 'wss://localhost:*',
          'https://api.polygon.technology',
          'https://polygon-rpc.com',
          'https://api.mainnet-beta.solana.com',
        ],

        // Media: self and trusted sources
        mediaSrc: [
          "'self'",
          'blob:',
          'data:',
          'https://*.amazonaws.com',
        ],

        // Objects: none (prevent Flash, Java, etc.)
        objectSrc: ["'none'"],

        // Frames: self only (for OAuth popups if needed)
        frameSrc: [
          "'self'",
          'https://www.google.com/recaptcha/',
          'https://recaptcha.google.com/recaptcha/',
        ],

        // Base URI: self only (prevent base tag injection)
        baseUri: ["'self'"],

        // Form actions: self only
        formAction: ["'self'"],

        // Frame ancestors: none (prevent clickjacking)
        frameAncestors: ["'none'"],

        // Manifest: self
        manifestSrc: ["'self'"],

        // Worker scripts: self and blob (for service workers)
        workerSrc: ["'self'", 'blob:'],

        // Upgrade insecure requests in production
        ...(isProduction ? { upgradeInsecureRequests: [] } : {}),
      },
      reportOnly: !isProduction, // Report-only mode in development
    },

    // HTTP Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },

    // X-Frame-Options: DENY
    frameguard: {
      action: 'deny',
    },

    // X-Content-Type-Options: nosniff
    noSniff: true,

    // X-XSS-Protection: 1; mode=block
    xssFilter: true,

    // Referrer-Policy: no-referrer-when-downgrade
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // X-Download-Options: noopen (IE8+)
    ieNoOpen: true,

    // X-DNS-Prefetch-Control: off
    dnsPrefetchControl: {
      allow: false,
    },

    // X-Permitted-Cross-Domain-Policies: none
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,
  }));

  // Compression
  app.use(compression());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Logging Interceptor - API request/response logging
  // Temporarily disabled due to RxJS version conflict
  // if (process.env.ENABLE_API_LOGGING === 'true' || process.env.NODE_ENV === 'development') {
  //   app.useGlobalInterceptors(new LoggingInterceptor());
  //   logger.log('API logging interceptor enabled');
  // }

  // Swagger - Only in development/staging
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Comunidad Viva API')
      .setDescription('API para red social de economía colaborativa local')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);

  // Log startup information
  const host = process.env.NODE_ENV === 'production' ? process.env.API_URL : `http://localhost:${port}`;
  logger.log(`Server running on ${host}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);

  if (process.env.NODE_ENV !== 'production') {
    logger.log(`API Docs available at http://localhost:${port}/api/docs`);
  }

  // Log configuration status
  const configStatus = EnvironmentValidator.getConfigSummary();
  logger.log('Configuration status:');
  Object.entries(configStatus).forEach(([key, value]) => {
    logger.log(`  - ${key}: ${value ? 'configured' : 'not configured'}`);
  });
}

bootstrap().catch((error) => {
  const logger = new LoggerService('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});
