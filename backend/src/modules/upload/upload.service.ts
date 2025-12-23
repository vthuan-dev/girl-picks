import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
// Dùng hàm đơn giản thay cho uuid để tránh thiếu module
const generateId = () => Date.now() + '-' + Math.round(Math.random() * 1e9);

export interface UploadImageDto {
  url: string; // Đây là chuỗi Base64 gửi từ Frontend
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
  private readonly uploadPath = join(process.cwd(), 'public', 'uploads');

  constructor() {
    // Đảm bảo thư mục uploads tồn tại
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Upload single image from Base64 to Local Storage
   */
  async uploadImageFromUrl(dto: UploadImageDto) {
    if (!dto.url || !dto.url.startsWith('data:image/')) {
      throw new BadRequestException('Invalid image data. Base64 expected.');
    }

    try {
      const folder = dto.folder || 'posts';
      const fullFolderPath = join(this.uploadPath, folder);

      if (!existsSync(fullFolderPath)) {
        mkdirSync(fullFolderPath, { recursive: true });
      }

      // Trích xuất thông tin từ base64
      const matches = dto.url.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string format');
      }

      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const base64Data = matches[2];
      const filename = `${dto.publicId || generateId()}.${extension}`;
      const filePath = join(fullFolderPath, filename);

      // Lưu file
      writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      const relativeUrl = `/public/uploads/${folder}/${filename}`;

      return {
        success: true,
        data: {
          originalUrl: dto.url.substring(0, 100) + '...',
          url: relativeUrl, // URL để Frontend sử dụng
          path: filePath,
          filename: filename,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to save image locally: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImagesFromUrls(dto: UploadMultipleImagesDto) {
    const results = await Promise.all(
      dto.urls.map((url) => this.uploadImageFromUrl({ url, folder: dto.folder })),
    );

    return {
      success: true,
      data: results.map((r) => r.data),
      total: results.length,
    };
  }

  /**
   * Delete image from Local Storage
   */
  async deleteImage(publicId: string) {
    // Logic xóa file nếu cần, tạm thời để trống hoặc thực hiện xóa cơ bản
    return {
      success: true,
      message: 'Local image delete functionality not fully implemented but bypassed',
    };
  }

  /**
   * Get URL (Mocking Cloudinary optimization for local)
   */
  getOptimizedUrl(url: string, options?: any) {
    return url; // Local storage doesn't support on-the-fly optimization like Cloudinary without extra libs
  }
}

