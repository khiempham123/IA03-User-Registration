import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.substring(7);
    try {
      const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      const decoded = jwt.verify(token, secret) as any;
      return { userId: decoded.sub, email: decoded.email };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  },
);
