import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CacheHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Chỉ set cache headers cho GET requests
    if (request.method === 'GET') {
      const url = request.url;

      // Set cache headers dựa trên endpoint
      if (url.startsWith('/girls') && !url.includes('/images')) {
        // List và detail endpoints - cache trong browser 1 phút, revalidate
        response.setHeader(
          'Cache-Control',
          'public, max-age=60, stale-while-revalidate=300',
        );
        response.setHeader('ETag', `"${Date.now()}"`); // Simple ETag
      } else if (url.startsWith('/districts') || url.startsWith('/posts')) {
        // Static data - cache lâu hơn
        response.setHeader(
          'Cache-Control',
          'public, max-age=300, stale-while-revalidate=600',
        );
      }
    }

    return next.handle();
  }
}
