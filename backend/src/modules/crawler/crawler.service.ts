import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../common/utils/password.util';

@Injectable()
export class CrawlerService {
  constructor(private prisma: PrismaService) {}

  async saveGirl(data: {
    name: string;
    images: string[];
    bio?: string;
    location?: string;
    province?: string;
    rating?: number;
    totalReviews?: number;
    verified?: boolean;
    tags?: string[];
    age?: number;
    price?: string;
    isAvailable?: boolean;
    detailUrl?: string;
  }) {
    try {
      // Check if girl already exists by name and images
      const existingGirl = await this.prisma.girl.findFirst({
        where: {
          name: data.name,
          images: {
            has: data.images[0] || '',
          },
        },
        include: {
          user: true,
        },
      });

      if (existingGirl) {
        // Update existing girl
        const updatedGirl = await this.prisma.girl.update({
          where: { id: existingGirl.id },
          data: {
            name: data.name,
            images: data.images,
            bio: data.bio || existingGirl.bio,
            age: data.age || existingGirl.age,
            ratingAverage: data.rating || existingGirl.ratingAverage,
            totalReviews: data.totalReviews || existingGirl.totalReviews,
            verificationStatus: data.verified ? 'VERIFIED' : existingGirl.verificationStatus,
            isActive: data.isAvailable !== undefined ? data.isAvailable : existingGirl.isActive,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: 'Girl updated successfully',
          isNew: false,
          girl: updatedGirl,
        };
      }

      // Create new user for the girl
      const email = `crawled_${Date.now()}_${Math.random().toString(36).substring(7)}@crawler.local`;
      const password = await hashPassword('crawled_user_password_123');

      const user = await this.prisma.user.create({
        data: {
          email,
          password,
          fullName: data.name || 'Crawled User',
          role: 'GIRL',
          isActive: data.isAvailable !== false,
        },
      });

      // Create girl
      const girl = await this.prisma.girl.create({
        data: {
          userId: user.id,
          name: data.name,
          images: data.images,
          bio: data.bio,
          age: data.age,
          ratingAverage: data.rating || 0,
          totalReviews: data.totalReviews || 0,
          verificationStatus: data.verified ? 'VERIFIED' : 'PENDING',
          isActive: data.isAvailable !== false,
          districts: [], // Can be populated later based on location/province
        },
      });

      return {
        success: true,
        message: 'Girl saved successfully',
        isNew: true,
        girl,
      };
    } catch (error) {
      console.error('Error saving girl:', error);
      throw error;
    }
  }
}

