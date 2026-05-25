import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './modules/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Registrar o filtro global de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("queue API")
    .setDescription("Documentation for queue API")
    .setVersion("1.0")
    .addTag("queue")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api", app, document)

  app.use(cookieParser())
  app.enableCors({
    origin: "*",
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

