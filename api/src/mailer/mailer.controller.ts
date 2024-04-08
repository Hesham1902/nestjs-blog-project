import { Controller, Post, UseGuards } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  // @UseGuards()
  // @Post('/send-mail')
  // async sendMail() {
  //   const dto: SendMailDto = {
  //     recipient: [{ name: 'John Doe', address: 'john.doe@gmail.com' }],
  //     subject: 'Lucky Winner',
  //     html: '<p>Hi John<p/>',
  //   };
  //   return await this.mailerService.sendMail(dto);
  // }
}
