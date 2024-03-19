import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { UpdateDto } from '../dto/update.dto';
import { LoginDto } from '../dto/login.dto';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(user: RegisterDto): Promise<RegisterDto> {
    if (
      (await this.userRepository.findOne({ where: { email: user.email } })) ||
      (await this.userRepository.findOne({
        where: { username: user.username },
      }))
    ) {
      throw new BadRequestException('email or username already exists');
    }
    const hashedPassword = await this.authService.hashPassword(user.password);
    const savedUser = await this.userRepository.save({
      ...user,
      role: UserRole.USER,
      password: hashedPassword,
    });
    delete savedUser.password;
    return savedUser;
  }

  // async findAll(): Promise<User[]> {
  //   const users = await this.userRepository.find();
  //   const usersArr = [];
  //   users.forEach((user) => {
  //     delete user.password;
  //     usersArr.push(user);
  //   });
  //   return usersArr;
  // }

  async paginate(options: IPaginationOptions): Promise<Pagination<UserEntity>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`No User with this ${id} found`);
    }
    const { password, ...result } = user;
    return result;
  }

  deleteOne(id: number): Promise<any> {
    return this.userRepository.delete(id);
  }

  updateOne(id: number, user: UpdateDto): Promise<any> {
    return this.userRepository.update(id, user);
  }

  async login(body: LoginDto): Promise<object> {
    const { result, user } = await this.validateUser(body.email, body.password);
    if (!result) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    delete user.password;
    return this.authService.generateJwtToken(user);
  }

  updateRoleOfUser(role: UserRole, id: string): Promise<any> {
    return this.userRepository.update(id, { role });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return {
      result: this.authService.comparePasswords(password, user.password),
      user,
    };
  }
}
