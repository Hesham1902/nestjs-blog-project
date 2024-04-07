import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { RetrievalService } from './retrieval/retrieval.service';
import { RetrievalController } from './retrieval/retrieval.controller';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule, MailerModule],
  controllers: [UserController, RetrievalController, UploadController],
  providers: [UserService, RetrievalService, UploadService],
  exports: [UserService, RetrievalService],
})
export class UserModule {}
