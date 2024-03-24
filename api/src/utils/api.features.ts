import { SelectQueryBuilder } from 'typeorm';

export interface QueryInterface {
  [key: string]: string | object;
  page?: string;
  sort?: string;
  select?: string;
  limit?: string;
  keyword?: string;
}

export interface Pagination {
  currentPage?: number;
  previousPage?: number;
  nextPage?: number;
  numOfDocs?: number;
  skip?: number;
  limit?: number;
}

export class ApiFeatures<T> {
  public paginationObj: Pagination = {};
  constructor(
    public query: SelectQueryBuilder<T>,
    public queryObj: QueryInterface,
  ) {}

  filter(filters: Record<string, any>): this {
    if (
      filters &&
      Object.keys(filters).length > 0 &&
      Object.entries(filters) !== undefined &&
      Object.values(filters)[0] !== undefined
    ) {
      console.log('Keys: ' + Object.keys(filters));
      console.log('entries: ' + Object.entries(filters));
      Object.entries(filters).forEach(([key, value]) => {
        this.query = this.query.andWhere(
          `${this.query.alias}.${key} LIKE :${key} `,
          {
            [key]: `%${value}%`,
          },
        );
      });
    }
    return this;
  }

  sort(column: string, order: 'ASC' | 'DESC' = 'ASC') {
    this.query = this.query.orderBy(column, order);
    return this;
  }

  async pagination() {
    // Counting total number of documents (rows) in the query result
    const totalCount = await this.query.getCount();
    this.paginationObj.numOfDocs = totalCount;
    this.paginationObj.currentPage = this.queryObj.page
      ? parseInt(this.queryObj.page)
      : 1;
    this.paginationObj.limit = this.queryObj.limit
      ? parseInt(this.queryObj.limit)
      : 10;
    this.paginationObj.skip =
      (this.paginationObj.currentPage - 1) * this.paginationObj.limit;

    if (this.paginationObj.currentPage > 1) {
      this.paginationObj.previousPage = this.paginationObj.currentPage - 1;
    }

    if (
      totalCount >
      this.paginationObj.currentPage * this.paginationObj.limit
    ) {
      this.paginationObj.nextPage = this.paginationObj.currentPage + 1;
    }

    this.query = this.query
      .offset(this.paginationObj.skip)
      .limit(this.paginationObj.limit);
    return this;
  }
}
