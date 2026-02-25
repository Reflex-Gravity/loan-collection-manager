import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  // swagger api docs builder
  const config = new DocumentBuilder()
    .setTitle('Loan Collection Management')
    .setDescription('Loan collection management with rules engine and pdf gen.')
    .setVersion('1.0')
    .addTag('cases', 'Manage cases')
    .addTag('customers')
    .addTag('loans')
    .addTag('health', 'basic health check api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
