import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getImageBufferFromUrl } from '../../common/utils/image-downloader.util';
// Dùng hàm đơn giản thay cho uuid để tránh thiếu module
const generateId = () => Date.now() + '-' + Math.round(Math.random() * 1e9);

export interface UploadImageDto {
  url: string; // Có thể là Base64 hoặc URL tuyệt đối từ website khác
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
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    // Đảm bảo thư mục uploads tồn tại
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Upload single image from URL or Base64 to Local Storage
   */
  async uploadImageFromUrl(dto: UploadImageDto) {
    if (!dto || !dto.url) {
      throw new BadRequestException('Image data or URL is required.');
    }

    try {
      const folder = dto.folder || 'posts';
      // Tách folder theo dấu / và ghép lại bằng join để an toàn trên mọi OS
      const folderParts = folder.split('/');
      const fullFolderPath = join(this.uploadPath, ...folderParts);

      if (!existsSync(fullFolderPath)) {
        mkdirSync(fullFolderPath, { recursive: true });
      }

      let buffer: Buffer;
      let extension = 'jpg';

      if (dto.url.startsWith('data:image/')) {
        // Xử lý Base64
        const matches = dto.url.match(
          /^data:image\/([A-Za-z-+/]+);base64,(.+)$/,
        );
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 string format');
        }
        extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else if (dto.url.startsWith('http')) {
        // Xử lý Remote URL (cho Crawler)
        buffer = await getImageBufferFromUrl(dto.url);
        // Tự động lấy extension từ URL nếu có thể, mặc định là jpg
        const urlPart = dto.url.split('?')[0];
        const ext = urlPart.split('.').pop()?.toLowerCase();
        if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
          extension = ext === 'jpeg' ? 'jpg' : ext;
        }
      } else {
        throw new Error(
          'Unsupported image source format. Use Base64 or HTTP URL.',
        );
      }

      const filename = `${dto.publicId || generateId()}.${extension}`;
      const filePath = join(fullFolderPath, filename);

      // Lưu file
      writeFileSync(filePath, buffer);

      const relativeUrl = `/api/uploads/${folder}/${filename}`;

      return {
        originalUrl: dto.url.substring(0, 100) + '...',
        url: relativeUrl, // URL để Frontend sử dụng
        path: filePath,
        filename: filename,
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
      dto.urls.map((url) =>
        this.uploadImageFromUrl({ url, folder: dto.folder }),
      ),
    );

    return results;
  }

  /**
   * Delete image from Local Storage
   */
  async deleteImage(publicId: string) {
    // Logic xóa file nếu cần, tạm thời để trống hoặc thực hiện xóa cơ bản
    return {
      success: true,
      message:
        'Local image delete functionality not fully implemented but bypassed',
    };
  }

  /**
   * Upload video from Base64 to Local Storage
   */
  async uploadVideoFromBase64(dto: { url: string; folder?: string }) {
    if (!dto || !dto.url) {
      throw new BadRequestException('Video data is required.');
    }

    try {
      const folder = dto.folder || 'videos';
      const folderParts = folder.split('/');
      const fullFolderPath = join(this.uploadPath, ...folderParts);

      if (!existsSync(fullFolderPath)) {
        mkdirSync(fullFolderPath, { recursive: true });
      }

      let buffer: Buffer;
      let extension = 'mp4';

      if (dto.url.startsWith('data:video/')) {
        // Xử lý Base64 video
        const matches = dto.url.match(
          /^data:video\/([A-Za-z-+/]+);base64,(.+)$/,
        );
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 video format');
        }
        extension = matches[1] === 'quicktime' ? 'mov' : matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        throw new Error('Unsupported video source format. Use Base64.');
      }

      const filename = `${generateId()}.${extension}`;
      const filePath = join(fullFolderPath, filename);

      // Lưu file
      writeFileSync(filePath, buffer);

      const relativeUrl = `/uploads/${folder}/${filename}`;

      return {
        url: relativeUrl, // URL để Frontend sử dụng
        path: filePath,
        filename: filename,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to save video locally: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get URL (Mocking Cloudinary optimization for local)
   */
  getOptimizedUrl(url: string, options?: any) {
    return url; // Local storage doesn't support on-the-fly optimization like Cloudinary without extra libs
  }
}
