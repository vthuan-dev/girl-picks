import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getImageBufferFromUrl } from '../../common/utils/image-downloader.util';
import axios from 'axios';

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
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadPath = join(process.cwd(), 'uploads');

  // Bunny CDN Config
  private readonly bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE || 'girlpick-storage';
  private readonly bunnyStorageHost = process.env.BUNNY_STORAGE_HOST || 'sg.storage.bunnycdn.com';
  private readonly bunnyApiKey = process.env.BUNNY_API_KEY || '';
  private readonly bunnyCdnUrl = process.env.BUNNY_CDN_URL || 'https://girlpick.b-cdn.net';
  private readonly useBunnyCdn = !!process.env.BUNNY_API_KEY; // Chỉ dùng Bunny nếu có API key

  constructor() {
    // Đảm bảo thư mục uploads tồn tại (fallback)
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }

    if (this.useBunnyCdn) {
      this.logger.log(`✅ Bunny CDN enabled: ${this.bunnyCdnUrl}`);
    } else {
      this.logger.warn('⚠️ Bunny CDN not configured, using local storage');
    }
  }

  /**
   * Upload buffer to Bunny CDN Storage
   */
  private async uploadToBunnyCdn(buffer: Buffer, remotePath: string): Promise<string> {
    const url = `https://${this.bunnyStorageHost}/${this.bunnyStorageZone}/${remotePath}`;

    try {
      const response = await axios.put(url, buffer, {
        headers: {
          'AccessKey': this.bunnyApiKey,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 30000,
      });

      if (response.status === 200 || response.status === 201) {
        const cdnUrl = `${this.bunnyCdnUrl}/${remotePath}`;
        this.logger.debug(`✅ Uploaded to CDN: ${cdnUrl}`);
        return cdnUrl;
      } else {
        throw new Error(`Bunny CDN returned status ${response.status}`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Bunny CDN upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete file from Bunny CDN Storage
   */
  private async deleteFromBunnyCdn(remotePath: string): Promise<boolean> {
    const url = `https://${this.bunnyStorageHost}/${this.bunnyStorageZone}/${remotePath}`;

    try {
      await axios.delete(url, {
        headers: {
          'AccessKey': this.bunnyApiKey,
        },
        timeout: 10000,
      });
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Bunny CDN delete failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload single image from URL or Base64 to Bunny CDN (or Local Storage as fallback)
   */
  async uploadImageFromUrl(dto: UploadImageDto) {
    if (!dto || !dto.url) {
      throw new BadRequestException('Image data or URL is required.');
    }

    try {
      const folder = dto.folder || 'posts';
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

      // ========== UPLOAD TO BUNNY CDN ==========
      if (this.useBunnyCdn) {
        const remotePath = `${folder}/${filename}`;
        const cdnUrl = await this.uploadToBunnyCdn(buffer, remotePath);

        return {
          originalUrl: dto.url.substring(0, 100) + '...',
          url: cdnUrl, // URL CDN để Frontend sử dụng
          path: remotePath,
          filename: filename,
          cdn: true,
        };
      }

      // ========== FALLBACK TO LOCAL STORAGE ==========
      const folderParts = folder.split('/');
      const fullFolderPath = join(this.uploadPath, ...folderParts);

      if (!existsSync(fullFolderPath)) {
        mkdirSync(fullFolderPath, { recursive: true });
      }

      const filePath = join(fullFolderPath, filename);
      writeFileSync(filePath, buffer);

      const relativeUrl = `/api/uploads/${folder}/${filename}`;

      return {
        originalUrl: dto.url.substring(0, 100) + '...',
        url: relativeUrl, // URL để Frontend sử dụng
        path: filePath,
        filename: filename,
        cdn: false,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to upload image: ${error?.message || 'Unknown error'}`,
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
   * Delete image from CDN or Local Storage
   */
  async deleteImage(publicId: string) {
    if (this.useBunnyCdn) {
      // Extract path from CDN URL if needed
      let remotePath = publicId;
      if (publicId.includes(this.bunnyCdnUrl)) {
        remotePath = publicId.replace(`${this.bunnyCdnUrl}/`, '');
      }

      const success = await this.deleteFromBunnyCdn(remotePath);
      return {
        success,
        message: success ? 'Image deleted from CDN' : 'Failed to delete from CDN',
      };
    }

    // Local storage delete
    return {
      success: true,
      message: 'Local image delete functionality not fully implemented but bypassed',
    };
  }

  /**
   * Upload video from Base64 to Local Storage (video vẫn lưu local)
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
