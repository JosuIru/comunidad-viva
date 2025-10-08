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

  // Security
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));

  // CORS - Allow multiple origins in production
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
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
