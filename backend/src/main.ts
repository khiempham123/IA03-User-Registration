import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({ origin: true });
  
  // Global exception filter for consistent error responses
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global validation pipe with detailed error messages
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));
      return {
        message: 'Validation failed',
        errors: messages,
      };
    },
  }));
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
