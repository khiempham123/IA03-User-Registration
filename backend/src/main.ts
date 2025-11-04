import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  
  // Debug middleware to log all requests
  app.use((req, res, next) => {
    if (req.path.includes('/user/profile')) {
      console.log('🔍 Profile request:', {
        method: req.method,
        path: req.path,
        hasAuth: !!req.headers.authorization,
        authPreview: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'none'
      });
    }
    next();
  });
  
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
