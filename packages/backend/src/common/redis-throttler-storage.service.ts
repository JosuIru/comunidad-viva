import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

/**
 * Redis-based storage for @nestjs/throttler
 * Falls back to in-memory storage if Redis is not available
 */
// Extended record for in-memory storage
interface MemoryStorageRecord extends ThrottlerStorageRecord {
  expiresAt: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private redis: Redis | null = null;
  private useRedis = false;

  // Fallback in-memory storage when Redis is not available
  private memoryStorage: Map<string, MemoryStorageRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Try to connect to Redis (optional)
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.redis = new Redis(redisUrl, {
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 retries. Using in-memory storage.');
            return null; // Stop retrying
          }
          return Math.min(times * 50, 2000);
        },
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      // Test connection
      this.redis.connect().then(() => {
        this.logger.log('✅ Redis connected successfully for rate limiting');
        this.useRedis = true;
      }).catch((err) => {
        this.logger.warn(`Redis not available (${err.message}). Using in-memory rate limiting.`);
        this.redis?.disconnect();
        this.redis = null;
        this.useRedis = false;
        this.startMemoryCleanup();
      });

      this.useRedis = true;
    } catch (error) {
      this.logger.warn('Redis configuration error. Using in-memory rate limiting.');
      this.useRedis = false;
      this.startMemoryCleanup();
    }
  }

  /**
   * Start periodic cleanup of expired memory records
   */
  private startMemoryCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.memoryStorage.entries()) {
        if (record.expiresAt <= now) {
          this.memoryStorage.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Increment the number of requests for a given key
   */
  async increment(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    if (this.redis && this.useRedis) {
      return this.incrementRedis(key, ttl);
    } else {
      return this.incrementMemory(key, ttl);
    }
  }

  /**
   * Increment using Redis
   */
  private async incrementRedis(key: string, ttl: number): Promise<ThrottlerStorageRecord> {
    try {
      const redisKey = `throttle:${key}`;
      const multi = this.redis!.multi();

      multi.incr(redisKey);
      multi.pexpire(redisKey, ttl);

      const [[, totalHits]] = await multi.exec();

      return {
        totalHits: totalHits as number,
        timeToExpire: ttl,
        timeToBlockExpire: 0,
        isBlocked: false,
      };
    } catch (error) {
      this.logger.error(`Redis error: ${error.message}. Falling back to memory.`);
      return this.incrementMemory(key, ttl);
    }
  }

  /**
   * Increment using in-memory storage
   */
  private incrementMemory(key: string, ttl: number): ThrottlerStorageRecord {
    const now = Date.now();
    const expiresAt = now + ttl;

    const existing = this.memoryStorage.get(key);

    if (existing && existing.expiresAt > now) {
      // Record still valid, increment
      existing.totalHits++;
      return {
        totalHits: existing.totalHits,
        timeToExpire: existing.timeToExpire,
        timeToBlockExpire: 0,
        isBlocked: existing.isBlocked,
      };
    } else {
      // Create new record
      const record: MemoryStorageRecord = {
        totalHits: 1,
        timeToExpire: ttl,
        timeToBlockExpire: 0,
        expiresAt,
        isBlocked: false,
      };
      this.memoryStorage.set(key, record);
      return {
        totalHits: record.totalHits,
        timeToExpire: record.timeToExpire,
        timeToBlockExpire: 0,
        isBlocked: record.isBlocked,
      };
    }
  }

  /**
   * Get the current throttle record for a key
   */
  async get(key: string): Promise<ThrottlerStorageRecord | undefined> {
    if (this.redis && this.useRedis) {
      return this.getRedis(key);
    } else {
      return this.getMemory(key);
    }
  }

  /**
   * Get from Redis
   */
  private async getRedis(key: string): Promise<ThrottlerStorageRecord | undefined> {
    try {
      const redisKey = `throttle:${key}`;
      const [totalHits, ttl] = await Promise.all([
        this.redis!.get(redisKey),
        this.redis!.pttl(redisKey),
      ]);

      if (!totalHits || ttl <= 0) {
        return undefined;
      }

      return {
        totalHits: parseInt(totalHits, 10),
        timeToExpire: ttl,
        timeToBlockExpire: 0,
        isBlocked: false,
      };
    } catch (error) {
      this.logger.error(`Redis error: ${error.message}. Falling back to memory.`);
      return this.getMemory(key);
    }
  }

  /**
   * Get from memory
   */
  private getMemory(key: string): ThrottlerStorageRecord | undefined {
    const record = this.memoryStorage.get(key);
    const now = Date.now();

    if (record && record.expiresAt > now) {
      return {
        totalHits: record.totalHits,
        timeToExpire: record.timeToExpire,
        timeToBlockExpire: 0,
        isBlocked: record.isBlocked,
      };
    }

    // Clean up expired record
    if (record) {
      this.memoryStorage.delete(key);
    }

    return undefined;
  }

  /**
   * Reset/delete a throttle record
   */
  async reset(key: string): Promise<void> {
    if (this.redis && this.useRedis) {
      try {
        await this.redis.del(`throttle:${key}`);
      } catch (error) {
        this.logger.error(`Redis error: ${error.message}`);
      }
    }
    this.memoryStorage.delete(key);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  /**
   * Get storage type (for logging/monitoring)
   */
  getStorageType(): 'redis' | 'memory' {
    return this.useRedis && this.redis ? 'redis' : 'memory';
  }

  /**
   * Get storage stats (for monitoring)
   */
  getStats() {
    return {
      storageType: this.getStorageType(),
      redisConnected: this.redis?.status === 'ready',
      memoryRecords: this.memoryStorage.size,
    };
  }
}
