import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './models/comments.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogModule } from 'src/blog/blog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    AuthModule,
    UserModule,
    BlogModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
