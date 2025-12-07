import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from '../../config/cloudinary.config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudinaryConfig().cloudinary.cloudName,
  api_key: cloudinaryConfig().cloudinary.apiKey,
  api_secret: cloudinaryConfig().cloudinary.apiSecret,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Upload image from URL to Cloudinary
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options: UploadOptions = {},
): Promise<{
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}> {
  try {
    const {
      folder = 'girl-pick',
      publicId,
      transformation = [],
      resourceType = 'image',
    } = options;

    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      overwrite: false,
      invalidate: true,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (transformation.length > 0) {
      uploadOptions.transformation = transformation;
    }

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Upload multiple images from URLs
 */
export async function uploadMultipleImagesFromUrls(
  imageUrls: string[],
  options: UploadOptions = {},
): Promise<Array<{
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}>> {
  const uploadPromises = imageUrls.map((url, index) =>
    uploadImageFromUrl(url, {
      ...options,
      publicId: options.publicId
        ? `${options.publicId}_${index}`
        : undefined,
    }),
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {},
): string {
  const { width, height, quality = 'auto', format = 'auto' } = options;

  const transformation: any[] = [];

  if (width) transformation.push({ width });
  if (height) transformation.push({ height });
  if (quality) transformation.push({ quality });
  if (format !== 'auto') transformation.push({ format });

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}

