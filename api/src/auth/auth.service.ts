import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RetrievalService } from 'src/user/retrieval/retrieval.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private retrievalService: RetrievalService,
  ) {}

  async generateJwtToken(user: LoginDto): Promise<object> {
    const token = await this.jwtService.signAsync({ user });
    return { access_token: token };
  }

  createHash(password): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  compareHashes(loginPass, originalPass): Promise<boolean> {
    return bcrypt.compare(loginPass, originalPass);
  }

  async validateUser(email: string, password: string) {
    const user = await this.retrievalService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `No user found with this email address ${email}`,
      );
    }
    return {
      result: await this.compareHashes(password, user.password),
      user,
    };
  }

  async login(body: LoginDto): Promise<object> {
    const { result, user } = await this.validateUser(body.email, body.password);
    // console.log(result);
    if (!result) {
      throw new UnauthorizedException('Invalid login credentials');
    }
    return this.generateJwtToken(user);
  }
}
