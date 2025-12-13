import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChatSexGirlDto } from './dto/create-chat-sex-girl.dto';
import { UpdateChatSexGirlDto } from './dto/update-chat-sex-girl.dto';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';
import { Prisma } from '@prisma/client';

// Type assertion for Prisma client with ChatSexGirl
type PrismaWithChatSexGirl = PrismaService & {
  chatSexGirl: any;
  chatSexReview: any;
};

@Injectable()
export class ChatSexService {
  private prisma: PrismaWithChatSexGirl;

  constructor(prisma: PrismaService) {
    this.prisma = prisma as PrismaWithChatSexGirl;
  }

  async create(dto: CreateChatSexGirlDto, managedById: string) {
    // Generate slug từ name
    let slug: string | null = null;
    if (dto.name) {
      const baseSlug = generateSlug(dto.name);
      // Check existing slugs
      const existing = await this.prisma.chatSexGirl.findMany({
        where: { slug: { startsWith: baseSlug } },
        select: { slug: true },
      });
      const existingSlugs = existing.map((g) => g.slug).filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    // Lấy ảnh đầu tiên làm cover nếu chưa có
    const coverImage = dto.coverImage || dto.images?.[0] || null;

    const data: any = {
      name: dto.name,
      slug,
      title: dto.title,
      age: dto.age,
      bio: dto.bio,
      phone: dto.phone,
      zalo: dto.zalo,
      // telegram: dto.telegram, // Removed for privacy
      location: dto.location,
      province: dto.province,
      address: dto.address,
      price: dto.price,
      services: dto.services ? JSON.stringify(dto.services) : JSON.stringify([]),
      workingHours: dto.workingHours,
      images: dto.images ? JSON.stringify(dto.images) : JSON.stringify([]),
      coverImage,
      tags: dto.tags ? JSON.stringify(dto.tags) : JSON.stringify([]),
      isVerified: dto.isVerified ?? false,
      isFeatured: dto.isFeatured ?? false,
      isActive: dto.isActive ?? true,
      isAvailable: dto.isAvailable ?? true,
      rating: dto.rating,
      sourceUrl: dto.sourceUrl,
      managedBy: {
        connect: { id: managedById },
      },
    };

    return this.prisma.chatSexGirl.create({
      data,
      include: {
        managedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    province?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isVerified?: boolean;
  }) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        province,
        isActive,
        isFeatured,
        isVerified,
      } = options || {};

      const where: any = {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { zalo: { contains: search } },
            // { telegram: { contains: search } }, // Removed for privacy
            { bio: { contains: search } },
          ],
        }),
        ...(province && { province }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isVerified !== undefined && { isVerified }),
      };

      const [data, total] = await Promise.all([
        this.prisma.chatSexGirl.findMany({
          where,
          include: {
            managedBy: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { isFeatured: 'desc' },
            { viewCount: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        this.prisma.chatSexGirl.count({ where }),
      ]);

      // Parse JSON fields
      const parsedData = data.map((item: any) => {
        try {
          const { telegram, ...itemWithoutTelegram } = item; // Exclude telegram for privacy
          return {
            ...itemWithoutTelegram,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []),
            services: typeof item.services === 'string' ? JSON.parse(item.services) : (item.services || []),
            tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []),
            videos: typeof item.videos === 'string' ? JSON.parse(item.videos) : (item.videos || []),
          };
        } catch (error) {
          console.error('Error parsing JSON fields for item:', item.id, error);
          return {
            ...item,
            images: [],
            services: [],
            tags: [],
            videos: [],
          };
        }
      });

      return {
        data: parsedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in ChatSexService.findAll:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  async findOne(id: string) {
    const girl = await this.prisma.chatSexGirl.findUnique({
      where: { id },
      include: {
        managedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!girl) {
      throw new NotFoundException('Chat sex girl not found');
    }

    // Parse JSON fields
    try {
      const { telegram, ...girlWithoutTelegram } = girl; // Exclude telegram for privacy
      return {
        ...girlWithoutTelegram,
        images: typeof girl.images === 'string' ? JSON.parse(girl.images) : (girl.images || []),
        services: typeof girl.services === 'string' ? JSON.parse(girl.services) : (girl.services || []),
        tags: typeof girl.tags === 'string' ? JSON.parse(girl.tags) : (girl.tags || []),
        videos: typeof (girl as any).videos === 'string' ? JSON.parse((girl as any).videos) : ((girl as any).videos || []),
      };
    } catch (error) {
      console.error('Error parsing JSON fields for girl:', girl.id, error);
      return {
        ...girl,
        images: [],
        services: [],
        tags: [],
        videos: [],
      };
    }
  }

  async update(id: string, dto: UpdateChatSexGirlDto, managedById: string) {
    const existing = await this.prisma.chatSexGirl.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Chat sex girl not found');
    }

    // Generate slug mới nếu name thay đổi
    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      const baseSlug = generateSlug(dto.name);
      // Check existing slugs (excluding current record)
      const existingRecords = await this.prisma.chatSexGirl.findMany({
        where: {
          slug: { startsWith: baseSlug },
          id: { not: id },
        },
        select: { slug: true },
      });
      const existingSlugs = existingRecords.map((g) => g.slug).filter(Boolean) as string[];
      slug = generateUniqueSlug(baseSlug, existingSlugs);
    }

    const data: any = {
      ...(dto.name && { name: dto.name }),
      ...(slug && { slug }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.age !== undefined && { age: dto.age }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.zalo !== undefined && { zalo: dto.zalo }),
      // ...(dto.telegram !== undefined && { telegram: dto.telegram }), // Removed for privacy
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.province !== undefined && { province: dto.province }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.services !== undefined && {
        services: JSON.stringify(dto.services),
      }),
      ...(dto.workingHours !== undefined && {
        workingHours: dto.workingHours,
      }),
      ...(dto.images !== undefined && {
        images: JSON.stringify(dto.images),
      }),
      ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
      ...(dto.tags !== undefined && { tags: JSON.stringify(dto.tags) }),
      ...(dto.isVerified !== undefined && { isVerified: dto.isVerified }),
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      ...(dto.rating !== undefined && { rating: dto.rating }),
      ...(dto.sourceUrl !== undefined && { sourceUrl: dto.sourceUrl }),
    };

    return this.prisma.chatSexGirl.update({
      where: { id },
      data,
      include: {
        managedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async remove(id: string, managedById: string) {
    const existing = await this.prisma.chatSexGirl.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Chat sex girl not found');
    }

    await this.prisma.chatSexGirl.delete({
      where: { id },
    });

    return { message: 'Chat sex girl deleted successfully' };
  }

  async incrementViewCount(id: string) {
    return this.prisma.chatSexGirl.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async bulkCreate(
    dtos: CreateChatSexGirlDto[],
    managedById: string,
  ) {
    const results: any[] = [];
    const errors: Array<{ data: CreateChatSexGirlDto; error: string }> = [];

    for (const dto of dtos) {
      try {
        const result = await this.create(dto, managedById);
        results.push(result);
      } catch (error) {
        errors.push({
          data: dto,
          error: error.message,
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  // ==================== Review Methods ====================

  /**
   * Get reviews for a chat sex girl with pagination
   */
  async getReviews(
    girlId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.chatSexReview.findMany({
        where: {
          girlId,
          isApproved: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.chatSexReview.count({
        where: {
          girlId,
          isApproved: true,
          isActive: true,
        },
      }),
    ]);

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a review for a chat sex girl
   */
  async createReview(
    girlId: string,
    dto: any, // CreateChatSexReviewDto
    userId?: string,
  ) {
    // Check if girl exists
    const girl = await this.prisma.chatSexGirl.findUnique({
      where: { id: girlId },
    });

    if (!girl) {
      throw new NotFoundException('Chat sex girl not found');
    }

    // Check if user already reviewed (if logged in)
    if (userId) {
      const existingReview = await this.prisma.chatSexReview.findFirst({
        where: {
          girlId,
          userId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('You have already reviewed this girl');
      }
    }

    // Create review
    const review = await this.prisma.chatSexReview.create({
      data: {
        girlId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
        userName: dto.userName || 'Anonymous',
        isApproved: true, // Auto-approve for now
      },
    });

    // Update girl's average rating
    await this.updateAverageRating(girlId);

    return review;
  }

  /**
   * Update average rating for a chat sex girl
   */
  private async updateAverageRating(girlId: string) {
    const result = await this.prisma.chatSexReview.aggregate({
      where: {
        girlId,
        isApproved: true,
        isActive: true,
      },
      _avg: {
        rating: true,
      },
    });

    await this.prisma.chatSexGirl.update({
      where: { id: girlId },
      data: {
        rating: result._avg.rating || null,
      },
    });
  }
}

