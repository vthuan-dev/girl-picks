import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../common/utils/password.util';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CrawlerService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) { }

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
    uploadToCloudinary?: boolean; // Option to upload images to Cloudinary
  }) {
    try {
      let finalImages = data.images;

      // Upload images to Cloudinary if requested
      if (data.uploadToCloudinary && data.images.length > 0) {
        try {
          const uploadResult = await this.uploadService.uploadMultipleImagesFromUrls({
            urls: data.images,
            folder: 'girl-pick/girls',
            publicIdPrefix: `girl-${data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
          });
          finalImages = uploadResult.data.map((item) => item.url);
          console.log(`✅ Uploaded ${uploadResult.total} images to Cloudinary for ${data.name}`);
        } catch (uploadError) {
          console.error('⚠️ Failed to upload images to Cloudinary, using original URLs:', uploadError);
          // Fallback to original URLs if upload fails
        }
      }

      // Check if girl already exists by name
      const existingGirl = await this.prisma.girl.findFirst({
        where: {
          name: data.name,
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
            images: finalImages,
            bio: data.bio || existingGirl.bio,
            age: data.age || existingGirl.age,
            ratingAverage: data.rating || existingGirl.ratingAverage,
            totalReviews: data.totalReviews || existingGirl.totalReviews,
            verificationStatus: data.verified ? 'VERIFIED' : existingGirl.verificationStatus,
            isActive: data.isAvailable !== undefined ? data.isAvailable : existingGirl.isActive,
            tags: (data.tags && data.tags.length > 0 ? data.tags : existingGirl.tags) as string[] | undefined,
            location: data.location || existingGirl.location,
            province: data.province || existingGirl.province,
            price: data.price || existingGirl.price,
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
          images: finalImages, // Use Cloudinary URLs if uploaded
          bio: data.bio,
          age: data.age,
          ratingAverage: data.rating || 0,
          totalReviews: data.totalReviews || 0,
          verificationStatus: data.verified ? 'VERIFIED' : 'PENDING',
          isActive: data.isAvailable !== false,
          tags: data.tags || [],
          location: data.location,
          province: data.province,
          price: data.price,
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

