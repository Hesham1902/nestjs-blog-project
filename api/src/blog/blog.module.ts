import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './models/blogs.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BlogController } from './controller/blog.controller';
import { BlogService } from './service/blog.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity]), AuthModule, AuthModule],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}
