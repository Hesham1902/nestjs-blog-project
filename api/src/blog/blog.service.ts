import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './models/blog.entity';
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
    private readonly retrievalService: RetrievalService,
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
    // Verify that the user exists
    const existingUser = await this.retrievalService.findById(user.id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    // Assign the user as the author of the blog
    body.author = existingUser;

    // Generate slug for the blog title
    body.slug = this.generateSlug(body.title);

    if (headerImage) {
      // Upload header image to S3 and set the key in the blog body
      const key = `blogsImages/${uuidv4()}-${headerImage.originalname}`;
      await this.uploadBlogService.UploadToS3(headerImage, key);
      body.headerImage = key;
    }

    try {
      const createdBlog = await this.blogRepository.save(body);
      return createdBlog;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create blog entry');
    }
  }

  async findAllBlogs(queryObj) {
    const filters = { ...queryObj };
    const userId = +queryObj.userId;
    if (queryObj.page) delete filters.page;
    if (queryObj.limit) delete filters.limit;
    if (queryObj.userId) delete filters.userId;
    let queryBuilder = this.blogRepository.createQueryBuilder('blog');

    if (userId || userId === 0) {
      const userIsFound = await this.retrievalService.findById(userId);
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
        throw new Error('Could not delete the blog from the database');
      }
      return {
        success: true,
        message: 'Blog deleted successfully',
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting the blog from DB',
        error,
        status: error.statusCode,
      };
    }
  }
}
