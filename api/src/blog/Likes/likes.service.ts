import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../models/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  async likeBlog(blogId: number, user) {
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      relations: ['usersWhoLiked'],
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const userLiked = await blog.usersWhoLiked.find(
      (arrUser) => arrUser.id === user.id,
    );
    if (!userLiked) {
      blog.likes++;
      blog.usersWhoLiked.push(user);
    } else {
      blog.likes--;
      const index = blog.usersWhoLiked.findIndex(
        (arrUser) => arrUser.id === user.id,
      );
      blog.usersWhoLiked.splice(index, 1);
    }
    return this.blogRepository.save(blog);
  }
}
