import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/user/models/user.interface';

export class UserValidateGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user || !request.user.verified) {
      return false;
    }
    const user: User = request.user;
    console.log(
      'Logged User Id: ' + user.id,
      'params Id: ' + Number(request.params.id),
    );
    if (request.user.id !== Number(request.params.id)) {
      throw new ForbiddenException('Not authorized');
    }
    return true;
  }
}
