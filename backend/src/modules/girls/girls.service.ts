import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateGirlDto } from './dto/update-girl.dto';
import { VerificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class GirlsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    districts?: string[];
    rating?: number;
    verification?: VerificationStatus;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      districts,
      rating,
      verification,
      isFeatured,
      isPremium,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: any = {
      user: {
        isActive: true,
      },
    };

    if (districts && districts.length > 0) {
      where.districts = {
        hasSome: districts,
      };
    }

    if (rating) {
      where.ratingAverage = {
        gte: rating,
      };
    }

    if (verification) {
      where.verificationStatus = verification;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    const [girls, total] = await Promise.all([
      this.prisma.girl.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              posts: { where: { status: 'APPROVED' } },
              reviews: { where: { status: 'APPROVED' } },
              bookings: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { ratingAverage: 'desc' },
          { lastActiveAt: 'desc' },
        ],
      }),
      this.prisma.girl.count({ where }),
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

  async findOne(id: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
        posts: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackages: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
        _count: {
          select: {
            posts: { where: { status: 'APPROVED' } },
            reviews: { where: { status: 'APPROVED' } },
            bookings: true,
            favorites: true,
          },
        },
      },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    // Increment view count
    await this.prisma.girl.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return girl;
  }

  async findByUserId(userId: string) {
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            posts: true,
            reviews: { where: { status: 'APPROVED' } },
            bookings: true,
            favorites: true,
          },
        },
      },
    });

    if (!girl) {
      throw new NotFoundException('Girl profile not found');
    }

    return girl;
  }

  async update(userId: string, updateGirlDto: UpdateGirlDto) {
    const girl = await this.findByUserId(userId);

    return this.prisma.girl.update({
      where: { id: girl.id },
      data: updateGirlDto,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async requestVerification(userId: string, documents: string[], notes?: string) {
    const girl = await this.findByUserId(userId);

    if (girl.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Profile is already verified');
    }

    if (girl.verificationStatus === VerificationStatus.PENDING) {
      throw new BadRequestException('Verification request is already pending');
    }

    return this.prisma.girl.update({
      where: { id: girl.id },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        verificationDocuments: documents,
        verificationRequestedAt: new Date(),
      },
    });
  }

  async approveVerification(id: string, adminId: string) {
    const girl = await this.findOne(id);

    if (girl.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Already verified');
    }

    const updated = await this.prisma.girl.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        verificationVerifiedAt: new Date(),
      },
    });

    // TODO: Send notification
    return updated;
  }

  async rejectVerification(id: string, adminId: string, reason: string) {
    const girl = await this.findOne(id);

    const updated = await this.prisma.girl.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verificationDocuments: [],
      },
    });

    // TODO: Send notification with reason
    return updated;
  }

  async getAnalytics(userId: string) {
    const girl = await this.findByUserId(userId);

    const [bookingsCount, reviewsCount, postsCount, favoritesCount, earnings] = await Promise.all([
      this.prisma.booking.count({
        where: {
          girlId: girl.id,
          status: 'COMPLETED',
        },
      }),
      this.prisma.review.count({
        where: {
          girlId: girl.id,
          status: 'APPROVED',
        },
      }),
      this.prisma.post.count({
        where: {
          girlId: girl.id,
          status: 'APPROVED',
        },
      }),
      this.prisma.favorite.count({
        where: {
          girlId: girl.id,
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          girlId: girl.id,
          status: 'COMPLETED',
          paymentStatus: 'COMPLETED',
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    // Get bookings trend (last 12 months)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const bookingsTrend = await this.prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        girlId: girl.id,
        status: 'COMPLETED',
        bookingDate: {
          gte: lastYear,
        },
      },
      _count: true,
    });

    return {
      overview: {
        viewCount: girl.viewCount,
        bookingsCount,
        reviewsCount,
        postsCount,
        favoritesCount,
        ratingAverage: girl.ratingAverage,
        totalEarnings: earnings._sum.totalPrice || 0,
      },
      bookingsTrend,
    };
  }

  async updateRating(girlId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        girlId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const ratingAverage =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    return this.prisma.girl.update({
      where: { id: girlId },
      data: {
        ratingAverage,
        totalReviews,
      },
    });
  }
}

