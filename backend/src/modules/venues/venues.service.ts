import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async create(createVenueDto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: createVenueDto,
    });
  }

  async findAll(districtId?: string, isActive?: boolean) {
    const where: any = {};

    if (districtId) {
      where.districtId = districtId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.venue.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto) {
    await this.findOne(id);

    return this.prisma.venue.update({
      where: { id },
      data: updateVenueDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.venue.delete({
      where: { id },
    });
  }

  async searchByLocation(latitude: number, longitude: number, radiusKm: number = 5) {
    // Simple distance calculation (Haversine formula would be better for production)
    // For now, return all active venues
    // In production, use PostGIS or calculate distance in application
    const venues = await this.prisma.venue.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // Calculate distance and filter
    const venuesWithDistance = venues
      .map((venue) => {
        if (!venue.latitude || !venue.longitude) return null;

        const distance = this.calculateDistance(
          latitude,
          longitude,
          venue.latitude,
          venue.longitude,
        );

        return {
          ...venue,
          distance,
        };
      })
      .filter((v) => v !== null && v.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return venuesWithDistance;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

