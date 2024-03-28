import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserRole } from './models/user.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
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

  async deleteOne(id: number): Promise<any> {
    try {
      const result: DeleteResult = await this.userRepository.delete(id);
      console.log(result);
      if (result.affected !== 1 || !result.affected) {
        throw new Error('Could not delete the user from the database');
      }
      return {
        success: true,
        message: 'User deleted successfully',
        result: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while deleting the user',
        error,
        status: error.statusCode,
      };
    }
  }

  async updateOne(id: number, user: UpdateDto) {
    const updateResult: UpdateResult = await this.userRepository.update(
      id,
      user,
    );
    if (updateResult.affected && updateResult.affected > 0) {
      return this.userRepository.findOne({ where: { id } });
    }
    throw new NotFoundException(`Couldn\'t update the user`);
  }

  updateRoleOfUser(role: UserRole, id: string): Promise<any> {
    return this.userRepository.update(id, { role });
  }
}
