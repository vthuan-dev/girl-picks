import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';
import { VerificationStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('girls')
  @Public()
  @ApiOperation({ summary: 'Search girls (public)' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'districts', required: false, type: [String] })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'verification', required: false, enum: VerificationStatus })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isPremium', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchGirls(
    @Query('query') query?: string,
    @Query('districts') districts?: string | string[],
    @Query('minRating', new DefaultValuePipe(0), ParseFloatPipe)
    minRating?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('verification') verification?: VerificationStatus,
    @Query('isFeatured') isFeatured?: string,
    @Query('isPremium') isPremium?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const districtsArray = districts
      ? Array.isArray(districts)
        ? districts
        : [districts]
      : undefined;

    return this.searchService.searchGirls({
      query,
      districts: districtsArray,
      minRating: minRating > 0 ? minRating : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      verification,
      isFeatured:
        isFeatured === 'true'
          ? true
          : isFeatured === 'false'
            ? false
            : undefined,
      isPremium:
        isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
      page,
      limit,
    });
  }

  @Get('posts')
  @Public()
  @ApiOperation({ summary: 'Search posts (public)' })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchPosts(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.searchService.searchPosts(query, page, limit);
  }

  @Get('reviews')
  @Public()
  @ApiOperation({ summary: 'Search reviews (public)' })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  searchReviews(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.searchService.searchReviews(query, page, limit);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across all entities (public)' })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search results' })
  globalSearch(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.searchService.globalSearch(query, page, limit);
  }
}
