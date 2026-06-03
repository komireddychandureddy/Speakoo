import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Use real client IP from X-Forwarded-For when running behind Nginx.
  // Without this, rate limiting can bucket all users under the proxy IP.
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(','),
    credentials: true,
  });
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  logger.log(`Speakoo API running on port ${port}`);
}

bootstrap();
