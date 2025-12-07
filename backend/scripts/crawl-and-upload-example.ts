/**
 * Example: Crawl data and upload images to Cloudinary
 * 
 * This script demonstrates how to:
 * 1. Crawl image URLs from external source
 * 2. Upload images to Cloudinary
 * 3. Save data with Cloudinary URLs
 */

import axios from 'axios';

// Example: Crawl girl data
async function crawlGirlData() {
  // Replace with your actual crawling logic
  return {
    name: 'Nguyễn Thị A',
    imageUrls: [
      'https://external-site.com/image1.jpg',
      'https://external-site.com/image2.jpg',
    ],
    bio: 'Gái gọi chuyên nghiệp',
    age: 25,
    location: 'Hồ Chí Minh',
    rating: 4.8,
  };
}

// Example: Save girl with uploaded images
async function saveGirlWithUploadedImages() {
  // 1. Crawl data
  const crawledData = await crawlGirlData();
  console.log('📥 Crawled data:', crawledData.name);

  // 2. Upload images to Cloudinary via API
  const uploadResponse = await axios.post(
    'http://localhost:3000/api/upload/images',
    {
      urls: crawledData.imageUrls,
      folder: 'girl-pick/girls',
      publicIdPrefix: `girl-${crawledData.name.toLowerCase().replace(/\s+/g, '-')}`,
    },
    {
      headers: {
        'Authorization': `Bearer YOUR_JWT_TOKEN`, // Replace with actual token
        'Content-Type': 'application/json',
      },
    },
  );

  const cloudinaryUrls = uploadResponse.data.data.map((item: any) => item.cloudinaryUrl);
  console.log('☁️ Uploaded to Cloudinary:', cloudinaryUrls.length, 'images');

  // 3. Save to database via crawler API
  const saveResponse = await axios.post(
    'http://localhost:3000/api/crawler/save',
    {
      name: crawledData.name,
      images: cloudinaryUrls, // Use Cloudinary URLs
      bio: crawledData.bio,
      age: crawledData.age,
      location: crawledData.location,
      rating: crawledData.rating,
      uploadToCloudinary: false, // Already uploaded above
    },
    {
      headers: {
        'Authorization': `Bearer YOUR_JWT_TOKEN`, // Replace with actual token
        'Content-Type': 'application/json',
      },
    },
  );

  console.log('💾 Saved to database:', saveResponse.data.message);
  return saveResponse.data;
}

// Or use the integrated method (recommended)
async function saveGirlWithAutoUpload() {
  const crawledData = await crawlGirlData();
  
  // Save with auto-upload to Cloudinary
  const saveResponse = await axios.post(
    'http://localhost:3000/api/crawler/save',
    {
      name: crawledData.name,
      images: crawledData.imageUrls, // Original URLs
      bio: crawledData.bio,
      age: crawledData.age,
      location: crawledData.location,
      rating: crawledData.rating,
      uploadToCloudinary: true, // Auto-upload to Cloudinary
    },
    {
      headers: {
        'Authorization': `Bearer YOUR_JWT_TOKEN`,
        'Content-Type': 'application/json',
      },
    },
  );

  console.log('✅ Saved with auto-upload:', saveResponse.data.message);
  return saveResponse.data;
}

// Run example
if (require.main === module) {
  console.log('🚀 Starting crawl and upload example...\n');
  
  // Method 1: Manual upload then save
  // saveGirlWithUploadedImages().catch(console.error);
  
  // Method 2: Auto-upload (recommended)
  // saveGirlWithAutoUpload().catch(console.error);
}

export { saveGirlWithUploadedImages, saveGirlWithAutoUpload };


