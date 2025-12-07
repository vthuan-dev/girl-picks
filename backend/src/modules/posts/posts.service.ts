import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus, UserRole, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto, userRole: UserRole) {
    // Check if user is GIRL and get girl profile (optional)
    let girlId: string | undefined;
    if (userRole === UserRole.GIRL) {
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });
      if (girl) {
        girlId = girl.id;
      }
    }

    return (this.prisma.post.create as any)({
      data: {
        ...createPostDto,
        authorId: userId,
        girlId: girlId || createPostDto.girlId || null,
        status: PostStatus.PENDING,
        images: createPostDto.images || [],
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
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
      },
    });
  }

  async findAll(filters?: {
    status?: PostStatus;
    girlId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, girlId, page = 1, limit = 20 } = filters || {};

    const where: Prisma.PostWhereInput = {};

    // Only filter by status if explicitly provided
    // If status is undefined, don't filter (show all statuses)
    if (status !== undefined) {
      where.status = status;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    const [posts, total] = await Promise.all([
      (this.prisma.post.findMany as any)({
        where,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
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
      this.prisma.post.count({ where }),
    ]);

    // Get likes and comments count for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          (this.prisma as any).postLike.count({ where: { postId: post.id } }),
          (this.prisma as any).postComment.count({ where: { postId: post.id } }),
        ]);
        return {
          ...post,
          _count: {
            likes: likesCount,
            comments: commentsCount,
          },
        };
      }),
    );

    return {
      data: postsWithCounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await (this.prisma.post.findUnique as any)({
      where: { id },
      include: {
          author: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
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
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get likes and comments count
    const [likesCount, commentsCount] = await Promise.all([
      (this.prisma as any).postLike.count({ where: { postId: id } }),
      (this.prisma as any).postComment.count({ where: { postId: id } }),
    ]);

    return {
      ...post,
      _count: {
        likes: likesCount,
        comments: commentsCount,
      },
    };
  }

  async findByGirl(girlId: string, status?: PostStatus) {
    const where: Prisma.PostWhereInput = { girlId };

    if (status) {
      where.status = status;
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get likes and comments count for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          (this.prisma as any).postLike.count({ where: { postId: post.id } }),
          (this.prisma as any).postComment.count({ where: { postId: post.id } }),
        ]);
        return {
          ...post,
          _count: {
            likes: likesCount,
            comments: commentsCount,
          },
        };
      }),
    );

    return postsWithCounts;
  }

  async findMyPosts(userId: string, status?: PostStatus) {
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl) {
      throw new NotFoundException('Girl profile not found');
    }

    return this.findByGirl(girl.id, status);
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);

    // Check if user owns this post
    if ((post as any).authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Can only update pending posts
    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only update pending posts');
    }

    return (this.prisma.post.update as any)({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
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
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const post = await this.findOne(id);

    // Users can only delete their own posts, Admins can delete any
    if (userRole !== UserRole.ADMIN && (post as any).authorId !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async approve(id: string, adminId: string, notes?: string) {
    const post = await this.findOne(id);

    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only approve pending posts');
    }

    const updated = await (this.prisma.post.update as any)({
      where: { id },
      data: {
        status: PostStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        girl: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send notification to author
    try {
      await this.notificationsService.create(
        (updated as any).authorId,
        'POST_APPROVED',
        'Bài viết của bạn đã được duyệt',
        { postId: id, notes },
      );
    } catch (error) {
      console.error('Failed to send post approved notification:', error);
    }

    return updated;
  }

  async reject(id: string, adminId: string, reason: string) {
    const post = await this.findOne(id);

    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only reject pending posts');
    }

    const updated = await (this.prisma.post.update as any)({
      where: { id },
      data: {
        status: PostStatus.REJECTED,
        approvedById: adminId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        girl: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send notification to author
    try {
      await this.notificationsService.create(
        (updated as any).authorId,
        'POST_REJECTED',
        `Bài viết của bạn đã bị từ chối: ${reason}`,
        { postId: id, reason },
      );
    } catch (error) {
      console.error('Failed to send post rejected notification:', error);
    }

    return updated;
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.APPROVED) {
      throw new BadRequestException('Only approved posts can be liked');
    }

    const existing = await (this.prisma as any).postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      await (this.prisma as any).postLike.delete({
        where: { id: existing.id },
      });
      const likesCount = await (this.prisma as any).postLike.count({
        where: { postId },
      });
      return {
        liked: false,
        likesCount,
      };
    }

    await (this.prisma as any).postLike.create({
      data: {
        postId,
        userId,
      },
    });

    const likesCount = await (this.prisma as any).postLike.count({
      where: { postId },
    });

    return {
      liked: true,
      likesCount,
    };
  }

  async getLikes(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const likesCount = await (this.prisma as any).postLike.count({
      where: { postId },
    });

    return {
      postId,
      likesCount,
    };
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== PostStatus.APPROVED) {
      throw new BadRequestException('Only approved posts can be commented');
    }

    return (this.prisma as any).postComment.create({
      data: {
        postId,
        userId,
        content,
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

  async getComments(postId: string, page = 1, limit = 20) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const [comments, total] = await Promise.all([
      (this.prisma as any).postComment.findMany({
        where: { postId },
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
      (this.prisma as any).postComment.count({ where: { postId } }),
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
