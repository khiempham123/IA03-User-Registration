import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({ email, password: hashed });
    try {
      const saved = await created.save();
      // return non-sensitive fields
      return { id: saved._id, email: saved.email, createdAt: saved.createdAt };
    } catch (err) {
      throw new InternalServerErrorException('Could not create user');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const token = jwt.sign({ sub: user._id, email: user.email }, secret, { expiresIn: '7d' });
    return { token, user: { id: user._id, email: user.email, createdAt: user.createdAt } };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { id: user._id, email: user.email, createdAt: user.createdAt };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const existing = await this.userModel.findOne({ email: updateUserDto.email });
      if (existing && existing._id.toString() !== userId) {
        throw new ConflictException('Email already in use');
      }
    }
    const updated = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return { id: updated._id, email: updated.email, createdAt: updated.createdAt };
  }
}
