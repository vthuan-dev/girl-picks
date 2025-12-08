import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';
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
    console.error('   Or run: npm run fix-prisma-lock (if script exists)');
    process.exit(1);
  }
  throw error;
}

interface CrawlerGirlData {
  name: string;
  images: string[];
  tags: string[];
  isAvailable: boolean;
  location: string;
  province: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  bio: string;
  age: number;
  price: string;
  detailUrl: string;
  views: number;
  phone?: string;
  password?: string;
  birthYear?: number;
  height?: string;
  weight?: string;
  measurements?: string;
  origin?: string;
  address?: string;
  workingHours?: string;
  services: string[];
}

/**
 * Map location/province to district IDs
 * Example: "Sài Gòn/Bình Tân" -> find districts in "Bình Tân" or "Sài Gòn"
 */
async function findDistrictsByLocation(
  location?: string,
  province?: string,
  address?: string
): Promise<string[]> {
  const districtIds: string[] = [];
  
  if (!location && !province && !address) {
    return districtIds;
  }

  try {
    // Try to extract district name from location (format: "Province/District")
    let districtName: string | null = null;
    
    if (location) {
      // Split by "/" or ","
      const parts = location.split(/[\/,]/).map(p => p.trim());
      if (parts.length > 1) {
        // Last part is usually district
        districtName = parts[parts.length - 1];
      } else {
        districtName = parts[0];
      }
    }
    
    // Also try to extract from address
    if (!districtName && address) {
      const addressParts = address.split(',').map(p => p.trim());
      // Look for common district patterns
      for (const part of addressParts) {
        if (part.includes('Bình') || part.includes('Quận') || part.includes('Huyện')) {
          districtName = part;
          break;
        }
      }
    }

    // Search for districts
    const searchTerms: string[] = [];
    if (districtName) {
      searchTerms.push(districtName);
    }
    if (province) {
      searchTerms.push(province);
    }

    for (const term of searchTerms) {
      // MySQL doesn't support case-insensitive mode, so we use LOWER() in raw query or search both cases
      const districts = await prisma.district.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { name: { contains: term.toLowerCase() } },
            { name: { contains: term.toUpperCase() } },
            { province: { contains: term } },
            { province: { contains: term.toLowerCase() } },
            { province: { contains: term.toUpperCase() } },
          ],
          isActive: true,
        },
        take: 5, // Limit to avoid too many matches
      });

      for (const district of districts) {
        if (!districtIds.includes(district.id)) {
          districtIds.push(district.id);
        }
      }
    }

    // If no exact match, try fuzzy search on province
    if (districtIds.length === 0 && province) {
      const provinceDistricts = await prisma.district.findMany({
        where: {
          OR: [
            { province: { contains: province } },
            { province: { contains: province.toLowerCase() } },
            { province: { contains: province.toUpperCase() } },
          ],
          isActive: true,
        },
        take: 3,
      });

      for (const district of provinceDistricts) {
        if (!districtIds.includes(district.id)) {
          districtIds.push(district.id);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Error finding districts for location: ${location}`, error);
  }

  return districtIds;
}

async function importGirlsFromCrawler() {
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
  const inputPath = process.argv[2] || path.join(__dirname, '../../crawler/data/all_girls_details_20251206_162643.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Path not found: ${inputPath}`);
    process.exit(1);
  }

  // Check if it's a directory or file
  const stats = fs.statSync(inputPath);
  let girls: CrawlerGirlData[] = [];

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
          girls.push(...fileData);
        } else {
          girls.push(fileData);
        }
      } catch (error: any) {
        console.warn(`⚠️  Error reading file ${path.basename(filePath)}: ${error.message}`);
      }
    }
  } else {
    // Single file
    console.log(`📄 Reading JSON file: ${inputPath}`);
    const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    girls = Array.isArray(jsonData) ? jsonData : [jsonData];
  }

  console.log(`📦 Total ${girls.length} girls to import`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < girls.length; i++) {
    const girlData = girls[i];
    
    try {
      // Skip if no name
      if (!girlData.name || girlData.name.trim() === '') {
        console.warn(`⚠️  Skipping girl ${i + 1}: No name`);
        errorCount++;
        continue;
      }

      // Map verification status
      const verificationStatus = girlData.verified
        ? VerificationStatus.VERIFIED
        : VerificationStatus.PENDING;

      // Set verification dates
      const verificationVerifiedAt = girlData.verified ? new Date() : null;
      const verificationRequestedAt = girlData.verified ? new Date() : null;

      // Find districts from location/province/address
      const districtIds = await findDistrictsByLocation(
        girlData.location,
        girlData.province,
        girlData.address
      );

      // Transform JSON fields - ensure they are arrays
      const images = Array.isArray(girlData.images) ? girlData.images : [];
      const tags = Array.isArray(girlData.tags) ? girlData.tags : [];
      const services = Array.isArray(girlData.services) ? girlData.services : [];

      // Clean and validate data
      const cleanName = girlData.name.trim();
      const cleanBio = girlData.bio?.trim() || null;
      const cleanPhone = girlData.phone?.trim() || null;
      
      // Validate age
      const age = girlData.age && girlData.age >= 18 && girlData.age <= 60 
        ? girlData.age 
        : null;

      // Create girl as product (not user)
      const girl = await prisma.girl.create({
        data: {
          // Basic Info
          name: cleanName,
          age: age,
          bio: cleanBio,
          phone: cleanPhone,
          birthYear: girlData.birthYear && girlData.birthYear > 1950 && girlData.birthYear < 2010
            ? girlData.birthYear 
            : null,
          
          // Physical Info
          height: girlData.height?.trim() || null,
          weight: girlData.weight?.trim() || null,
          measurements: girlData.measurements?.trim() || null,
          origin: girlData.origin?.trim() || null,
          
          // Location
          districts: districtIds.length > 0 ? districtIds : [],
          address: girlData.address?.trim() || null,
          location: girlData.location?.trim() || null,
          province: girlData.province?.trim() || null,
          
          // Pricing
          price: girlData.price?.trim() || null,
          
          // Rating & Reviews
          ratingAverage: girlData.rating && girlData.rating >= 0 && girlData.rating <= 5
            ? girlData.rating 
            : 0,
          totalReviews: girlData.totalReviews && girlData.totalReviews >= 0
            ? girlData.totalReviews 
            : 0,
          
          // Verification
          verificationStatus,
          verificationRequestedAt,
          verificationVerifiedAt,
          verificationDocuments: [],
          
          // Statistics
          viewCount: girlData.views && girlData.views >= 0 ? girlData.views : 0,
          favoriteCount: 0, // Default
          
          // Flags
          isFeatured: false, // Default - can be set manually later
          isPremium: false, // Default - can be set manually later
          isActive: true, // Default active
          isAvailable: girlData.isAvailable ?? true,
          
          // Media & Content (JSON fields)
          images: images,
          tags: tags,
          services: services,
          
          // Activity
          workingHours: girlData.workingHours?.trim() || null,
          lastActiveAt: new Date(), // Set to current time
          
          // Relations
          userId: null, // Girl is a product, NOT a user
          managedById: staff.id, // Managed by staff/admin who imports
        },
      });

      successCount++;
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Imported ${i + 1}/${girls.length} girls...`);
      }
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error importing girl ${i + 1} (${girlData.name || 'Unknown'}):`, error.message);
      
      // Log more details for debugging
      if (error.code === 'P2002') {
        console.error(`   → Duplicate entry (possibly name or phone already exists)`);
      }
      
      // Continue with next girl
      continue;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${girls.length}`);
  console.log(`\n💡 Note: Girls are imported as products (not users)`);
  console.log(`   Managed by: ${staff.email} (${staff.role})`);
}

importGirlsFromCrawler()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });