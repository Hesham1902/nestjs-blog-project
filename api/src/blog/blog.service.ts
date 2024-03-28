import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
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
import { RetrievalService } from 'src/user/retrieval/retrieval.service';
import { UploadBlogsService } from './upload/upload-blogs.service';
import { v4 as uuidv4 } from 'uuid';

@UseGuards(JwtAuthGuard)
@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    private readonly retrievalServiceS: RetrievalService,
    private readonly uploadBlogService: UploadBlogsService,
  ) {}

  generateSlug(title: string): string {
    return slugify(title);
  }

  async create(
    user: User,
    body: CreateBlogDto,
    headerImage?: Express.Multer.File,
  ): Promise<Blog> {
    body.author = user;
    body.slug = this.generateSlug(body.title);
    if (headerImage) {
      const key = `blogsImages/${uuidv4()}-${headerImage.originalname}`;
      await this.uploadBlogService.UploadToS3(headerImage, key);
      body.headerImage = key;
    }
    return this.blogRepository.save(body);
    // return 'test';
  }

  async findAllBlogs(queryObj) {
    const filters = { ...queryObj };
    const userId = +queryObj.userId;
    if (queryObj.page) delete filters.page;
    if (queryObj.limit) delete filters.limit;
    if (queryObj.userId) delete filters.userId;
    let queryBuilder = this.blogRepository.createQueryBuilder('blog');

    if (userId || userId === 0) {
      const userIsFound = await this.retrievalServiceS.findById(userId);
      if (!userIsFound) {
        throw new NotFoundException('User with this id not found: ' + userId);
      }
      queryBuilder = queryBuilder.where('blog.authorId = :userId', { userId });
    }
    queryBuilder = queryBuilder.leftJoinAndSelect('blog.author', 'author');
    const apiFeatures = await new ApiFeatures<Blog>(queryBuilder, queryObj)
      .filter(filters)
      .sort(queryObj.orderByColumn, queryObj.orderByDirection)
      .pagination();

    const blogs = await apiFeatures.query.getMany();
    if (blogs.length === 0) {
      return { response: 'This user has no blogs' };
    }
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
