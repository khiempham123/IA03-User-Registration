import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-change-in-production',
    });
    
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.logger.log(`🔐 JWT Strategy initialized with secret: ${secret.substring(0, 10)}...`);
  }

  async validate(payload: any) {
    this.logger.log(`🔍 Validating JWT payload:`, {
      sub: payload.sub,
      email: payload.email,
      exp: new Date(payload.exp * 1000).toISOString(),
      iat: new Date(payload.iat * 1000).toISOString()
    });
    
    const user = await this.authService.validateUser(payload);
    
    if (!user) {
      this.logger.warn(`❌ User not found for payload sub: ${payload.sub}`);
      return null;
    }
    
    this.logger.log(`✅ JWT validation successful for user: ${user.email}`);
    return user;
  }
}
