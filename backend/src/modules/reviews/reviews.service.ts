import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Prisma, ReviewStatus, UserRole, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { GirlsService } from '../girls/girls.service';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => GirlsService))
    private girlsService: GirlsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { girlId, ...reviewData } = createReviewDto;

    // Check if girl exists
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    // Optional: Check if user has completed booking with this girl
    // const hasCompletedBooking = await this.prisma.booking.findFirst({
    //   where: {
    //     customerId: userId,
    //     girlId,
    //     status: 'COMPLETED',
    //   },
    // });

    // if (!hasCompletedBooking) {
    //   throw new BadRequestException('You can only review girls you have booked');
    // }

    return this.prisma.review.create({
      data: {
        ...reviewData,
        customerId: userId,
        girlId,
        status: ReviewStatus.PENDING,
        images: reviewData.images || [],
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: ReviewStatus;
    girlId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, girlId, customerId, page = 1, limit = 20 } = filters || {};

    const where: Prisma.ReviewWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          girl: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          approvedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.review.count({ where }),
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

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findByGirl(girlId: string, status?: ReviewStatus) {
    const where: Prisma.ReviewWhereInput = { girlId };

    if (status) {
      where.status = status;
    }

    return this.prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMyReviews(userId: string, status?: ReviewStatus) {
    const where: Prisma.ReviewWhereInput = { customerId: userId };

    if (status) {
      where.status = status;
    }

    return this.prisma.review.findMany({
      where,
      include: {
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    // Check if user owns this review
    if (review.customerId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Can only update pending reviews
    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Can only update pending reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
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
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const review = await this.findOne(id);

    // Customers can only delete their own reviews, Admins can delete any
    if (userRole !== UserRole.ADMIN && review.customerId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async approve(id: string, adminId: string, notes?: string) {
    const review = await this.findOne(id);

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Can only approve pending reviews');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        status: ReviewStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: {
        customer: true,
        girl: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update girl rating
    try {
      await this.girlsService.updateRating(review.girlId);
    } catch (error) {
      console.error('Failed to update girl rating:', error);
    }

    // Send notification to customer
    try {
      await this.notificationsService.create(
        updated.customerId,
        NotificationType.REVIEW_APPROVED,
        'Review của bạn đã được duyệt',
        { reviewId: id, notes },
      );
    } catch (error) {
      console.error('Failed to send review approved notification:', error);
    }

    // Send notification to girl (if girl has userId)
    try {
      if (updated.girl.userId) {
        await this.notificationsService.create(
          updated.girl.userId,
          NotificationType.REVIEW_APPROVED,
          'Bạn có review mới',
          { reviewId: id, rating: updated.rating },
        );
      }
    } catch (error) {
      console.error('Failed to send review notification to girl:', error);
    }

    return updated;
  }

  async reject(id: string, adminId: string, reason: string) {
    const review = await this.findOne(id);

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Can only reject pending reviews');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        status: ReviewStatus.REJECTED,
        approvedById: adminId,
      },
      include: {
        customer: true,
      },
    });

    // Send notification
    try {
      await this.notificationsService.create(
        updated.customerId,
        'REVIEW_REJECTED',
        `Review của bạn đã bị từ chối: ${reason}`,
        { reviewId: id, reason },
      );
    } catch (error) {
      console.error('Failed to send review rejected notification:', error);
    }

    return updated;
  }

  async toggleLike(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { status: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.status !== ReviewStatus.APPROVED) {
      throw new BadRequestException('Only approved reviews can be liked');
    }

    const existing = await this.prisma.reviewLike.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.reviewLike.delete({
        where: { id: existing.id },
      });
      const likesCount = await this.prisma.reviewLike.count({
        where: { reviewId },
      });
      return {
        liked: false,
        likesCount,
      };
    }

    await this.prisma.reviewLike.create({
      data: {
        reviewId,
        userId,
      },
    });

    const likesCount = await this.prisma.reviewLike.count({
      where: { reviewId },
    });

    return {
      liked: true,
      likesCount,
    };
  }

  async getLikes(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const likesCount = await this.prisma.reviewLike.count({
      where: { reviewId },
    });

    return {
      reviewId,
      likesCount,
    };
  }

  async addComment(
    reviewId: string,
    userId: string,
    createReviewCommentDto: CreateReviewCommentDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { status: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.status !== ReviewStatus.APPROVED) {
      throw new BadRequestException('Only approved reviews can be commented');
    }

    return this.prisma.reviewComment.create({
      data: {
        reviewId,
        userId,
        content: createReviewCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getComments(reviewId: string, page = 1, limit = 20) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const [comments, total] = await Promise.all([
      this.prisma.reviewComment.findMany({
        where: { reviewId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.reviewComment.count({ where: { reviewId } }),
    ]);

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
