import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class GirlManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // ADMIN và STAFF_UPLOAD có quyền quản lý Girl
    const hasPermission =
      user.role === UserRole.ADMIN || user.role === UserRole.STAFF_UPLOAD;

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to manage girls',
      );
    }

    return true;
  }
}
