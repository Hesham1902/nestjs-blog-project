import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ExtractUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/models/user.interface';
import { UserIsCommentCreatorGuard } from './guards/is-comments-creator.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':blogId/comment')
  createComment(
    @Param('blogId') blogId: number,
    @ExtractUser() user: User,
    @Body()
    comment: CreateCommentDto,
  ) {
    return this.commentsService.create(blogId, user, comment);
  }
  @Get('comments/:blogId')
  findAllComments(@Param('blogId') blogId: number) {
    return this.commentsService.find(blogId);
  }

  @UseGuards(UserIsCommentCreatorGuard)
  @Delete(':blogId/:commentId')
  deleteComment(
    @Param('blogId') blogId: number,
    @Param('commentId') commentId: number,
  ) {
    return this.commentsService.delete(blogId, commentId);
  }
}
