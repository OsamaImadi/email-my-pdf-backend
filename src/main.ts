import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: 'https://rococo-kataifi-947ff0.netlify.app',
    credentials: true,
  })
  const port = process.env.PORT || 3001
  await app.listen(port);
}
bootstrap();