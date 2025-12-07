/**
 * Example script: Upload images from URLs to Cloudinary
 * 
 * Usage:
 *   ts-node -r tsconfig-paths/register scripts/upload-images-example.ts
 */

import { uploadImageFromUrl, uploadMultipleImagesFromUrls } from '../src/common/utils/cloudinary.util';

async function main() {
  console.log('🚀 Starting image upload example...\n');

  // Example 1: Upload single image
  console.log('📸 Example 1: Upload single image');
  try {
    const result = await uploadImageFromUrl('https://example.com/image.jpg', {
      folder: 'girl-pick/girls',
      publicId: 'example-girl-1',
    });
    console.log('✅ Uploaded:', result.secureUrl);
    console.log('   Public ID:', result.publicId);
    console.log('   Size:', `${result.width}x${result.height}`);
    console.log('   Format:', result.format);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n');

  // Example 2: Upload multiple images
  console.log('📸 Example 2: Upload multiple images');
  try {
    const imageUrls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ];

    const results = await uploadMultipleImagesFromUrls(imageUrls, {
      folder: 'girl-pick/girls',
      publicIdPrefix: 'example-girl-2',
    });

    console.log(`✅ Uploaded ${results.length} images:`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.secureUrl}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✨ Done!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };


