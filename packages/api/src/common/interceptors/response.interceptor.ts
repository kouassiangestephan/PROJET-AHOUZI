import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.__raw) {
          return data;
        }
        const { data: responseData, message, pagination, ...rest } = data || {};
        if (data && (data.data !== undefined || data.message !== undefined)) {
          return {
            success: true,
            data: responseData ?? rest,
            message,
            pagination,
          };
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
