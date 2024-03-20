import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.interface';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  create(@Body() user: RegisterDto): Promise<RegisterDto> {
    return this.userService.create(user);
  }

  @Post('/login')
  login(@Body() user: LoginDto): Promise<object> {
    return this.userService.login(user);
  }

  @Get(':id')
  findOne(@Param() params): Promise<User> {
    return this.userService.findOne(params.id);
  }

  @Get()
  findAll(@Query() query: any) {
    // eslint-disable-next-line prefer-const
    let { page = 1, limit = 10, username, ...rest } = query;
    limit = limit > 100 ? 100 : limit;
    const options = { page: +page, limit: +limit };

    if (username || Object.keys(rest).length > 0) {
      return this.userService.paginateFilter(options, { username, ...rest });
    } else {
      return this.userService.paginate({
        page: options.page,
        limit: options.limit,
        route: 'http://localhost:3000/user',
      });
    }
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('role/:id')
  updateRoleOfUser(
    @Body('role') role: any,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<any> {
    return this.userService.updateRoleOfUser(role, id);
  }
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.userService.deleteOne(id);
  }

  @Put(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: User,
  ): Promise<any> {
    return this.userService.updateOne(id, user);
  }
}
