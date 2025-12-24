import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular tags with count' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of tags to return (default: 20)',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: ['girls', 'posts', 'all'],
    description: 'Source of tags (default: girls)',
  })
  @ApiResponse({ status: 200, description: 'Returns popular tags with count' })
  async getPopularTags(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('source', new DefaultValuePipe('girls'))
    source: 'girls' | 'posts' | 'all',
  ) {
    if (source === 'posts') {
      return this.tagsService.getPopularTagsFromPosts(limit);
    } else if (source === 'all') {
      const [girlTags, postTags] = await Promise.all([
        this.tagsService.getPopularTags(limit),
        this.tagsService.getPopularTagsFromPosts(limit),
      ]);

      // Merge and aggregate
      const tagMap = new Map<string, number>();

      girlTags.forEach(({ name, count }) => {
        tagMap.set(name, (tagMap.get(name) || 0) + count);
      });

      postTags.forEach(({ name, count }) => {
        tagMap.set(name, (tagMap.get(name) || 0) + count);
      });

      return Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }

    return this.tagsService.getPopularTags(limit);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all unique tags' })
  @ApiResponse({ status: 200, description: 'Returns all unique tags' })
  async getAllTags() {
    return this.tagsService.getAllTags();
  }
}
