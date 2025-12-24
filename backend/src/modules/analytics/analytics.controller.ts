import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a page view (Public)' })
  @ApiResponse({ status: 200, description: 'Page view tracked successfully' })
  async trackPageView(@Body() dto: TrackPageViewDto, @Req() req: Request) {
    // Get IP address from request
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      '';

    // Get user ID from token if exists (optional)
    const userId = (req as any).user?.id;

    return this.analyticsService.trackPageView(dto, ipAddress, userId);
  }

  @Post('event')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a custom event (Public)' })
  @ApiResponse({ status: 200, description: 'Event tracked successfully' })
  async trackEvent(@Body() dto: TrackEventDto) {
    // For now, just return success
    // Can be extended to store events in database if needed
    return { success: true };
  }

  @Get('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top pages by views (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top pages list' })
  async getTopPages(@Query('limit') limit?: number) {
    const topPages = await this.analyticsService.getTopPages(
      limit ? Number(limit) : 10,
    );
    return {
      success: true,
      data: topPages,
    };
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get analytics data (Admin only)' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['7days', '30days', '90days', '1year'],
  })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  async getAnalytics(
    @Query('timeRange')
    timeRange: '7days' | '30days' | '90days' | '1year' = '7days',
  ) {
    const analytics = await this.analyticsService.getAnalytics(timeRange);
    const topPages = await this.analyticsService.getTopPages(10);
    const topGirls = await this.analyticsService.getTopGirls(10);

    return {
      success: true,
      data: {
        ...analytics,
        topPages,
        topGirls,
      },
    };
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get top pages (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top pages list' })
  async getTopPages(@Query('limit') limit?: number) {
    const topPages = await this.analyticsService.getTopPages(
      limit ? Number(limit) : 10,
    );
    return {
      success: true,
      data: topPages,
    };
  }

  @Get('girls')
  @ApiOperation({ summary: 'Get top girls (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top girls list' })
  async getTopGirls(@Query('limit') limit?: number) {
    const topGirls = await this.analyticsService.getTopGirls(
      limit ? Number(limit) : 10,
    );
    return {
      success: true,
      data: topGirls,
    };
  }
}
