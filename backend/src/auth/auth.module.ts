import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from '../user/user.schema';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
        console.log('🔐 JwtModule using secret:', secret.substring(0, 10) + '...');
        return {
          secret,
          signOptions: { expiresIn: '5h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
