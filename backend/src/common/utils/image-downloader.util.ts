import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { createWriteStream, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Download image from URL to temporary file
 */
export async function downloadImageFromUrl(
  imageUrl: string,
  filename?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(imageUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      const tempPath = join(
        tmpdir(),
        filename ||
          `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
      );

      const file = createWriteStream(tempPath);

      protocol
        .get(imageUrl, (response) => {
          // Check if response is successful
          if (response.statusCode !== 200) {
            file.close();
            unlinkSync(tempPath);
            reject(
              new Error(`Failed to download image: ${response.statusCode}`),
            );
            return;
          }

          // Check content type
          const contentType = response.headers['content-type'];
          if (contentType && !contentType.startsWith('image/')) {
            file.close();
            unlinkSync(tempPath);
            reject(new Error(`Invalid content type: ${contentType}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(tempPath);
          });
        })
        .on('error', (err) => {
          file.close();
          if (require('fs').existsSync(tempPath)) {
            unlinkSync(tempPath);
          }
          reject(err);
        });
    } catch (error: any) {
      reject(new Error(`Invalid URL: ${error?.message || 'Unknown error'}`));
    }
  });
}

/**
 * Get image buffer from URL (without saving to disk)
 */
export async function getImageBufferFromUrl(imageUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(imageUrl);
      const protocol = url.protocol === 'https:' ? https : http;

      const chunks: Buffer[] = [];

      protocol
        .get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(
              new Error(`Failed to download image: ${response.statusCode}`),
            );
            return;
          }

          const contentType = response.headers['content-type'];
          if (contentType && !contentType.startsWith('image/')) {
            reject(new Error(`Invalid content type: ${contentType}`));
            return;
          }

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    } catch (error: any) {
      reject(new Error(`Invalid URL: ${error?.message || 'Unknown error'}`));
    }
  });
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (url && url.startsWith('data:image/')) {
    return true;
  }
  try {
    const urlObj = new URL(url || '');
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
