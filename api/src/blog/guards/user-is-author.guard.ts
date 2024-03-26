import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/user/models/user.interface';
import { BlogService } from '../blog.service';
import { RetrievalService } from 'src/user/retrieval/retrieval.service';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(
    private retrievalService: RetrievalService,
    private blogService: BlogService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const loggedUser: User = request.user;
    const user = await this.retrievalService.findById(loggedUser.id);
    if (!user) {
      throw new NotFoundException('No user found with this id');
    }
    const blogId = Number(request.params.id);
    const blog = await this.blogService.findOne(blogId);
    if (!blog) {
      throw new NotFoundException('No blog found with this id');
    }
    if (blog.author.id !== user.id) {
      return false;
    }
    return true;
  }
}
