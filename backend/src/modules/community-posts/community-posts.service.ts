import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { CreateCommunityPostCommentDto } from './dto/create-community-post-comment.dto';
import { PostStatus, UserRole, Prisma, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommunityPostsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreateCommunityPostDto, userRole: UserRole) {
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

    return this.prisma.communityPost.create({
      data: {
        authorId: userId,
        girlId: girlId || createPostDto.girlId || null,
        title: createPostDto.title || null,
        content: createPostDto.content,
        images: createPostDto.images || [],
        status: PostStatus.PENDING,
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
    status?: PostStatus;
    girlId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, girlId, page = 1, limit = 20 } = filters || {};

    const where: Prisma.CommunityPostWhereInput = {};

    // If status is undefined, default to APPROVED for public access
    if (status !== undefined) {
      where.status = status;
    } else {
      // Public access: only show approved posts
      where.status = PostStatus.APPROVED;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.communityPost.count({ where }),
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

  async findOne(id: string, incrementView: boolean = true) {
    const post = await this.prisma.communityPost.findUnique({
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (incrementView) {
      await this.prisma.communityPost.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return post;
  }

  async findMyPosts(userId: string, status?: PostStatus) {
    const where: Prisma.CommunityPostWhereInput = { authorId: userId };

    if (status) {
      where.status = status;
    }

    return this.prisma.communityPost.findMany({
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

  async update(id: string, userId: string, updatePostDto: UpdateCommunityPostDto) {
    const post = await this.findOne(id, false);

    // Check if user owns this post
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    // Can only update pending posts
    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only update pending posts');
    }

    const updateData: any = {
      ...updatePostDto,
    };
    
    // Only update images if provided
    if (updatePostDto.images !== undefined) {
      updateData.images = updatePostDto.images;
    }

    return this.prisma.communityPost.update({
      where: { id },
      data: updateData,
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const post = await this.findOne(id, false);

    // Only author or admin can delete
    if (post.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.communityPost.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  async approve(id: string, adminId: string, notes?: string) {
    const post = await this.findOne(id, false);

    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only approve pending posts');
    }

    const updated = await this.prisma.communityPost.update({
      where: { id },
      data: {
        status: PostStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: {
        author: true,
      },
    });

    // Send notification
    try {
      await this.notificationsService.create(
        updated.authorId,
        NotificationType.POST_APPROVED,
        'Bài viết của bạn đã được duyệt',
        { postId: id, notes },
      );
    } catch (error) {
      console.error('Failed to send post approved notification:', error);
    }

    return updated;
  }

  async reject(id: string, adminId: string, reason: string) {
    const post = await this.findOne(id, false);

    if (post.status !== PostStatus.PENDING) {
      throw new BadRequestException('Can only reject pending posts');
    }

    const updated = await this.prisma.communityPost.update({
      where: { id },
      data: {
        status: PostStatus.REJECTED,
        approvedById: adminId,
      },
      include: {
        author: true,
      },
    });

    // Send notification
    try {
      await this.notificationsService.create(
        updated.authorId,
        NotificationType.POST_REJECTED,
        `Bài viết của bạn đã bị từ chối: ${reason}`,
        { postId: id, reason },
      );
    } catch (error) {
      console.error('Failed to send post rejected notification:', error);
    }

    return updated;
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.status !== PostStatus.APPROVED) {
      throw new BadRequestException('Only approved posts can be liked');
    }

    const existing = await this.prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.communityPostLike.delete({
        where: { id: existing.id },
      });
      const likesCount = await this.prisma.communityPostLike.count({
        where: { postId },
      });
      return {
        liked: false,
        likesCount,
      };
    }

    await this.prisma.communityPostLike.create({
      data: {
        postId,
        userId,
      },
    });

    const likesCount = await this.prisma.communityPostLike.count({
      where: { postId },
    });

    return {
      liked: true,
      likesCount,
    };
  }

  async getLikes(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    const likesCount = await this.prisma.communityPostLike.count({
      where: { postId },
    });

    return {
      postId,
      likesCount,
    };
  }

  async getLikeStatus(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    const [likesCount, existing] = await Promise.all([
      this.prisma.communityPostLike.count({ where: { postId } }),
      this.prisma.communityPostLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      }),
    ]);

    return {
      liked: Boolean(existing),
      likesCount,
    };
  }

  /**
   * Get interactions (likes or comments) of current user on community posts
   */
  async getUserInteractions(userId: string, type: 'likes' | 'comments' = 'likes') {
    if (type === 'comments') {
      const comments = await this.prisma.communityPostComment.findMany({
        where: { userId },
        include: {
          post: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Distinct by postId so mỗi bài xuất hiện 1 lần
      const seen = new Set<string>();
      return comments
        .filter((c) => {
          if (seen.has(c.postId)) return false;
          seen.add(c.postId);
          return true;
        })
        .map((c) => {
          const post: any = c.post;
          const images: string[] = Array.isArray(post.images) ? post.images : [];
          const girlName =
            post.girl?.name ||
            post.girl?.user?.fullName ||
            null;

          return {
            id: c.id,
            postId: c.postId,
            postTitle: post.title || post.content?.slice(0, 80) || 'Bài viết cộng đồng',
            girlName,
            previewImage: images[0] || null,
            type: 'comments' as const,
            createdAt: c.createdAt,
          };
        });
    }

    // Default: likes
    const likes = await this.prisma.communityPostLike.findMany({
      where: { userId },
      include: {
        post: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likes.map((l) => {
      const post: any = l.post;
      const images: string[] = Array.isArray(post.images) ? post.images : [];
      const girlName =
        post.girl?.name ||
        post.girl?.user?.fullName ||
        null;

      return {
        id: l.id,
        postId: l.postId,
        postTitle: post.title || post.content?.slice(0, 80) || 'Bài viết cộng đồng',
        girlName,
        previewImage: images[0] || null,
        type: 'likes' as const,
        createdAt: l.createdAt,
      };
    });
  }

  async addComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommunityPostCommentDto,
  ) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.status !== PostStatus.APPROVED) {
      throw new BadRequestException('Only approved posts can be commented');
    }

    // If parentId exists, verify parent comment belongs to this post
    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.communityPostComment.findUnique({
        where: { id: createCommentDto.parentId },
        select: { id: true, postId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
    }

    return this.prisma.communityPostComment.create({
      data: {
        postId,
        userId,
        content: createCommentDto.content,
        parentId: createCommentDto.parentId || null,
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
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    const safeLimit = Math.min(Math.max(limit || 20, 1), 50);
    const safePage = Math.max(page || 1, 1);

    // Get top-level comments (no parent)
    const [topLevelComments, total] = await Promise.all([
      this.prisma.communityPostComment.findMany({
        where: {
          postId,
          parentId: null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.communityPostComment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ]);

    // Get replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await this.prisma.communityPostComment.findMany({
          where: {
            parentId: comment.id,
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 10, // Limit replies per comment
        });

        // Get nested replies recursively
        const repliesWithNested = await Promise.all(
          replies.map(async (reply) => {
            const nestedReplies = await this.prisma.communityPostComment.findMany({
              where: {
                parentId: reply.id,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
                _count: {
                  select: {
                    replies: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
              take: 5, // Limit nested replies
            });

            return {
              ...reply,
              replies: nestedReplies,
            };
          }),
        );

        return {
          ...comment,
          replies: repliesWithNested,
        };
      }),
    );

    return {
      data: commentsWithReplies,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}

