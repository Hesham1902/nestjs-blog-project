import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User, UserRole } from './models/user.interface';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateDto } from './dto/update.dto';
import { MailerService } from 'src/mailer/mailer.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  async create(user: RegisterDto): Promise<object> {
    if (
      (await this.userRepository.findOne({ where: { email: user.email } })) ||
      (await this.userRepository.findOne({
        where: { username: user.username },
      }))
    ) {
      throw new BadRequestException('email or username already exists');
    }
    const hashedPassword = await this.authService.createHash(user.password);
    const savedUser = await this.userRepository.save({
      ...user,
      role: UserRole.USER,
      password: hashedPassword,
    });
    delete savedUser.password;
    await this.emailVerification(savedUser);
    return { message: 'email sent for verification' };
  }

  async deleteOne(id: number): Promise<any> {
    try {
      const result: DeleteResult = await this.userRepository.delete(id);
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

  async forgetPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const resetCode = this.mailerService.resetCode();
    user.passwordResetCode = (await this.createHash(resetCode)).toString();
    await this.userRepository.save(user);
    try {
      await this.mailerService.sendChangeingPasswordCode({ email, resetCode });
    } catch (error) {
      console.log(error);
      user.passwordResetCode = null;
      await this.userRepository.save(user);
      throw new HttpException('internal server error', 400);
    }
    return { resetCode };
  }

  async verifyResetPassword(resetCode: string) {
    const hash = await this.createHash(resetCode);
    const user = await this.userRepository.findOne({
      where: { passwordResetCode: hash },
    });
    if (!user) {
      throw new HttpException('user not found', 400);
    }
    user.passwordResetCode = null;
    user.passwordResetCodeVerified = true;
    await this.userRepository.save(user);
    return { status: 'verified' };
  }

  async changePassword(body: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (!user) {
      throw new HttpException('user not found', 400);
    }
    if (!user.passwordResetCodeVerified) {
      throw new HttpException('resetcode is not vertified', 400);
    }
    if (body.password !== body.confirmPassword) {
      throw new HttpException('password mismatch', 400);
    }
    const passwordHash = await this.authService.createHash(body.password);
    user.password = passwordHash;
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);
    return { user };
  }

  async verifyEmail(code: string) {
    const hash = await this.createHash(code);
    console.log(hash, code);
    const user = await this.userRepository.findOne({
      where: {
        emailVerifiedCode: hash,
      },
    });
    if (!user) {
      throw new HttpException('email Verified Code expired', 400);
    }
    user.emailVerifiedCode = null;
    user.verified = true;
    await this.userRepository.save(user);
    return { status: 'vertified' };
  }

  private async emailVerification(user: User) {
    const code = this.mailerService.resetCode();
    const hash = await this.createHash(code);
    user.emailVerifiedCode = hash;
    console.log(hash, code);
    try {
      await this.mailerService.sendWelcome({
        email: user.email,
        resetCode: code,
      });
    } catch (error) {
      user.emailVerifiedCode = null;
      await this.userRepository.save(user);
      throw error;
    }
    console.log(user);
    await this.userRepository.save(user);
  }

  private createHash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  updateRoleOfUser(role: UserRole, id: string): Promise<any> {
    return this.userRepository.update(id, { role });
  }
}
