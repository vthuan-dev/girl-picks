import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { UpdateServicePackageDto } from './dto/update-service-package.dto';

@Injectable()
export class ServicePackagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createServicePackageDto: CreateServicePackageDto) {
    // Get girl from user
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl) {
      throw new ForbiddenException('Only girls can create service packages');
    }

    return this.prisma.servicePackage.create({
      data: {
        ...createServicePackageDto,
        girlId: girl.id,
      },
    });
  }

  async findAll(girlId?: string, isActive?: boolean) {
    const where: any = {};

    if (girlId) {
      where.girlId = girlId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.servicePackage.findMany({
      where,
      include: {
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
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

  async findOne(id: string) {
    const servicePackage = await this.prisma.servicePackage.findUnique({
      where: { id },
      include: {
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!servicePackage) {
      throw new NotFoundException('Service package not found');
    }

    return servicePackage;
  }

  async update(id: string, userId: string, updateServicePackageDto: UpdateServicePackageDto) {
    const servicePackage = await this.findOne(id);

    // Check if user is the girl who owns this package
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== servicePackage.girlId) {
      throw new ForbiddenException('You can only update your own service packages');
    }

    return this.prisma.servicePackage.update({
      where: { id },
      data: updateServicePackageDto,
    });
  }

  async remove(id: string, userId: string) {
    const servicePackage = await this.findOne(id);

    // Check if user is the girl who owns this package
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== servicePackage.girlId) {
      throw new ForbiddenException('You can only delete your own service packages');
    }

    return this.prisma.servicePackage.delete({
      where: { id },
    });
  }
}

