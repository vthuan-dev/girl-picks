import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus, ReviewStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchGirls(filters: {
    query?: string;
    districts?: string[];
    minRating?: number;
    maxPrice?: number;
    verification?: VerificationStatus;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      query,
      districts,
      minRating,
      maxPrice,
      verification,
      isFeatured,
      isPremium,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      user: {
        isActive: true,
      },
    };

    // Text search on user's full name and girl's bio
    if (query) {
      where.OR = [
        {
          user: {
            fullName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          bio: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // District filter
    if (districts && districts.length > 0) {
      where.districts = {
        hasSome: districts,
      };
    }

    // Rating filter
    if (minRating) {
      where.ratingAverage = {
        gte: minRating,
      };
    }

    // Price filter (check service packages)
    // if (maxPrice) {
    //   where.servicePackages = {
    //     some: {
    //       price: {
    //         lte: maxPrice,
    //       },
    //     },
    //   };
    // }

    // Verification status
    if (verification) {
      where.verificationStatus = verification;
    }

    // Featured/Premium
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
              avatarUrl: true,
            },
          },
          servicePackages: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 3,
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
          { isPremium: 'desc' },
          { ratingAverage: 'desc' },
          { totalReviews: 'desc' },
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

  async searchPosts(query: string, page = 1, limit = 20) {
    const where: any = {
      status: PostStatus.APPROVED,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };

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

  async searchReviews(query: string, page = 1, limit = 20) {
    const where: any = {
      status: ReviewStatus.APPROVED,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };

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

  async globalSearch(query: string, page = 1, limit = 10) {
    // Search across multiple entities
    const [girls, posts, reviews] = await Promise.all([
      this.searchGirls({ query, page, limit }),
      this.searchPosts(query, page, limit),
      this.searchReviews(query, page, limit),
    ]);

    return {
      girls: girls.data,
      posts: posts.data,
      reviews: reviews.data,
      meta: {
        girlsTotal: girls.meta.total,
        postsTotal: posts.meta.total,
        reviewsTotal: reviews.meta.total,
      },
    };
  }
}

