import { CanActivate, ExecutionContext } from '@nestjs/common';

// This is a guard that will be used to protect routes that require authentication.
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.session.userId;
  }
}
