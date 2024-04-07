import { Address } from 'nodemailer/lib/mailer';

export class SendMailDto {
  recipient?: Array<Address>;
  subject?: string;
  html: string;
  text?: string;
}
