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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';

@ApiTags('Admin')
@ApiBearerAuth()
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
    console.log(id);
    return this.userService.deleteOne(id);
  }

  @hasRoles(UserRole.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
        },
      },
    },
    required: true,
  })
  @Patch('role/:id')
  async updateRoleOfUser(
    @Body('role') role: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; result: UpdateResult }> {
    return {
      message: 'Role updated successfully',
      result: await this.userService.updateRoleOfUser(role, id),
    };
  }
}
