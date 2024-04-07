import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  exports: [MailerService],
  providers: [MailerService, ConfigModule],
})
export class MailerModule {}
