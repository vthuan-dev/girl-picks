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

@Injectable()
export class ChatSexService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChatSexGirlDto, managedById: string) {
    // Generate slug từ name
    const slug = dto.name
      ? await generateUniqueSlug(
          this.prisma.chatSexGirl,
          generateSlug(dto.name),
        )
      : null;

    // Lấy ảnh đầu tiên làm cover nếu chưa có
    const coverImage = dto.coverImage || dto.images?.[0] || null;

    const data: Prisma.ChatSexGirlCreateInput = {
      name: dto.name,
      slug,
      title: dto.title,
      age: dto.age,
      bio: dto.bio,
      phone: dto.phone,
      zalo: dto.zalo,
      telegram: dto.telegram,
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
    const {
      page = 1,
      limit = 20,
      search,
      province,
      isActive,
      isFeatured,
      isVerified,
    } = options || {};

    const where: Prisma.ChatSexGirlWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { zalo: { contains: search } },
          { telegram: { contains: search } },
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
    const parsedData = data.map((item) => ({
      ...item,
      images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
      services: typeof item.services === 'string' ? JSON.parse(item.services) : item.services,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
    }));

    return {
      data: parsedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    return {
      ...girl,
      images: typeof girl.images === 'string' ? JSON.parse(girl.images) : girl.images,
      services: typeof girl.services === 'string' ? JSON.parse(girl.services) : girl.services,
      tags: typeof girl.tags === 'string' ? JSON.parse(girl.tags) : girl.tags,
    };
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
      slug = await generateUniqueSlug(
        this.prisma.chatSexGirl,
        generateSlug(dto.name),
        id,
      );
    }

    const data: Prisma.ChatSexGirlUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(slug && { slug }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.age !== undefined && { age: dto.age }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.zalo !== undefined && { zalo: dto.zalo }),
      ...(dto.telegram !== undefined && { telegram: dto.telegram }),
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
    const results = [];
    const errors = [];

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
}

