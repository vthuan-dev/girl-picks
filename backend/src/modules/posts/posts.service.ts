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
import { PostStatus, UserRole, Prisma, NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: string,
    createPostDto: CreatePostDto,
    userRole: UserRole,
  ) {
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

    // Generate slug from title
    const baseSlug = generateSlug(createPostDto.title);
    const existingPosts = await this.prisma.post.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const existingSlugs = existingPosts
      .map((p) => p.slug)
      .filter(Boolean) as string[];
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    return (this.prisma.post.create as any)({
      data: {
        ...createPostDto,
        slug,
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
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, girlId, categoryId, page = 1, limit = 20 } = filters || {};

    const where: Prisma.PostWhereInput = {};

    // Only filter by status if explicitly provided
    // If status is undefined, don't filter (show all statuses)
    if (status !== undefined) {
      where.status = status;
    }

    if (girlId) {
      where.girlId = girlId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
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
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
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
          (this.prisma as any).postComment.count({
            where: { postId: post.id },
          }),
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

  async findOne(idOrSlug: string, incrementView: boolean = true) {
    // Try to find by ID first, then by slug
    const post = await (this.prisma.post.findFirst as any)({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
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

    // Increment view count if requested
    if (incrementView) {
      await this.incrementViewCount(post.id);
    }

    // Get likes and comments count
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
  }

  async incrementViewCount(id: string) {
    await this.prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
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
          (this.prisma as any).postComment.count({
            where: { postId: post.id },
          }),
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
    const where: Prisma.PostWhereInput = {
      authorId: userId,
    };

    if (status !== undefined) {
      where.status = status;
    }

    const posts = await (this.prisma.post.findMany as any)({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get likes and comments count for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          (this.prisma as any).postLike.count({ where: { postId: post.id } }),
          (this.prisma as any).postComment.count({
            where: { postId: post.id },
          }),
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

    // Generate slug if title changed
    let slug: string | undefined;
    if (updatePostDto.title && updatePostDto.title !== post.title) {
      const baseSlug = generateSlug(updatePostDto.title);
      const existingPosts = await this.prisma.post.findMany({
        where: {
          slug: { startsWith: baseSlug },
          NOT: { id },
        },
        select: { slug: true },
      });
      const existingSlugs = existingPosts
        .map((p) => p.slug)
        .filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    return (this.prisma.post.update as any)({
      where: { id },
      data: {
        ...updatePostDto,
        ...(slug && { slug }),
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

  async delete(id: string, userId: string, userRole: UserRole) {
    const post = await this.findOne(id);

    // Users can only delete their own posts, Admins/Staff can delete any
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.STAFF_UPLOAD &&
      (post as any).authorId !== userId
    ) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async updateAsAdmin(
    id: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ) {
    const post = await this.findOne(id);

    // Generate slug if title changed
    let slug: string | undefined;
    if (updatePostDto.title && updatePostDto.title !== post.title) {
      const baseSlug = generateSlug(updatePostDto.title);
      const existingPosts = await this.prisma.post.findMany({
        where: {
          slug: { startsWith: baseSlug },
          NOT: { id },
        },
        select: { slug: true },
      });
      const existingSlugs = existingPosts
        .map((p) => p.slug)
        .filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Admin/Staff can update any post, regardless of status
    return (this.prisma.post.update as any)({
      where: { id },
      data: {
        ...updatePostDto,
        ...(slug && { slug }),
        images:
          updatePostDto.images !== undefined ? updatePostDto.images : undefined,
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

  async deleteAsAdmin(id: string, userId: string) {
    const post = await this.findOne(id);

    // Admin/Staff can delete any post
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
    parentId?: string,
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

    // If parentId provided, verify it exists and belongs to same post
    let parentCommentUserId: string | null = null;
    if (parentId) {
      const parentComment = await (this.prisma as any).postComment.findUnique({
        where: { id: parentId },
        select: {
          postId: true,
          userId: true,
        },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parentComment.postId !== postId) {
        throw new BadRequestException(
          'Parent comment does not belong to this post',
        );
      }
      parentCommentUserId = parentComment.userId;
    }

    const newComment = await (this.prisma as any).postComment.create({
      data: {
        postId,
        userId,
        content,
        parentId: parentId || null,
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

    // Send notification to parent comment author if this is a reply
    if (parentId && parentCommentUserId && parentCommentUserId !== userId) {
      try {
        const post = await this.prisma.post.findUnique({
          where: { id: postId },
          select: { title: true },
        });
        await this.notificationsService.create(
          parentCommentUserId,
          NotificationType.COMMENT_REPLY,
          `${newComment.user.fullName} đã trả lời bình luận của bạn`,
          {
            postId,
            postTitle: post?.title,
            commentId: newComment.id,
            parentCommentId: parentId,
          },
        );
      } catch (error) {
        console.error('Failed to send comment reply notification:', error);
      }
    }

    return newComment;
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get only top-level comments (no parentId)
    const [comments, total] = await Promise.all([
      (this.prisma as any).postComment.findMany({
        where: {
          postId,
          parentId: null, // Only top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).postComment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ]);

    // Get total comments count (including replies)
    const totalAll = await (this.prisma as any).postComment.count({
      where: { postId },
    });

    return {
      data: comments,
      meta: {
        total,
        totalAll,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReplies(commentId: string, page = 1, limit = 10) {
    const comment = await (this.prisma as any).postComment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const [replies, total] = await Promise.all([
      (this.prisma as any).postComment.findMany({
        where: { parentId: commentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma as any).postComment.count({
        where: { parentId: commentId },
      }),
    ]);

    return {
      data: replies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
