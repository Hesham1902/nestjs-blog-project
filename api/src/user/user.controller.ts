import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.interface';
import { RegisterDto } from '../user/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserValidateGuard } from 'src/user/guards/user-vaidate.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  create(@Body() user: RegisterDto): Promise<object> {
    return this.userService.create(user);
  }

  @Get('/verify-email/:verifyCode')
  verifyEmail(@Param('verifyCode') code: string) {
    return this.userService.verifyEmail(code);
  }

  @Patch('/forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  @Patch('/reset-password/:code')
  verifyResetPassword(@Param('code') code: string) {
    return this.userService.verifyResetPassword(code);
  }

  @Patch('change-password')
  changePassword(
    @Body() body: { email: string; password: string; confirmPassword: string },
  ) {
    return this.userService.changePassword(body);
  }

  @UseGuards(JwtAuthGuard, UserValidateGuard)
  @Put(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: User,
  ): Promise<any> {
    return this.userService.updateOne(id, user);
  }
}
