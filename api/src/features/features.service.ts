import { Injectable } from '@nestjs/common';

@Injectable()
export class FeaturesService {
  filter() {}
  async paginate(page: number, limit: number, docsCount: number) {
    const skip = (page - 1) * limit;
    // query.skip = skip;
    // query.take = limit;
    console.log(docsCount);
    const pagination: any = {
      currentPage: page,
      limit,
      numOfPages: Math.ceil(docsCount / limit),
    };
    if (page * limit < docsCount) {
      pagination.nextPage = page + 1;
    }
    if (skip > 0) {
      pagination.prevPage = page - 1;
    }
    return { skip, pagination };
  }
}
