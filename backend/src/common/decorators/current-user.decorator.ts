import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../utils/jwt.util';

type RequestWithUser = Request & { user?: TokenPayload };

export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      return undefined;
    }
    return data ? request.user[data] : request.user;
  },
);
