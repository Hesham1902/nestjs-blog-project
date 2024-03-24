import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../models/blogs.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from '../dto';
import { User } from 'src/user/models/user.interface';
import slugify from 'slugify';
import { Blog } from '../models/blog.interface';
import { ApiFeatures } from 'src/utils/api.features';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
  ) {}

  generateSlug(title: string): string {
    return slugify(title);
  }
  create(user: User, body: CreateBlogDto): Promise<Blog> {
    body.author = user;
    body.slug = this.generateSlug(body.title);
    console.log(body);
    return this.blogRepository.save(body);
  }

  async findAllBlogs(
    queryObj = {},
    orderByColumn,
    orderByDirection,
    filters,
    userId: number = null,
  ) {
    let queryBuilder = this.blogRepository.createQueryBuilder('blog');
    console.log(filters);
    console.log(queryObj);
    if (userId) {
      queryBuilder = queryBuilder.where('blog.authorId = :userId', { userId });
    }

    const apiFeatures = await new ApiFeatures<Blog>(queryBuilder, queryObj)
      .filter(filters)
      .sort(orderByColumn, orderByDirection)
      .pagination();

    const blogs = await apiFeatures.query.getMany();
    return { blogs, paginationResult: apiFeatures.paginationObj };
  }

  findOne(id: number): Promise<Blog> {
    return this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }
}
