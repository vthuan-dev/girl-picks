import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../utils/jwt.util';

// Extended user type from JWT strategy validation
type UserFromJWT = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  girl?: any;
};

type RequestWithUser = Request & { user?: UserFromJWT };

export const CurrentUser = createParamDecorator(
  (data: keyof UserFromJWT | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      return undefined;
    }
    return data ? request.user[data] : request.user;
  },
);
