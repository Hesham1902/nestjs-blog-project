import { Controller, Get, Param, Query } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';
import { User } from '../models/user.interface';

@Controller('user')
export class RetrievalController {
  constructor(private retrievalService: RetrievalService) {}

  @Get(':id')
  findById(@Param() params): Promise<User> {
    return this.retrievalService.findById(params.id);
  }

  @Get(':email')
  findByEmail(@Param() params): Promise<User> {
    return this.retrievalService.findByEmail(params.email);
  }

  @Get()
  findAll(@Query() queryObj: any) {
    return this.retrievalService.paginateFilter(queryObj);
  }
}
