import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './models/comments.entity';
import { Repository } from 'typeorm';
import { Comment } from './models/comments.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/models/user.interface';
import { BlogService } from 'src/blog/blog.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly blogService: BlogService,
  ) {}
  async create(blogId: number, user: User, comment: CreateCommentDto) {
    const blog = await this.blogService.findOne(blogId);
    if (!blog) {
      throw new NotFoundException('There is no blog with id ' + blogId);
    }
    const savedComment: Comment = {
      ...comment,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        profileImg: user.profileImg ? user.profileImg : undefined,
      },
      blog: { id: blogId },
    };
    console.log(savedComment);
    return this.commentRepository.save(savedComment);
  }

  findOne(id: number) {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async find(blogId: number) {
    const result = await this.commentRepository.find({
      where: { blog: { id: blogId } },
    });
    if (result.length === 0) {
      return { message: 'No comments found for this blog.' };
    }
    return result;
  }

  async delete(blogId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, blog: { id: blogId } },
      relations: ['blog'],
    });
    if (!comment) {
      throw new NotFoundException(
        'Comment not found or does not belong to the specified blog',
      );
    }
    const result = await this.commentRepository.remove(comment);
    if (!result) {
      throw new Error('error deleting comment');
    }
    return { status: 'sucess', message: 'Comment deleted succesfully' };
  }
}
