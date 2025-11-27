import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus, ReviewStatus, VerificationStatus, BookingStatus, ReportStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalGirls,
      totalCustomers,
      totalPosts,
      totalReviews,
      totalBookings,
      totalRevenue,
      pendingPosts,
      pendingReviews,
      pendingVerifications,
      pendingReports,
      activeUsers,
      completedBookings,
    ] = await Promise.all([
      // Total counts
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'GIRL' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.post.count(),
      this.prisma.review.count(),
      this.prisma.booking.count(),
      this.prisma.payment.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Pending items
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
      this.prisma.girl.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),

      // Active stats
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    ]);

    // Get recent activities
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            fullName: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Get monthly revenue trend (last 12 months)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const monthlyRevenue = await this.prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: {
          gte: lastYear,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      overview: {
        totalUsers,
        totalGirls,
        totalCustomers,
        totalPosts,
        totalReviews,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers,
        completedBookings,
      },
      pending: {
        posts: pendingPosts,
        reviews: pendingReviews,
        verifications: pendingVerifications,
        reports: pendingReports,
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings,
      },
      trends: {
        monthlyRevenue,
      },
    };
  }

  async getPendingPosts(page = 1, limit = 20) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: PostStatus.PENDING },
        include: {
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingReviews(page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { status: ReviewStatus.PENDING },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingVerifications(page = 1, limit = 20) {
    const [girls, total] = await Promise.all([
      this.prisma.girl.findMany({
        where: { verificationStatus: VerificationStatus.PENDING },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { verificationRequestedAt: 'asc' },
      }),
      this.prisma.girl.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    ]);

    return {
      data: girls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReports(filters?: {
    status?: ReportStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = filters || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          reportedPost: {
            select: {
              id: true,
              title: true,
            },
          },
          reportedReview: {
            select: {
              id: true,
              title: true,
            },
          },
          resolvedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async processReport(reportId: string, adminId: string, action: 'RESOLVED' | 'DISMISSED', notes?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action,
        resolvedById: adminId,
        resolvedAt: new Date(),
        adminNotes: notes,
      },
    });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllUsers(filters?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { role, isActive, page = 1, limit = 20 } = filters || {};

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        girl: {
          include: {
            posts: { take: 10, orderBy: { createdAt: 'desc' } },
            reviews: { take: 10, orderBy: { createdAt: 'desc' } },
            bookings: { take: 10, orderBy: { createdAt: 'desc' } },
            _count: {
              select: {
                posts: true,
                reviews: true,
                bookings: true,
                favorites: true,
              },
            },
          },
        },
        bookingsAsCustomer: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviewsAsCustomer: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bookingsAsCustomer: true,
            reviewsAsCustomer: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
    });

    return user;
  }
}

