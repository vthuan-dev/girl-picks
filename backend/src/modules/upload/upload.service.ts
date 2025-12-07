import { Injectable, BadRequestException } from '@nestjs/common';
import {
  uploadImageFromUrl,
  uploadMultipleImagesFromUrls,
  deleteImageFromCloudinary,
  getOptimizedImageUrl,
} from '../../common/utils/cloudinary.util';
import { isValidImageUrl } from '../../common/utils/image-downloader.util';

export interface UploadImageDto {
  url: string;
  folder?: string;
  publicId?: string;
}

export interface UploadMultipleImagesDto {
  urls: string[];
  folder?: string;
  publicIdPrefix?: string;
}

@Injectable()
export class UploadService {
  /**
   * Upload single image from URL to Cloudinary
   */
  async uploadImageFromUrl(dto: UploadImageDto) {
    if (!isValidImageUrl(dto.url)) {
      throw new BadRequestException('Invalid image URL');
    }

    try {
      const result = await uploadImageFromUrl(dto.url, {
        folder: dto.folder || 'girl-pick',
        publicId: dto.publicId,
      });

      return {
        success: true,
        data: {
          originalUrl: dto.url,
          cloudinaryUrl: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          optimizedUrl: getOptimizedImageUrl(result.publicId, {
            quality: 'auto',
            format: 'auto',
          }),
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to upload image: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload multiple images from URLs to Cloudinary
   */
  async uploadMultipleImagesFromUrls(dto: UploadMultipleImagesDto) {
    // Validate all URLs
    const invalidUrls = dto.urls.filter((url) => !isValidImageUrl(url));
    if (invalidUrls.length > 0) {
      throw new BadRequestException(
        `Invalid image URLs: ${invalidUrls.join(', ')}`,
      );
    }

    try {
      const results = await uploadMultipleImagesFromUrls(dto.urls, {
        folder: dto.folder || 'girl-pick',
        publicId: dto.publicIdPrefix,
      });

      return {
        success: true,
        data: results.map((result, index) => ({
          originalUrl: dto.urls[index],
          cloudinaryUrl: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          optimizedUrl: getOptimizedImageUrl(result.publicId, {
            quality: 'auto',
            format: 'auto',
          }),
        })),
        total: results.length,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to upload images: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string) {
    try {
      await deleteImageFromCloudinary(publicId);
      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to delete image: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get optimized image URL
   */
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  }) {
    return getOptimizedImageUrl(publicId, options || {});
  }
}

