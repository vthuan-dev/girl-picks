import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, girlId: string) {
    // Check if girl exists
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_girlId: {
          userId,
          girlId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already in favorites');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        girlId,
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

  async remove(userId: string, girlId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_girlId: {
          userId,
          girlId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favorite.delete({
      where: {
        userId_girlId: {
          userId,
          girlId,
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
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
            _count: {
              select: {
                posts: { where: { status: 'APPROVED' } },
                reviews: { where: { status: 'APPROVED' } },
                bookings: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async isFavorited(userId: string, girlId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_girlId: {
          userId,
          girlId,
        },
      },
    });

    return { isFavorited: !!favorite };
  }
}

