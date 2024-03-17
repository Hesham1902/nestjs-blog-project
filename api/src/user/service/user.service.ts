import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { UpdateDto } from '../dto/update.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  async create(user: RegisterDto): Promise<RegisterDto> {
    const hashedPassword = await this.authService.hashPassword(user.password);
    return this.userRepository.save({ ...user, password: hashedPassword });
  }

  async findaAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    const usersArr = [];
    users.forEach((user) => {
      delete user.password;
      usersArr.push(user);
    });
    return usersArr;
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