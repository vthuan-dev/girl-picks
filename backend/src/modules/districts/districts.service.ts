import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Injectable()
export class DistrictsService {
  constructor(private prisma: PrismaService) {}

  async create(createDistrictDto: CreateDistrictDto) {
    return this.prisma.district.create({
      data: createDistrictDto,
    });
  }

  async findAll(province?: string, isActive?: boolean) {
    const where: any = {};

    if (province) {
      where.province = province;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.district.findMany({
      where,
      orderBy: [{ province: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const district = await this.prisma.district.findUnique({
      where: { id },
    });

    if (!district) {
      throw new NotFoundException('District not found');
    }

    return district;
  }

  async findByProvince(province: string) {
    return this.prisma.district.findMany({
      where: {
        province,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getProvinces() {
    const districts = await this.prisma.district.findMany({
      where: {
        isActive: true,
      },
      select: {
        province: true,
      },
      distinct: ['province'],
      orderBy: {
        province: 'asc',
      },
    });

    return districts.map((d) => d.province);
  }

  async update(id: string, updateDistrictDto: UpdateDistrictDto) {
    await this.findOne(id);

    return this.prisma.district.update({
      where: { id },
      data: updateDistrictDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.district.delete({
      where: { id },
    });
  }
}

