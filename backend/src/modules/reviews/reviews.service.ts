import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
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

    // Nếu có parentId, kiểm tra parent comment có tồn tại không
    if (createReviewCommentDto.parentId) {
      const parentComment = await this.prisma.reviewComment.findUnique({
        where: { id: createReviewCommentDto.parentId },
        select: { id: true, reviewId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Đảm bảo parent comment thuộc cùng review
      if (parentComment.reviewId !== reviewId) {
        throw new BadRequestException('Parent comment does not belong to this review');
      }
    }

    return this.prisma.reviewComment.create({
      data: {
        reviewId,
        userId,
        content: createReviewCommentDto.content,
        ...(createReviewCommentDto.parentId && { parentId: createReviewCommentDto.parentId }),
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
    try {
      const review = await this.prisma.review.findUnique({
        where: { id: reviewId },
        select: { id: true },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Validate limit để tránh query quá lớn
      const safeLimit = Math.min(Math.max(limit || 20, 1), 50); // Max 50 comments per page
      const safePage = Math.max(page || 1, 1);

      // Thử query với parentId, nếu lỗi thì fallback về query không có parentId
      let whereClause: any = { reviewId, parentId: null };
      let includeReplies = true;
      
      let comments: any[];
      let total: number;

      try {
        // Thử query với parentId
        [comments, total] = await Promise.all([
          this.prisma.reviewComment.findMany({
            where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            ...(includeReplies ? {
              replies: {
                take: 10, // Limit số replies được load để tránh query quá lớn
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                  replies: {
                    take: 5, // Limit số replies của replies
                    include: {
                      user: {
                        select: {
                          id: true,
                          fullName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                    orderBy: {
                      createdAt: 'asc',
                    },
                  },
                },
                orderBy: {
                  createdAt: 'asc',
                },
              },
              _count: {
                select: {
                  replies: true,
                },
              },
            } : {}),
          },
          orderBy: { createdAt: 'desc' },
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
        }),
          this.prisma.reviewComment.count({ 
            where: whereClause
          }),
        ]);
      } catch (error: any) {
        // Nếu lỗi là column parentId không tồn tại, fallback về query không có parentId
        const errorCode = error?.code;
        const errorMessage = error?.message || '';
        const isParentIdError = 
          errorCode === 'P2022' || // Prisma error code for column does not exist
          errorMessage.includes('parentId') || 
          errorMessage.includes('parent_id') || 
          errorMessage.includes('does not exist') ||
          errorMessage.includes('Unknown column') ||
          errorMessage.includes('Unknown column \'parent_id\'') ||
          errorMessage.includes('Unknown column \'parentId\'');
        
        if (isParentIdError) {
          console.warn('parentId column does not exist, falling back to simple query. Error:', errorCode, errorMessage);
          whereClause = { reviewId };
          includeReplies = false;
          
          // Query lại không có parentId - dùng select thay vì include để tránh Prisma access parentId
          // và thêm replies: [] và _count: { replies: 0 } để giữ format response giống nhau
          try {
            const [commentsData, totalCount] = await Promise.all([
              this.prisma.reviewComment.findMany({
                where: whereClause,
                select: {
                  id: true,
                  reviewId: true,
                  userId: true,
                  content: true,
                  createdAt: true,
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                  // KHÔNG include replies hoặc _count vì chúng phụ thuộc vào parentId
                },
                orderBy: { createdAt: 'desc' },
                skip: (safePage - 1) * safeLimit,
                take: safeLimit,
              }),
              this.prisma.reviewComment.count({ 
                where: whereClause
              }),
            ]);
            
            // Map response để giữ format giống với query có replies
            comments = commentsData.map(comment => ({
              ...comment,
              replies: [], // Empty array vì không có parentId
              _count: {
                replies: 0,
              },
            }));
            total = totalCount;
          } catch (fallbackError: any) {
            // Nếu vẫn lỗi, có thể Prisma Client vẫn cố access parentId
            // Thử dùng raw query
            console.error('Fallback query also failed, trying raw query:', fallbackError);
            try {
              const rawComments = await this.prisma.$queryRaw<any[]>`
                SELECT 
                  rc.id,
                  rc.reviewId,
                  rc.userId,
                  rc.content,
                  rc.createdAt,
                  u.id as userId,
                  u.fullName,
                  u.avatarUrl
                FROM review_comments rc
                INNER JOIN users u ON rc.userId = u.id
                WHERE rc.reviewId = ${reviewId}
                ORDER BY rc.createdAt DESC
                LIMIT ${safeLimit}
                OFFSET ${(safePage - 1) * safeLimit}
              `;
              
              const rawTotal = await this.prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*) as count
                FROM review_comments
                WHERE reviewId = ${reviewId}
              `;
              
              comments = rawComments.map((row: any) => ({
                id: row.id,
                reviewId: row.reviewId,
                userId: row.userId,
                content: row.content,
                createdAt: row.createdAt,
                user: {
                  id: row.userId,
                  fullName: row.fullName,
                  avatarUrl: row.avatarUrl,
                },
                replies: [],
                _count: {
                  replies: 0,
                },
              }));
              
              total = Number(rawTotal[0]?.count || 0);
            } catch (rawError: any) {
              console.error('Raw query also failed:', rawError);
              throw new InternalServerErrorException(
                'Database schema mismatch: parentId column does not exist. Please run migrations: npx prisma migrate deploy'
              );
            }
          }
        } else {
          throw error;
        }
      }

      return {
        success: true,
        data: comments,
        meta: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
      };
    } catch (error) {
      console.error('Error fetching comments for review:', reviewId, error);
      // Nếu là NotFoundException thì throw lại
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Các lỗi khác thì throw InternalServerErrorException
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to fetch comments'
      );
    }
  }
}
