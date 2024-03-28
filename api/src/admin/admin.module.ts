import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from 'src/user/user.module';
import { BlogModule } from 'src/blog/blog.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AdminController],
  imports: [UserModule, BlogModule, AuthModule],
})
export class AdminModule {}
