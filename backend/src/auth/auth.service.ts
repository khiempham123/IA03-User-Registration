import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register new user
   */
  async register(email: string, password: string, fullName: string) {
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      fullName,
      nights: 0,
    });

    await user.save();
    return { id: user._id, email: user.email, fullName: user.fullName };
  }

  /**
   * Login user and return access + refresh tokens
   */
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        nights: user.nights,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token format (basic JWT structure check)
      const payload = this.jwtService.decode(refreshToken) as any;
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken || !user.refreshTokenExpiry) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token expired
      if (new Date() > user.refreshTokenExpiry) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Verify refresh token matches stored hash
      const valid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!valid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new token pair
      const tokens = await this.generateTokens(user);

      // Update refresh token in database (token rotation)
      user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user by clearing refresh token
   */
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
      refreshTokenExpiry: null,
    });
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      fullName: user.fullName,
      nights: user.nights,
    };

    console.log('🔑 Generating access token with payload:', payload);

    const accessToken = this.jwtService.sign(payload, { expiresIn: '5h' }); // 5 hours for testing

    console.log('✅ Access token generated:', {
      preview: accessToken.substring(0, 30) + '...',
      length: accessToken.length
    });

    // Refresh token with longer expiry (7 days)
    const refreshToken = this.jwtService.sign(
      { sub: user._id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  /**
   * Validate user from JWT payload (used by JwtStrategy)
   */
  async validateUser(payload: any) {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      userId: user._id,
      email: user.email,
      fullName: user.fullName,
      nights: user.nights,
    };
  }
}
