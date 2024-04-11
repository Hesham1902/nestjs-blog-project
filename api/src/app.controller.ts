import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}
  @Get()
  mainEndpoints(): object {
    return {
      status: 'success',
      message: `Access the swagger documentation here: ${this.configService.get('BASE_URL')}/api `,
    };
  }
}
