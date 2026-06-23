import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3001);
  const prefix = configService.get<string>('API_PREFIX', '/api/v1');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS', '*').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('AHOUZI API')
    .setDescription('Villas Ahouzi ERP Suite - Documentation API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Authentification', 'Gestion des utilisateurs et sessions')
    .addTag('Propriétés', 'Gestion des propriétés hôtelières')
    .addTag('Réservations', 'Gestion des réservations')
    .addTag('Clients', 'Gestion de la clientèle')
    .addTag('Housekeeping', 'Gestion du ménage')
    .addTag('Maintenance', 'Gestion de la maintenance')
    .addTag('Finance', 'Facturation et comptabilité')
    .addTag('Dépenses', 'Gestion des dépenses')
    .addTag('RH', 'Ressources humaines')
    .addTag('Inventaire', 'Gestion des stocks')
    .addTag('Restaurant', 'Gestion du restaurant')
    .addTag('Bar', 'Gestion du bar')
    .addTag('Boutique', 'Gestion de la boutique')
    .addTag('Rapports', 'Rapports et tableaux de bord')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  console.log(`🚀 AHOUZI API démarrée sur le port ${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
