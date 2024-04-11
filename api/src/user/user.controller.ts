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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserValidateGuard } from 'src/user/guards/user-vaidate.guard';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @ApiTags('Authentication')
  @Post('/register')
  create(@Body() user: RegisterDto): Promise<object> {
    return this.userService.create(user);
  }

  @ApiTags('USERS')
  @Get('/verify-email/:verifyCode')
  verifyEmail(@Param('verifyCode') code: string) {
    return this.userService.verifyEmail(code);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
      },
    },
  })
  @ApiTags('Authentication')
  @Patch('/forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.userService.forgetPassword(email);
  }

  @ApiTags('Authentication')
  @Patch('/reset-password/:code')
  verifyResetPassword(@Param('code') code: string) {
    return this.userService.verifyResetPassword(code);
  }

  @ApiTags('Authentication')
  @Patch('change-password')
  changePassword(@Body() body: ChangePasswordDto) {
    return this.userService.changePassword(body);
  }

  @UseGuards(JwtAuthGuard, UserValidateGuard)
  @ApiTags('USERS')
  @Put(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: UpdateDto,
  ): Promise<any> {
    return this.userService.updateOne(id, user);
  }
}
