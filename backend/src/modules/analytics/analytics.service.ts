import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Track a page view
   */
  async trackPageView(dto: TrackPageViewDto, ipAddress?: string, userId?: string) {
    try {
      await this.prisma.pageView.create({
        data: {
          path: dto.path,
          title: dto.title,
          referrer: dto.referrer,
          userAgent: dto.userAgent,
          sessionId: dto.sessionId,
          userId: userId,
          ipAddress: ipAddress,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error tracking page view:', error);
      // Don't throw - analytics should not break the app
      return { success: false };
    }
  }

  /**
   * Get analytics data for a time range
   */
  async getAnalytics(timeRange: '7days' | '30days' | '90days' | '1year') {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get total visits (unique sessions)
    const totalVisits = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get visits by date for traffic data
    // Get all page views in the period
    const allPageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        sessionId: true,
      },
    });

    // Group by date
    const visitsByDateMap = new Map<string, Set<string>>();
    allPageViews.forEach((view) => {
      const date = new Date(view.createdAt).toISOString().split('T')[0];
      if (!visitsByDateMap.has(date)) {
        visitsByDateMap.set(date, new Set());
      }
      visitsByDateMap.get(date)!.add(view.sessionId);
    });

    const visitsByDate = Array.from(visitsByDateMap.entries())
      .map(([date, sessions]) => ({
        date,
        visits: sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    const periodDays = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    const previousVisits = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    // Calculate change percentage
    const currentCount = totalVisits.length;
    const previousCount = previousVisits.length;
    const visitsChange = previousCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : currentCount > 0 ? 100 : 0;

    // Get new users (users created in this period)
    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const previousNewUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const usersChange = previousNewUsers > 0
      ? ((newUsers - previousNewUsers) / previousNewUsers) * 100
      : newUsers > 0 ? 100 : 0;

    // Get revenue
    const revenue = await this.prisma.payment.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const previousRevenue = await this.prisma.payment.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentRevenue = Number(revenue._sum.amount || 0);
    const prevRevenue = Number(previousRevenue._sum.amount || 0);
    const revenueChange = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : currentRevenue > 0 ? 100 : 0;

    // Get bookings
    const bookings = await this.prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const previousBookings = await this.prisma.booking.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    });

    const bookingsChange = previousBookings > 0
      ? ((bookings - previousBookings) / previousBookings) * 100
      : bookings > 0 ? 100 : 0;

    return {
      metrics: {
        totalVisits: currentCount,
        newUsers,
        bookings,
        revenue: currentRevenue,
        visitsChange: Number(visitsChange.toFixed(1)),
        usersChange: Number(usersChange.toFixed(1)),
        bookingsChange: Number(bookingsChange.toFixed(1)),
        revenueChange: Number(revenueChange.toFixed(1)),
      },
      trafficData: visitsByDate.map((item) => ({
        date: item.date,
        visits: Number(item.visits),
      })),
      revenueData: [], // Can be implemented similarly
    };
  }

  /**
   * Get top pages by views
   */
  async getTopPages(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all page views in last 30 days
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        path: true,
        sessionId: true,
      },
    });

    // Group by path and count unique sessions
    const pageViewsMap = new Map<string, Set<string>>();
    pageViews.forEach((view) => {
      if (!pageViewsMap.has(view.path)) {
        pageViewsMap.set(view.path, new Set());
      }
      pageViewsMap.get(view.path)!.add(view.sessionId);
    });

    // Convert to array and sort
    const result = Array.from(pageViewsMap.entries())
      .map(([page, sessions]) => ({
        page,
        views: sessions.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    // Calculate changes (compare with previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const topPages = await Promise.all(
      result.map(async (item) => {
        const currentViews = item.views;
        
        // Get views from previous period (30-60 days ago)
        const previousPageViews = await this.prisma.pageView.findMany({
          where: {
            path: item.page,
            createdAt: {
              gte: sixtyDaysAgo,
              lt: thirtyDaysAgo,
            },
          },
          select: {
            sessionId: true,
          },
        });

        const previousSessions = new Set(previousPageViews.map(v => v.sessionId));
        const previousViews = previousSessions.size;
        
        const change = previousViews > 0
          ? ((currentViews - previousViews) / previousViews) * 100
          : currentViews > 0 ? 100 : 0;

        return {
          page: item.page,
          views: currentViews,
          change: Number(change.toFixed(1)),
        };
      })
    );

    return topPages;
  }

  /**
   * Get top girls by views
   */
  async getTopGirls(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all page views for girl profiles (paths like /gai-goi/[id]/[slug])
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        path: {
          startsWith: '/gai-goi/',
        },
      },
      select: {
        path: true,
        sessionId: true,
        title: true,
      },
    });

    // Extract girl ID from path (format: /gai-goi/[id]/[slug])
    const girlViewsMap = new Map<string, { views: Set<string>; name: string }>();
    
    pageViews.forEach((view) => {
      // Extract ID from path like /gai-goi/123/abc-slug
      const pathParts = view.path.split('/');
      if (pathParts.length >= 3 && pathParts[1] === 'gai-goi') {
        const girlId = pathParts[2];
        const girlName = view.title || pathParts[3] || 'N/A';
        
        if (!girlViewsMap.has(girlId)) {
          girlViewsMap.set(girlId, { views: new Set(), name: girlName });
        }
        girlViewsMap.get(girlId)!.views.add(view.sessionId);
      }
    });

    // Get girl details from database
    const girlIds = Array.from(girlViewsMap.keys());
    const girls = await this.prisma.girl.findMany({
      where: {
        id: {
          in: girlIds,
        },
      },
      select: {
        id: true,
        name: true,
        images: true,
        userId: true,
      },
    });

    // Get user details if needed
    const userIds = girls.filter(g => g.userId).map(g => g.userId!);
    const users = userIds.length > 0 ? await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    }) : [];
    const usersMap = new Map(users.map(u => [u.id, u]));

    // Create a map of girl details
    const girlsMap = new Map(girls.map(g => [g.id, g]));

    // Convert to array and sort
    const result = Array.from(girlViewsMap.entries())
      .map(([girlId, data]) => {
        const girl = girlsMap.get(girlId);
        const user = girl?.userId ? usersMap.get(girl.userId) : null;
        // Get first image from images array (JSON)
        const images = girl?.images ? (Array.isArray(girl.images) ? girl.images : JSON.parse(girl.images as any)) : [];
        const avatar = images && images.length > 0 ? images[0] : null;
        
        return {
          id: girlId,
          name: girl?.name || user?.fullName || data.name,
          avatar: avatar,
          views: data.views.size,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    // Calculate changes (compare with previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const topGirls = await Promise.all(
      result.map(async (item) => {
        const currentViews = item.views;
        
        // Get views from previous period (30-60 days ago) for this girl
        const previousPageViews = await this.prisma.pageView.findMany({
          where: {
            path: {
              startsWith: `/gai-goi/${item.id}/`,
            },
            createdAt: {
              gte: sixtyDaysAgo,
              lt: thirtyDaysAgo,
            },
          },
          select: {
            sessionId: true,
          },
        });

        const previousSessions = new Set(previousPageViews.map(v => v.sessionId));
        const previousViews = previousSessions.size;
        
        const change = previousViews > 0
          ? ((currentViews - previousViews) / previousViews) * 100
          : currentViews > 0 ? 100 : 0;

        return {
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          views: currentViews,
          change: Number(change.toFixed(1)),
        };
      })
    );

    return topGirls;
  }
}

