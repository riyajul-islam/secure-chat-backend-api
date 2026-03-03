import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get configuration
  const port = configService.get('PORT') || 3007;
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  
  // Global prefix
  app.setGlobalPrefix(apiPrefix);
  
  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SecureChat API')
    .setDescription('Secure Chat Application API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('admins', 'Admin management')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));
  
  // CORS configuration
  const allowedOrigins = configService.get('CORS_ALLOWED_ORIGINS')?.split(',') || ['*'];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', configService.get('ADMIN_API_KEY_HEADER')],
  });
  
  // Compression
  app.use(compression());
  
  // Body parsers
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Start server
  await app.listen(port);
  
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📚 Swagger docs: ${await app.getUrl()}/api-docs`);
  console.log(`📝 Environment: ${nodeEnv}`);
  console.log(`🔌 WebSocket will be available on port ${configService.get('WS_PORT')}`);
}

bootstrap();