import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import type { UploadImageDto, UploadMultipleImagesDto } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  /**
   * Upload single image from URL
   * POST /api/upload/image
   */
  @Post('image')
  @Roles(UserRole.ADMIN, UserRole.GIRL, UserRole.STAFF_UPLOAD, UserRole.CUSTOMER)
  async uploadImage(@Body() dto: UploadImageDto) {
    return this.uploadService.uploadImageFromUrl(dto);
  }

  /**
   * Upload multiple images from URLs
   * POST /api/upload/images
   */
  @Post('images')
  @Roles(UserRole.ADMIN, UserRole.GIRL, UserRole.STAFF_UPLOAD, UserRole.CUSTOMER)
  async uploadMultipleImages(@Body() dto: UploadMultipleImagesDto) {
    return this.uploadService.uploadMultipleImagesFromUrls(dto);
  }

  /**
   * Delete image from Cloudinary
   * DELETE /api/upload/image/:publicId
   */
  @Delete('image/:publicId')
  @Roles(UserRole.ADMIN, UserRole.GIRL, UserRole.STAFF_UPLOAD, UserRole.CUSTOMER)
  async deleteImage(@Param('publicId') publicId: string) {
    return this.uploadService.deleteImage(publicId);
  }

  /**
   * Get optimized image URL
   * GET /api/upload/optimize/:publicId
   */
  @Get('optimize/:publicId')
  async getOptimizedUrl(
    @Param('publicId') publicId: string,
    @Query('width') width?: string,
    @Query('height') height?: string,
    @Query('quality') quality?: string,
    @Query('format') format?: 'auto' | 'jpg' | 'png' | 'webp',
  ) {
    return {
      url: this.uploadService.getOptimizedUrl(publicId, {
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        quality: quality === 'auto' ? 'auto' : quality ? parseInt(quality, 10) : 'auto',
        format: format || 'auto',
      }),
    };
  }
}


