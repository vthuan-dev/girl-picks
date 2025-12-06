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

  async create(userId: string, createPostDto: CreatePostDto) {
    // Get girl from user
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl) {
      throw new ForbiddenException('Only girls can create posts');
    }

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        girlId: girl.id,
        status: PostStatus.PENDING,
        images: createPostDto.images || [],
      },
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

    if (status) {
      where.status = status;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
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

    return post;
  }

  async findByGirl(girlId: string, status?: PostStatus) {
    const where: Prisma.PostWhereInput = { girlId };

    if (status) {
      where.status = status;
    }

    return this.prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
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
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== post.girlId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Can only update pending posts
    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only update pending posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
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
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const post = await this.findOne(id);

    // Girls can only delete their own posts, Admins can delete any
    if (userRole !== UserRole.ADMIN) {
      const girl = await this.prisma.girl.findUnique({
        where: { userId },
      });

      if (!girl || girl.id !== post.girlId) {
        throw new ForbiddenException('You can only delete your own posts');
      }
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

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: {
        girl: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send notification
    try {
      await this.notificationsService.create(
        updated.girl.userId,
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

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.REJECTED,
        approvedById: adminId,
      },
      include: {
        girl: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send notification
    try {
      await this.notificationsService.create(
        updated.girl.userId,
        'POST_REJECTED',
        `Bài viết của bạn đã bị từ chối: ${reason}`,
        { postId: id, reason },
      );
    } catch (error) {
      console.error('Failed to send post rejected notification:', error);
    }

    return updated;
  }
}
