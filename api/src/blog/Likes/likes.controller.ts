import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ExtractUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/models/user.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('/:blogId')
  patchLikes(@ExtractUser() user: User, @Param('blogId') blogId: number) {
    return this.likesService.likeBlog(blogId, user);
  }
}
