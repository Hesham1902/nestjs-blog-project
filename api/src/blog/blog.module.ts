import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './models/blog.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserIsAuthorGuard } from './guards/user-is-author.guard';
import { UserModule } from 'src/user/user.module';
import { UploadBlogsController } from './upload/upload-blogs.controller';
import { UploadBlogsService } from './upload/upload-blogs.service';
import { LikesController } from './Likes/likes.controller';
import { LikesService } from './Likes/likes.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity]), AuthModule, UserModule],
  providers: [BlogService, UserIsAuthorGuard, UploadBlogsService, LikesService],
  controllers: [BlogController, UploadBlogsController, LikesController],
  exports: [BlogService],
})
export class BlogModule {}
