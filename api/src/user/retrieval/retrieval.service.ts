import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { ApiFeatures } from 'src/utils/api.features';
import { User } from '../models/user.interface';

@Injectable()
export class RetrievalService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // No filter or pagination
  async findAll() {
    return this.userRepository.find();
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<UserEntity>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  async paginateFilter(queryObj) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const filters = { ...queryObj };
    delete filters.page;
    delete filters.limit;

    // console.log(queryObj, filters);

    const apiFeatures = await new ApiFeatures<User>(queryBuilder, queryObj)
      .filter(filters)
      .pagination();
    const users = await apiFeatures.query.getMany();
    return { users, paginationResult: apiFeatures.paginationObj };
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`No User with this ${id} found`);
    }
    delete user.password;
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`No User with this ${email} found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`No User with this ${username} found`);
    }
    delete user.password;
    return user;
  }
}
