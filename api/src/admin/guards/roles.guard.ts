import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/models/user.interface';
import { RetrievalService } from 'src/user/retrieval/retrieval.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private retrievalService: RetrievalService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get('roles', context.getHandler());
    console.log('iam ran');
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const latestRolesUpdate = await this.retrievalService.findById(user.id);
    if (!roles.includes(latestRolesUpdate.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access this route',
      );
    }
    return true;
  }
}
