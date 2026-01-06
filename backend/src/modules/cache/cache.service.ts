import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error('[CacheService] Error getting from cache:', error);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error('[CacheService] Error setting cache:', error);
      // Don't throw - allow app to continue without cache
    }
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Note: reset() method may not be available in all cache implementations
    // For Redis, we can use del with pattern matching or just clear all keys
    // This is a simplified version - in production, use Redis SCAN + DEL
    try {
      if (typeof (this.cacheManager as any).reset === 'function') {
        await (this.cacheManager as any).reset();
      }
    } catch (error) {
      console.warn('Cache reset not available:', error);
    }
  }

  // Helper method to generate cache keys
  generateKey(
    prefix: string,
    ...params: (string | number | undefined)[]
  ): string {
    const filteredParams = params.filter((p) => p !== undefined && p !== null);
    return `${prefix}:${filteredParams.join(':')}`;
  }

  // Invalidate cache by pattern (for related keys)
  async invalidatePattern(pattern: string): Promise<void> {
    // Note: This requires Redis client directly for pattern matching
    // For now, we'll use a simple approach with known patterns
    const keys = await this.getAllKeys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of keys) {
      if (regex.test(key)) {
        await this.del(key);
      }
    }
  }

  private async getAllKeys(): Promise<string[]> {
    // This is a simplified version - in production, use Redis SCAN
    return [];
  }
}
