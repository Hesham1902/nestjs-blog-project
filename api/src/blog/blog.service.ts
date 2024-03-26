import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './models/blogs.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateBlogDto } from './dto';
import { User } from 'src/user/models/user.interface';
import slugify from 'slugify';
import { Blog } from './models/blog.interface';
import { ApiFeatures } from 'src/utils/api.features';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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

  // Corrupted one
  async findAllBlogs(queryObj) {
    const filters = { ...queryObj };
    const userId = queryObj.userId;
    if (queryObj.page) delete filters.page;
    if (queryObj.limit) delete filters.limit;
    if (queryObj.userId) delete filters.userId;
    let queryBuilder = this.blogRepository.createQueryBuilder('blog');
    // console.log(filters);
    // console.log(queryObj);
    console.log(
      (await queryBuilder.leftJoinAndSelect('blog.author', 'author').getOne())
        .author,
    );
    if (userId) {
      queryBuilder = queryBuilder.where('blog.authorId = :userId', {
        userId,
      });
    }

    const apiFeatures = await new ApiFeatures<Blog>(queryBuilder, queryObj)
      .filter(filters)
      .sort(queryObj.orderByColumn, queryObj.orderByDirection)
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

  async updateOne(id: number, updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogRepository.findOne({ where: { id } });
    Object.assign(blog, updateBlogDto);
    return this.blogRepository.save(blog);
  }

  async deleteOne(id: number): Promise<any> {
    try {
      const result: DeleteResult = await this.blogRepository.delete(id);
      console.log(result);
      if (result.affected !== 1 || !result.affected) {
        throw new Error('Could not delete the user from the database');
      }
      return {
        success: true,
        message: 'User deleted successfully',
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting the user',
        error,
        status: error.statusCode,
      };
    }
  }
}
