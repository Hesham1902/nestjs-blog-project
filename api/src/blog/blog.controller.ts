import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ExtractUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/models/user.interface';
import { CreateBlogDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Blog } from './models/blog.interface';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserIsAuthorGuard } from './guards/user-is-author.guard';
import { DeleteResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('BLOGS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseInterceptors(FileInterceptor('headerImage'))
  @Post()
  createBlog(
    @ExtractUser() user: User,
    @Body() body: CreateBlogDto,
    @UploadedFile() headerImage: Express.Multer.File,
  ) {
    return this.blogService.create(user, body, headerImage);
  }

  @Get()
  findAllBlogs(@Query() queryObj) {
    if (!queryObj.userId) {
      return this.blogService.findAllBlogs(queryObj);
    }
    return this.blogService.findAllBlogs(queryObj);
  }

  @Get(':id')
  findBlogById(@Param('id') id: number): Promise<Blog> {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Put(':id')
  updateOne(@Param('id') id: number, @Body() body: UpdateBlogDto) {
    return this.blogService.updateOne(id, body);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: number): Promise<DeleteResult> {
    return this.blogService.deleteOne(id);
  }
}
