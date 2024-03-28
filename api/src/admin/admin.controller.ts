import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BlogService } from 'src/blog/blog.service';
import { UserService } from 'src/user/user.service';
import { RolesGuard } from './guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/models/user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private userService: UserService,
    private blogService: BlogService,
  ) {}

  @hasRoles(UserRole.ADMIN)
  @Delete('blog/:id')
  deleteBlog(@Param('id') id: number): Promise<any> {
    return this.blogService.deleteOne(id);
  }

  @Delete('user/:id')
  deleteUser(@Param('id') id: number): Promise<any> {
    return this.userService.deleteOne(id);
  }

  @hasRoles(UserRole.ADMIN)
  @Patch('role/:id')
  updateRoleOfUser(
    @Body('role') role: any,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<any> {
    return this.userService.updateRoleOfUser(role, id);
  }
}
