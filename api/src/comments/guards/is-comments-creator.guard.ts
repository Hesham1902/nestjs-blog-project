import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RetrievalService } from 'src/user/retrieval/retrieval.service';
import { CommentsService } from '../comments.service';
import { User } from 'src/user/models/user.interface';

@Injectable()
export class UserIsCommentCreatorGuard implements CanActivate {
  constructor(
    private retrievalService: RetrievalService,
    private commentService: CommentsService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const loggedUser: User = request.user;
    const user = await this.retrievalService.findById(loggedUser.id);
    if (!user) {
      throw new NotFoundException('You must be logged in');
    }
    const commentId = Number(request.params.commentId);
    const comment = await this.commentService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('No comment found with this id');
    }
    if (comment.user.id !== user.id) {
      return false;
    }
    return true;
  }
}
