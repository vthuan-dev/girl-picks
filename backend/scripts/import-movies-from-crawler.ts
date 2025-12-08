import { PrismaClient, UserRole, PostStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma with error handling for EPERM
let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
} catch (error: any) {
  if (error.code === 'EPERM' || error.message?.includes('operation not permitted')) {
    console.error('❌ Prisma Client Error: File is locked by another process');
    console.error('💡 Solution: Stop the backend server and try again');
    process.exit(1);
  }
  throw error;
}

interface CrawlerMovieData {
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  rating?: string | number;
  detailUrl?: string;
  category?: string;
  uploadDate?: string;
  description?: string;
  videoUrl?: string;
  videoSources?: Array<{
    url: string;
    type: string;
    label: string;
    resolution: string;
  }>;
  poster?: string;
  tags?: string[];
}

/**
 * Clean and parse rating from crawler data
 */
function parseRating(rating?: string | number): number | null {
  if (!rating) return null;
  
  if (typeof rating === 'number') {
    return rating >= 0 && rating <= 5 ? rating : null;
  }
  
  // Try to extract number from string
  const match = rating.toString().match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    return num >= 0 && num <= 5 ? num : null;
  }
  
  return null;
}

/**
 * Clean description - remove HTML and invalid text
 */
function cleanDescription(description?: string): string | null {
  if (!description || description.trim() === '') return null;
  
  // Remove common invalid patterns
  const invalidPatterns = [
    /Đăng Nhập.*/i,
    /Đăng ký.*/i,
    /Font Size.*/i,
    /^\s*$/,
  ];
  
  let cleaned = description.trim();
  
  for (const pattern of invalidPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  cleaned = cleaned.trim();
  
  // If cleaned is too short or looks invalid, return null
  if (cleaned.length < 10 || cleaned.length > 5000) {
    return null;
  }
  
  return cleaned || null;
}

/**
 * Parse duration string to standard format
 */
function parseDuration(duration?: string): string | null {
  if (!duration || duration.trim() === '') return null;
  
  // Try to extract time format (e.g., "10:30", "1h 30m", etc.)
  const timeMatch = duration.match(/(\d+):(\d+)/);
  if (timeMatch) {
    return duration.trim();
  }
  
  return null;
}

async function importMoviesFromCrawler() {
  // Get staff user (manager)
  const staff = await prisma.user.findFirst({
    where: {
      role: {
        in: [UserRole.STAFF_UPLOAD, UserRole.ADMIN],
      },
    },
  });

  if (!staff) {
    console.error('❌ No staff user found. Please create staff user first:');
    console.error('   npm run create-staff');
    process.exit(1);
  }

  console.log(`✅ Using staff user: ${staff.email} (${staff.id})`);

  // Get input path (file or directory)
  const inputPath = process.argv[2] || path.join(__dirname, '../../crawler/data/all_movies_details_20251206_163353.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Path not found: ${inputPath}`);
    process.exit(1);
  }

  // Check if it's a directory or file
  const stats = fs.statSync(inputPath);
  let movies: CrawlerMovieData[] = [];

  if (stats.isDirectory()) {
    // Import all JSON files from directory
    console.log(`📁 Reading JSON files from directory: ${inputPath}`);
    const jsonFiles = fs.readdirSync(inputPath)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(inputPath, file));

    console.log(`📦 Found ${jsonFiles.length} JSON files`);

    for (let i = 0; i < jsonFiles.length; i++) {
      const filePath = jsonFiles[i];
      try {
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Each file is a single object, not an array
        if (Array.isArray(fileData)) {
          movies.push(...fileData);
        } else {
          movies.push(fileData);
        }
      } catch (error: any) {
        console.warn(`⚠️  Error reading file ${path.basename(filePath)}: ${error.message}`);
      }
    }
  } else {
    // Single file
    console.log(`📄 Reading JSON file: ${inputPath}`);
    const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    movies = Array.isArray(jsonData) ? jsonData : [jsonData];
  }

  console.log(`📦 Total ${movies.length} movies to import`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const movieData = movies[i];
    
    try {
      // Skip if no title
      if (!movieData.title || movieData.title.trim() === '') {
        console.warn(`⚠️  Skipping movie ${i + 1}: No title`);
        errorCount++;
        continue;
      }

      // Clean and validate data
      const cleanTitle = movieData.title.trim();
      const cleanContent = cleanDescription(movieData.description);
      const cleanDuration = parseDuration(movieData.duration);
      const cleanRating = parseRating(movieData.rating);
      
      // Prepare images array (thumbnail + poster)
      const images: string[] = [];
      if (movieData.thumbnail) images.push(movieData.thumbnail);
      if (movieData.poster && movieData.poster !== movieData.thumbnail) {
        images.push(movieData.poster);
      }

      // Prepare video sources
      const videoSources = Array.isArray(movieData.videoSources) 
        ? movieData.videoSources 
        : [];

      // Prepare tags
      const tags = Array.isArray(movieData.tags) 
        ? movieData.tags 
        : [];

      // Validate viewCount
      const viewCount = movieData.views && movieData.views >= 0 
        ? movieData.views 
        : 0;

      // Create post as movie
      const post = await prisma.post.create({
        data: {
          // Basic fields
          title: cleanTitle,
          content: cleanContent || cleanTitle, // Use title as fallback if no description
          authorId: staff.id, // Staff/Admin who imports
          
          // Images
          images: images.length > 0 ? images : [],
          thumbnail: movieData.thumbnail || null,
          poster: movieData.poster || null,
          
          // Video fields
          videoUrl: movieData.videoUrl || null,
          videoSources: videoSources,
          duration: cleanDuration,
          
          // Statistics
          viewCount: viewCount,
          rating: cleanRating,
          
          // Category & Tags
          category: movieData.category?.trim() || null,
          tags: tags,
          
          // Status - Auto approve imported movies
          status: PostStatus.APPROVED,
          approvedById: staff.id,
          approvedAt: new Date(),
        },
      });

      successCount++;
      
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Imported ${i + 1}/${movies.length} movies...`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error importing movie ${i + 1} (${movieData.title || 'Unknown'}):`, error.message);
      
      // Log more details for debugging
      if (error.code === 'P2002') {
        console.error(`   → Duplicate entry (possibly title already exists)`);
      }
      
      // Continue with next movie
      continue;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${movies.length}`);
  console.log(`\n💡 Note: Movies are imported as Posts with video fields`);
  console.log(`   Managed by: ${staff.email} (${staff.role})`);
}

importMoviesFromCrawler()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

