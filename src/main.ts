import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan CORS untuk antarmuka frontend
  app.enableCors();

  // Aktifkan Global Validation Pipe untuk DTO di layer interface-adapters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Application FastStock NestJS running on port: ${port}`);
}
bootstrap();
