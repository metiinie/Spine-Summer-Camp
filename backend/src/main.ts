import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded receipt files statically at /uploads/*
  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/uploads',
  });

  // Security headers
  app.use(helmet());

  // CORS — only allow known origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://spine-summer-camp.vercel.app',
      'https://spine-summer-camp.onrender.com',
    ],
    credentials: true,
  });

  // Global input validation: strip unknown fields, reject invalid data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((e) => Object.values(e.constraints || {}).join(', '));
        return new BadRequestException(messages);
      },
    }),
  );

  // Global exception filter: sanitize error responses, log real errors internally
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();
