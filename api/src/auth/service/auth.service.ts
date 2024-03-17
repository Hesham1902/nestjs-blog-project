import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/user/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwtToken(user: LoginDto): Promise<object> {
    const token = await this.jwtService.signAsync({ user });
    return { access_token: token };
  }

  hashPassword(password): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  comparePasswords(loginPass, originalPass): Promise<boolean> {
    return bcrypt.compare(loginPass, originalPass);
  }
}
