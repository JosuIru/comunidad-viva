import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
// import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { LoggerService } from './common/logger.service';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { EnvironmentValidator } from './common/env-validation';
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

  // Static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security Headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    } : false,
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
  }));

  // CORS - Allow multiple origins in production
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: true,  // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Compression
  // app.use(compression());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

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
