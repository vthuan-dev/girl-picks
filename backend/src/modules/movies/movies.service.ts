import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus, UserRole } from '@prisma/client';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    status?: PostStatus;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      status = PostStatus.APPROVED,
      categoryId,
      search,
      page = 1,
      limit = 24,
    } = params || {};

    const where: any = { status };
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).movie.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
        },
      }),
      (this.prisma as any).movie.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const movie = await (this.prisma as any).movie.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async findBySlug(slug: string) {
    const movie = await (this.prisma as any).movie.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }

  async getReviews(movieId: string, page = 1, limit = 10) {
    const movie = await (this.prisma as any).movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).movieReview.findMany({
        where: { movieId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          comments: {
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
      }),
      (this.prisma as any).movieReview.count({ where: { movieId } }),
    ]);

    const averageRating =
      total === 0
        ? 0
        : await (this.prisma as any).movieReview
            .aggregate({
              where: { movieId },
              _avg: { rating: true },
            })
            .then((r: any) => r._avg.rating || 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating,
    };
  }

  async createReview(
    movieId: string,
    userId: string,
    payload: {
      rating: number;
      comment?: string;
    },
  ) {
    const movie = await (this.prisma as any).movie.findUnique({
      where: { id: movieId },
      select: { id: true, status: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (movie.status !== PostStatus.APPROVED) {
      throw new ForbiddenException('Only approved movies can be reviewed');
    }

    if (payload.rating < 1 || payload.rating > 5) {
      throw new ForbiddenException('Rating must be between 1 and 5');
    }

    const review = await (this.prisma as any).movieReview.create({
      data: {
        movieId,
        userId,
        rating: payload.rating,
        comment: payload.comment || null,
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

    return review;
  }

  async getReviewComments(reviewId: string) {
    const review = await (this.prisma as any).movieReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get all comments for this review
    const allComments = await (this.prisma as any).movieReviewComment.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'asc' },
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

    // Build nested tree structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First pass: create map
    allComments.forEach((comment: any) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    allComments.forEach((comment: any) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return {
      data: rootComments,
      total: allComments.length,
    };
  }

  async createReviewComment(
    reviewId: string,
    userId: string,
    content: string,
    parentId?: string,
  ) {
    const review = await (this.prisma as any).movieReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!content || !content.trim()) {
      throw new ForbiddenException('Comment cannot be empty');
    }

    // Validate parentId if provided
    if (parentId) {
      const parentComment = await (
        this.prisma as any
      ).movieReviewComment.findUnique({
        where: { id: parentId },
        select: { id: true, reviewId: true },
      });

      if (!parentComment || parentComment.reviewId !== reviewId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await (this.prisma as any).movieReviewComment.create({
      data: {
        reviewId,
        userId,
        parentId: parentId || null,
        content: content.trim(),
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

    return comment;
  }

  async incrementViews(id: string) {
    const movie = await (this.prisma as any).movie.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return (this.prisma as any).movie.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  async create(
    userId: string,
    role: UserRole,
    data: {
      title: string;
      description?: string;
      videoUrl: string;
      poster?: string;
      thumbnail?: string;
      duration?: string;
      categoryId?: string;
      tags?: string[];
      status?: PostStatus;
    },
  ) {
    if (
      !([UserRole.ADMIN, UserRole.STAFF_UPLOAD] as UserRole[]).includes(role)
    ) {
      throw new ForbiddenException('You are not allowed to create movies');
    }

    const slugBase = this.generateSlug(data.title);
    const existing = await (this.prisma as any).movie.findMany({
      where: { slug: { startsWith: slugBase } },
      select: { slug: true },
    });
    const existingSlugs = existing
      .map((m) => m.slug)
      .filter(Boolean) as string[];
    const slug = this.generateUniqueSlug(slugBase, existingSlugs);

    return (this.prisma as any).movie.create({
      data: {
        title: data.title,
        description: data.description || '',
        videoUrl: data.videoUrl,
        poster: data.poster || null,
        thumbnail: data.thumbnail || null,
        duration: data.duration || null,
        categoryId: data.categoryId || null,
        tags: data.tags || [],
        status: data.status || PostStatus.APPROVED,
        slug,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    role: UserRole,
    data: {
      title?: string;
      description?: string;
      videoUrl?: string;
      poster?: string;
      thumbnail?: string;
      duration?: string;
      categoryId?: string;
      tags?: string[];
      status?: PostStatus;
    },
  ) {
    if (
      !([UserRole.ADMIN, UserRole.STAFF_UPLOAD] as UserRole[]).includes(role)
    ) {
      throw new ForbiddenException('You are not allowed to update movies');
    }

    const movie = await (this.prisma as any).movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    let slug: string | undefined;
    if (data.title && data.title !== movie.title) {
      const base = this.generateSlug(data.title);
      const existing = await (this.prisma as any).movie.findMany({
        where: {
          slug: { startsWith: base },
          NOT: { id },
        },
        select: { slug: true },
      });
      const existingSlugs = existing
        .map((m) => m.slug)
        .filter(Boolean) as string[];
      slug = this.generateUniqueSlug(base, existingSlugs);
    }

    return (this.prisma as any).movie.update({
      where: { id },
      data: {
        title: data.title ?? movie.title,
        description: data.description ?? movie.description,
        videoUrl: data.videoUrl ?? movie.videoUrl,
        poster: data.poster ?? movie.poster,
        thumbnail: data.thumbnail ?? movie.thumbnail,
        duration: data.duration ?? movie.duration,
        categoryId: data.categoryId ?? movie.categoryId,
        tags: data.tags ?? (movie.tags as any),
        status: data.status ?? movie.status,
        ...(slug && { slug }),
      },
    });
  }

  async delete(id: string, userId: string, role: UserRole) {
    if (
      !([UserRole.ADMIN, UserRole.STAFF_UPLOAD] as UserRole[]).includes(role)
    ) {
      throw new ForbiddenException('You are not allowed to delete movies');
    }

    const movie = await (this.prisma as any).movie.findUnique({
      where: { id },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return (this.prisma as any).movie.delete({
      where: { id },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateUniqueSlug(
    baseSlug: string,
    existingSlugs: string[],
  ): string {
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    let counter = 2;
    let newSlug = `${baseSlug}-${counter}`;
    while (existingSlugs.includes(newSlug)) {
      counter += 1;
      newSlug = `${baseSlug}-${counter}`;
    }
    return newSlug;
  }
}
