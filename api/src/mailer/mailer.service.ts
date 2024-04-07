import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { resetPasswordTemplate, signupTemplate } from './emailTemplate';

@Injectable()
export class MailerService {
  constructor(private configService: ConfigService) {}

  createTransport() {
    return nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('HOST'),
      port: this.configService.getOrThrow('PORT'),
      secure: true,
      //   secure: this.configService.getOrThrow('PORT') === 587 ? false : true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: this.configService.getOrThrow('USER'),
        pass: this.configService.getOrThrow('PASSWORD'),
      },
    });
  }

  sendWelcome(body: { email: string; resetCode: string }) {
    const to = body.email;
    const subject = 'welcome to our blogify website';
    const link = `${this.configService.getOrThrow('BASE_URL')}/user/verify-email/${body.resetCode}`;
    console.log(link);
    const html = signupTemplate(link);
    const from = 'Blogify App <heshammaher@outlook.com>';
    return this.send({ from, to, subject, html });
  }

  sendChangeingPasswordCode(body: { email: string; resetCode: string }) {
    const to = body.email;
    const subject = 'reset code to change your password';
    // const text = `your reset code to change your passsword is ${body.resetCode}`;
    const html = resetPasswordTemplate(body.resetCode);
    const from = 'Blogify App <heshammaher@outlook.com>';
    return this.send({ from, to, subject, html });
  }

  send(opts: { from: string; to: string; subject: string; html: string }) {
    this.createTransport().sendMail(opts);
  }

  resetCode() {
    return crypto?.randomBytes(3)?.toString('hex');
  }
}
