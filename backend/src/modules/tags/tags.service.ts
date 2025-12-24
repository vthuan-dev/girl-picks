import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Get popular tags with count from girls
   */
  async getPopularTags(
    limit: number = 20,
  ): Promise<Array<{ name: string; count: number }>> {
    const cacheKey = this.cacheService.generateKey('tags:popular', limit);

    // Try to get from cache first
    const cachedData =
      await this.cacheService.get<Array<{ name: string; count: number }>>(
        cacheKey,
      );
    if (cachedData && Array.isArray(cachedData)) {
      console.log('[TagsService] Cache hit for popular tags');
      return cachedData;
    }

    console.log(
      '[TagsService] Cache miss, fetching popular tags from database...',
    );

    // Get all active girls with tags
    const girls = await this.prisma.girl.findMany({
      where: {
        isActive: true,
      },
      select: {
        tags: true,
      },
    });

    // Aggregate tags
    const tagCountMap = new Map<string, number>();

    girls.forEach((girl) => {
      if (girl.tags && Array.isArray(girl.tags)) {
        (girl.tags as string[]).forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            const normalizedTag = tag.trim().toLowerCase();
            if (normalizedTag) {
              tagCountMap.set(
                normalizedTag,
                (tagCountMap.get(normalizedTag) || 0) + 1,
              );
            }
          }
        });
      }
    });

    // Convert to array and sort by count
    const popularTags = Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, popularTags, 600);

    return popularTags;
  }

  /**
   * Get popular tags from posts
   */
  async getPopularTagsFromPosts(
    limit: number = 20,
  ): Promise<Array<{ name: string; count: number }>> {
    const cacheKey = this.cacheService.generateKey('tags:popular:posts', limit);

    const cachedData =
      await this.cacheService.get<Array<{ name: string; count: number }>>(
        cacheKey,
      );
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    const posts = await this.prisma.post.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        tags: true,
      },
    });

    const tagCountMap = new Map<string, number>();

    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        (post.tags as string[]).forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            const normalizedTag = tag.trim().toLowerCase();
            if (normalizedTag) {
              tagCountMap.set(
                normalizedTag,
                (tagCountMap.get(normalizedTag) || 0) + 1,
              );
            }
          }
        });
      }
    });

    const popularTags = Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    await this.cacheService.set(cacheKey, popularTags, 600);

    return popularTags;
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const cacheKey = this.cacheService.generateKey('tags:all');

    const cachedData = await this.cacheService.get<string[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    const girls = await this.prisma.girl.findMany({
      where: {
        isActive: true,
      },
      select: {
        tags: true,
      },
    });

    const tagSet = new Set<string>();

    girls.forEach((girl) => {
      if (girl.tags && Array.isArray(girl.tags)) {
        (girl.tags as string[]).forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            const normalizedTag = tag.trim().toLowerCase();
            if (normalizedTag) {
              tagSet.add(normalizedTag);
            }
          }
        });
      }
    });

    const allTags = Array.from(tagSet).sort();

    await this.cacheService.set(cacheKey, allTags, 600);

    return allTags;
  }
}
