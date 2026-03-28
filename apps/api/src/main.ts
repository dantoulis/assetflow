import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { getFrontendUrl, validateApiRuntimeEnv } from './common/utils';

async function bootstrap(): Promise<void> {
  validateApiRuntimeEnv();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: getFrontendUrl() ?? 'http://localhost:3000',
    credentials: true,
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
