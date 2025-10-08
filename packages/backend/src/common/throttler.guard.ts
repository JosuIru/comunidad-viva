import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { LoggerService } from './logger.service';

interface ThrottleConfig {
  limit: number;
  ttl: number; // Time to live in seconds
}

const THROTTLE_METADATA_KEY = 'throttle_config';

// Simple in-memory store for rate limiting
// In production, use Redis for distributed rate limiting
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(key: string, ttl: number): { count: number; remaining: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.resetTime < now) {
      // Create new record
      this.store.set(key, {
        count: 1,
        resetTime: now + ttl * 1000,
      });
      return { count: 1, remaining: 0 };
    }

    // Increment existing record
    record.count++;
    this.store.set(key, record);
    return { count: record.count, remaining: record.resetTime - now };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

@Injectable()
export class ThrottlerGuard {
  private readonly logger = new LoggerService('ThrottlerGuard');
  private readonly store = new RateLimitStore();

  constructor(private readonly reflector: Reflector) {
    // Cleanup old entries every 5 minutes
    setInterval(() => this.store.cleanup(), 5 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<ThrottleConfig>(
      THROTTLE_METADATA_KEY,
      context.getHandler(),
    );

    // If no throttle config, allow request
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request, context);

    const { count, remaining } = this.store.increment(key, config.ttl);

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', config.limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, config.limit - count));
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + remaining).toISOString());

    if (count > config.limit) {
      this.logger.warn(
        `Rate limit exceeded for ${key} - ${count}/${config.limit} requests`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(remaining / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private generateKey(request: Request, context: ExecutionContext): string {
    // Use IP address + route as key
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const route = context.getHandler().name;
    const controller = context.getClass().name;
    return `${ip}:${controller}:${route}`;
  }
}

// Decorator to apply throttling to specific routes
export const Throttle = (limit: number, ttl: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      THROTTLE_METADATA_KEY,
      { limit, ttl },
      descriptor.value,
    );
    return descriptor;
  };
};
