import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UploadBlogsService } from './upload-blogs.service';
import { UserIsAuthorGuard } from '../guards/user-is-author.guard';
import { BlogService } from '../blog.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('BLOGS')
@ApiBearerAuth()
@Controller('blog')
export class UploadBlogsController {
  constructor(
    private uploadBlogService: UploadBlogsService,
    private blogService: BlogService,
  ) {}

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('upload/:id')
  async uploadFile(
    @Param('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: 'png|jpeg|jpg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const key = `blogsImages/${uuidv4()}-${file.originalname}`;

    if (!file) {
      throw new BadRequestException('Invalid file object');
    }
    const updatedResult = await this.blogService.updateOne(id, {
      headerImage: key,
    });
    if (!updatedResult) {
      throw new BadRequestException('Could not update the profile image');
    }
    return this.uploadBlogService.UploadToS3(file, key);
  }
}
