import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AddImagesDto } from './dto/add-images.dto';
import { AlbumCategoriesService } from '../album-categories/album-categories.service';

@Injectable()
export class AlbumsService {
  constructor(
    private prisma: PrismaService,
    private albumCategoriesService: AlbumCategoriesService,
  ) {}

  async create(dto: CreateAlbumDto, userId: string) {
    if (!dto.images || dto.images.length === 0) {
      throw new Error('Album cần ít nhất 1 ảnh');
    }

    let categoryName = dto.category || null;
    if (dto.albumCategoryId) {
      const cat = await this.albumCategoriesService
        .findAll(false)
        .then((cats) => cats.find((c) => c.id === dto.albumCategoryId));
      if (!cat) {
        throw new NotFoundException('Danh mục album không tồn tại');
      }
      categoryName = cat.name;
    }

    const album = await this.prisma.album.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: categoryName,
        albumCategoryId: dto.albumCategoryId || null,
        tags: dto.tags || null,
        isPublic: dto.isPublic ?? true,
        coverUrl: dto.images[0],
        createdById: userId,
        images: {
          create: dto.images.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return album;
  }

  async addImages(albumId: string, dto: AddImagesDto) {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
    });
    if (!album) throw new NotFoundException('Album không tồn tại');

    await this.prisma.albumImage.createMany({
      data: dto.images.map((url, index) => ({
        albumId,
        url,
        sortOrder: index + 1000, // append later; simple large offset
      })),
    });

    const updated = await this.findOne(albumId);
    return updated;
  }

  async deleteAlbum(id: string) {
    const album = await this.prisma.album.findUnique({ where: { id } });
    if (!album) throw new NotFoundException('Album không tồn tại');
    await this.prisma.album.delete({ where: { id } });
    return { message: 'Đã xóa album' };
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.albumImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException('Ảnh không tồn tại');
    await this.prisma.albumImage.delete({ where: { id: imageId } });
    return { message: 'Đã xóa ảnh' };
  }

  async findAll(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isPublic: true };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.album.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { images: true },
          },
        },
      }),
      this.prisma.album.count({ where }),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        categoryRef: true,
      },
    });
    if (!album) throw new NotFoundException('Album không tồn tại');
    return album;
  }
}
