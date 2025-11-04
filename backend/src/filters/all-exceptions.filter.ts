import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error for debugging (but not in production for sensitive data)
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${new Date().toISOString()}] ${request.method} ${request.url}`, exception);
    }

    // User-friendly error messages
    const userMessage = this.getUserFriendlyMessage(status, message);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: userMessage,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getUserFriendlyMessage(status: number, originalMessage: string): string {
    // Keep original message if it's already user-friendly
    if (status === 400 && originalMessage.includes('validation')) {
      return originalMessage;
    }
    
    if (status === 401) {
      if (originalMessage.includes('Invalid credentials')) {
        return 'Email hoặc mật khẩu không đúng';
      }
      if (originalMessage.includes('Unauthorized') || originalMessage.includes('token')) {
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      }
      return 'Bạn chưa đăng nhập hoặc phiên đã hết hạn';
    }
    
    if (status === 404) {
      return 'Không tìm thấy tài nguyên';
    }
    
    if (status === 409) {
      if (originalMessage.includes('Email already in use')) {
        return 'Email đã được sử dụng';
      }
      return 'Dữ liệu bị trùng lặp';
    }
    
    if (status >= 500) {
      return 'Lỗi server. Vui lòng thử lại sau';
    }
    
    return originalMessage;
  }
}
