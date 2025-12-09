import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Generate slug from name if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        description: createCategoryDto.description,
        order: createCategoryDto.order ?? 0,
        isActive: createCategoryDto.isActive ?? true,
      },
    });
  }

  async findAll(includeInactive: boolean = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const updateData: any = { ...updateCategoryDto };

    // Generate slug from name if name is updated and slug is not provided
    if (updateCategoryDto.name && !updateCategoryDto.slug) {
      updateData.slug = this.generateSlug(updateCategoryDto.name);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has posts
    const postCount = await this.prisma.post.count({
      where: { categoryId: id },
    });

    if (postCount > 0) {
      throw new Error(`Cannot delete category with ${postCount} posts. Please reassign posts first.`);
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }
}

