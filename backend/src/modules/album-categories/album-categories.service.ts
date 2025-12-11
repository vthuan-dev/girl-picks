import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumCategoryDto } from './dto/create-album-category.dto';

@Injectable()
export class AlbumCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlbumCategoryDto) {
    return this.prisma.albumCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  async findAll(activeOnly = true) {
    return this.prisma.albumCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }
}

