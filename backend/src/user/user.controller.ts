import { Body, Controller, Post, Get, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return { success: true, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);
    return { success: true, ...result };
  }

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: any) {
    const user = await this.userService.getProfile(currentUser.userId);
    return { success: true, user };
  }

  @Put('profile')
  async updateProfile(@CurrentUser() currentUser: any, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.updateProfile(currentUser.userId, updateUserDto);
    return { success: true, user };
  }
}
