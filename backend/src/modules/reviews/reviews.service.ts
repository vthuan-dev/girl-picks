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
  private hasParentIdColumn: boolean | null = null; // Cache kết quả check

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => GirlsService))
    private girlsService: GirlsService,
  ) {}

  /**
   * Kiểm tra xem cột parent_id có tồn tại trong database không
   * Cache kết quả để không phải check lại mỗi lần
   */
  private async checkParentIdColumnExists(): Promise<boolean> {
    if (this.hasParentIdColumn !== null) {
      console.log(`[ReviewsService] Using cached parent_id check result: ${this.hasParentIdColumn}`);
      return this.hasParentIdColumn; // Return cached result
    }

    try {
      // Kiểm tra xem cột parent_id có tồn tại không
      // Thử cả DATABASE() và tên database cụ thể
      let result = await this.prisma.$queryRaw<any[]>`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'review_comments'
          AND COLUMN_NAME = 'parent_id'
        LIMIT 1
      `;
      
      // Nếu không tìm thấy, thử với tên database cụ thể
      if (!result || result.length === 0) {
        console.log('[ReviewsService] Not found with DATABASE(), trying with explicit database name');
        result = await this.prisma.$queryRaw<any[]>`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'girl_pick_db'
            AND TABLE_NAME = 'review_comments'
            AND COLUMN_NAME = 'parent_id'
          LIMIT 1
        `;
      }
      
      const exists = result && result.length > 0;
      console.log(`[ReviewsService] Check parent_id column: ${exists ? 'EXISTS' : 'NOT EXISTS'}`);
      if (result && result.length > 0) {
        console.log(`[ReviewsService] Column details:`, JSON.stringify(result[0]));
      } else {
        console.log(`[ReviewsService] Query result:`, result);
      }
      
      this.hasParentIdColumn = exists;
      return this.hasParentIdColumn;
    } catch (error: any) {
      console.error('[ReviewsService] Error checking parent_id column:', error?.message || error);
      console.error('[ReviewsService] Error stack:', error?.stack);
      // Nếu lỗi khi check, assume không có để fallback
      this.hasParentIdColumn = false;
      return false;
    }
  }

  /**
   * Debug method để check cột parent_id (public để controller có thể gọi)
   */
  async checkParentIdColumnDebug() {
    // Reset cache để force check lại
    this.hasParentIdColumn = null;
    
    try {
      // Check bằng INFORMATION_SCHEMA với DATABASE()
      const infoSchemaResult1 = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'review_comments'
          AND COLUMN_NAME = 'parent_id'
        LIMIT 1
      `;

      // Check bằng INFORMATION_SCHEMA với tên database cụ thể
      const infoSchemaResult2 = await this.prisma.$queryRaw<any[]>`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'girl_pick_db'
          AND TABLE_NAME = 'review_comments'
          AND COLUMN_NAME = 'parent_id'
        LIMIT 1
      `;

      // Check tất cả columns của table
      const allColumns = await this.prisma.$queryRaw<any[]>`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'review_comments'
        ORDER BY ORDINAL_POSITION
      `;

      // Check bằng method chính
      const methodResult = await this.checkParentIdColumnExists();

      return {
        success: true,
        hasParentIdColumn: (infoSchemaResult1 && infoSchemaResult1.length > 0) || (infoSchemaResult2 && infoSchemaResult2.length > 0),
        infoSchemaResult1: infoSchemaResult1 || [],
        infoSchemaResult2: infoSchemaResult2 || [],
        allColumns: allColumns.map((col: any) => col.COLUMN_NAME),
        methodResult: methodResult,
        cachedValue: this.hasParentIdColumn,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

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

    // Kiểm tra xem cột parent_id có tồn tại không
    const hasParentId = await this.checkParentIdColumnExists();
    
    // Nếu không có cột parent_id, dùng raw SQL để tránh Prisma Client lỗi
    if (!hasParentId) {
      try {
        const { randomUUID } = require('crypto');
        const commentId = randomUUID();
        const now = new Date();
        
        // Insert comment bằng raw SQL (không include parent_id)
        await this.prisma.$executeRaw`
          INSERT INTO review_comments (id, reviewId, userId, content, createdAt)
          VALUES (${commentId}, ${reviewId}, ${userId}, ${createReviewCommentDto.content}, ${now})
        `;
        
        // Lấy comment vừa tạo với user info
        const newComment = await this.prisma.$queryRaw<any[]>`
          SELECT 
            rc.id,
            rc.reviewId,
            rc.userId,
            rc.content,
            rc.createdAt,
            u.id as user_id,
            u.fullName,
            u.avatarUrl
          FROM review_comments rc
          INNER JOIN users u ON rc.userId = u.id
          WHERE rc.id = ${commentId}
          LIMIT 1
        `;
        
        if (newComment && newComment.length > 0) {
          const comment = newComment[0];
          return {
            id: comment.id,
            reviewId: comment.reviewId,
            userId: comment.userId,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
              id: comment.user_id,
              fullName: comment.fullName,
              avatarUrl: comment.avatarUrl,
            },
          };
        }
        
        throw new InternalServerErrorException('Failed to create comment');
      } catch (rawError: any) {
        console.error('Raw SQL create comment failed:', rawError);
        throw new InternalServerErrorException(
          'Failed to create comment. Please check database schema.'
        );
      }
    }

    // Nếu có cột parent_id, dùng Prisma Client bình thường
    const commentData: any = {
      reviewId,
      userId,
      content: createReviewCommentDto.content,
    };
    
    // Chỉ thêm parentId nếu có giá trị và không phải empty string
    if (createReviewCommentDto.parentId && createReviewCommentDto.parentId.trim() !== '') {
      commentData.parentId = createReviewCommentDto.parentId;
    }

    return await this.prisma.reviewComment.create({
      data: commentData,
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

      // Kiểm tra xem cột parent_id có tồn tại không
      const hasParentId = await this.checkParentIdColumnExists();
      
      let comments: any[];
      let total: number;

      // Nếu không có cột parent_id, dùng raw SQL
      if (!hasParentId) {
        try {
          const [commentsData, totalCount] = await Promise.all([
            this.prisma.$queryRaw<any[]>`
              SELECT 
                rc.id,
                rc.reviewId,
                rc.userId,
                rc.content,
                rc.createdAt,
                u.id as user_id,
                u.fullName,
                u.avatarUrl
              FROM review_comments rc
              INNER JOIN users u ON rc.userId = u.id
              WHERE rc.reviewId = ${reviewId}
              ORDER BY rc.createdAt DESC
              LIMIT ${safeLimit}
              OFFSET ${(safePage - 1) * safeLimit}
            `,
            this.prisma.$queryRaw<[{ count: bigint }]>`
              SELECT COUNT(*) as count
              FROM review_comments
              WHERE reviewId = ${reviewId}
            `,
          ]);
          
          comments = commentsData.map((row: any) => ({
            id: row.id,
            reviewId: row.reviewId,
            userId: row.userId,
            content: row.content,
            createdAt: row.createdAt,
            user: {
              id: row.user_id,
              fullName: row.fullName,
              avatarUrl: row.avatarUrl,
            },
            replies: [],
            _count: {
              replies: 0,
            },
          }));
          
          total = Number(totalCount[0]?.count || 0);
        } catch (rawError: any) {
          console.error('Raw SQL get comments failed:', rawError);
          throw new InternalServerErrorException(
            'Failed to fetch comments. Please check database schema.'
          );
        }
      } else {
        // Nếu có cột parent_id, thử dùng Prisma Client, nếu lỗi thì fallback về raw SQL
        try {
          const whereClause: any = { reviewId, parentId: null };
          
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
              },
              orderBy: { createdAt: 'desc' },
              skip: (safePage - 1) * safeLimit,
              take: safeLimit,
            }),
            this.prisma.reviewComment.count({ 
              where: whereClause
            }),
          ]);
        } catch (prismaError: any) {
          // Nếu Prisma Client lỗi (có thể do schema mismatch), fallback về raw SQL
          const errorCode = prismaError?.code;
          const errorMessage = prismaError?.message || '';
          const isParentIdError = 
            errorCode === 'P2022' ||
            errorMessage.includes('parentId') || 
            errorMessage.includes('parent_id') || 
            errorMessage.includes('does not exist');
          
          if (isParentIdError) {
            console.warn('Prisma Client error, falling back to raw SQL. Error:', errorCode, errorMessage);
            // Reset cache để check lại lần sau
            this.hasParentIdColumn = null;
            
            // Dùng raw SQL
            const [commentsData, totalCount] = await Promise.all([
              this.prisma.$queryRaw<any[]>`
                SELECT 
                  rc.id,
                  rc.reviewId,
                  rc.userId,
                  rc.content,
                  rc.createdAt,
                  u.id as user_id,
                  u.fullName,
                  u.avatarUrl
                FROM review_comments rc
                INNER JOIN users u ON rc.userId = u.id
                WHERE rc.reviewId = ${reviewId}
                ORDER BY rc.createdAt DESC
                LIMIT ${safeLimit}
                OFFSET ${(safePage - 1) * safeLimit}
              `,
              this.prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*) as count
                FROM review_comments
                WHERE reviewId = ${reviewId}
              `,
            ]);
            
            comments = commentsData.map((row: any) => ({
              id: row.id,
              reviewId: row.reviewId,
              userId: row.userId,
              content: row.content,
              createdAt: row.createdAt,
              user: {
                id: row.user_id,
                fullName: row.fullName,
                avatarUrl: row.avatarUrl,
              },
              replies: [],
              _count: {
                replies: 0,
              },
            }));
            
            total = Number(totalCount[0]?.count || 0);
          } else {
            throw prismaError;
          }
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
