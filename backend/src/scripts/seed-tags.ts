import { PrismaClient } from '@prisma/client';
import { CacheService } from '../modules/cache/cache.service';
import { CacheModule } from '../modules/cache/cache.module';
import { PrismaModule } from '../prisma/prisma.module';

const prisma = new PrismaClient();

// Popular tags based on the image
const popularTags = [
  'gái gọi',
  'gaigu',
  'gaigoi',
  'Gái gọi',
  'Gaigoi',
  'Gaigu',
  'GÁI GỌI',
  'gái gọi cao cấp',
  'gái gọi sài gòn',
  'Gái gọi sài gòn',
  'Gái Gọi Sài Gòn',
  'GÁI GỌI SÀI GÒN',
  'gái gọi hà nội',
  'gái gọi vú to',
  'gái gọi quận 10',
  'gái gọi quận 8',
  'gái gọi kỹ nữ',
  'gái gọi kynu',
  'gái gọi giá rẻ',
  'gái gọi làm tình',
  'gái gọi xinh',
  'gái gọi thuận an',
  'gái gọi bình dương',
  'gai goi',
  'gái xinh',
  'gái dâm',
  'Gái xinh gái đẹp hàng ngon',
  'vú to',
  'Ngon',
  'rẻ',
  'da trắng',
  'chiều chuộng',
  'bổ',
];

// Location-based tags
const locationTags = [
  'sài gòn',
  'hà nội',
  'đà nẵng',
  'bình dương',
  'đồng nai',
  'cần thơ',
  'hải phòng',
  'quận 1',
  'quận 2',
  'quận 3',
  'quận 7',
  'quận 10',
  'quận 8',
  'thuận an',
];

// Characteristic tags
const characteristicTags = [
  'cao cấp',
  'giá rẻ',
  'xinh',
  'đẹp',
  'vú to',
  'ngực đẹp',
  'da trắng',
  'dáng đẹp',
  'trẻ',
  'non',
  'ngon',
  'dâm',
  'kỹ nữ',
  'kynu',
];

// Service tags
const serviceTags = [
  'làm tình',
  'chiều chuộng',
  'massage',
  'tắm',
  'kiss',
  'oral',
  'full service',
];

// Combine all tags
const allTags = [
  ...popularTags,
  ...locationTags,
  ...characteristicTags,
  ...serviceTags,
];

/**
 * Get random tags (2-5 tags per item)
 */
function getRandomTags(): string[] {
  const numTags = Math.floor(Math.random() * 4) + 2; // 2-5 tags
  const shuffled = [...allTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

/**
 * Seed tags for all girls
 */
async function seedGirlTags() {
  console.log('🌱 Seeding tags for girls...');
  
  const girls = await prisma.girl.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      tags: true,
      province: true,
      location: true,
    },
  });

  console.log(`Found ${girls.length} girls to update`);

  let updated = 0;
  for (const girl of girls) {
    // Start with existing tags or empty array
    const existingTags = (girl.tags && Array.isArray(girl.tags) && (girl.tags as string[]).length > 0) 
      ? (girl.tags as string[]) 
      : [];
    
    // If already has 5+ tags, skip
    if (existingTags.length >= 5) {
      continue;
    }

    // Generate tags based on girl's data (start fresh, not from existing)
    const tags: string[] = [];

    // Add location-based tags
    if (girl.province) {
      const provinceLower = girl.province.toLowerCase();
      if (provinceLower.includes('sài gòn') || provinceLower.includes('ho chi minh')) {
        tags.push('gái gọi sài gòn', 'sài gòn');
      } else if (provinceLower.includes('hà nội') || provinceLower.includes('hanoi')) {
        tags.push('gái gọi hà nội', 'hà nội');
      } else if (provinceLower.includes('bình dương')) {
        tags.push('gái gọi bình dương', 'bình dương');
      }
    }

    if (girl.location) {
      const locationLower = girl.location.toLowerCase();
      if (locationLower.includes('quận 10')) {
        tags.push('gái gọi quận 10', 'quận 10');
      } else if (locationLower.includes('quận 8')) {
        tags.push('gái gọi quận 8', 'quận 8');
      } else if (locationLower.includes('thuận an')) {
        tags.push('gái gọi thuận an', 'thuận an');
      }
    }

    // Add random popular tags
    const randomTags = getRandomTags();
    tags.push(...randomTags);
    
    // Merge with existing tags and remove duplicates
    const allTags = [...existingTags, ...tags];
    const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())))
      .map(tagLower => {
        // Find original case from allTags
        return allTags.find(t => t.toLowerCase() === tagLower) || tagLower;
      })
      .slice(0, 5);

    await prisma.girl.update({
      where: { id: girl.id },
      data: {
        tags: uniqueTags,
      },
    });

    updated++;
    if (updated % 10 === 0) {
      console.log(`Updated ${updated}/${girls.length} girls...`);
    }
  }

  console.log(`✅ Updated tags for ${updated} girls`);
}

/**
 * Seed tags for all posts
 */
async function seedPostTags() {
  console.log('🌱 Seeding tags for posts...');
  
  const posts = await prisma.post.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      id: true,
      title: true,
      tags: true,
      category: true,
    },
  });

  console.log(`Found ${posts.length} posts to update`);

  let updated = 0;
  for (const post of posts) {
    // Start with existing tags or empty array
    const existingTags = (post.tags && Array.isArray(post.tags) && (post.tags as string[]).length > 0) 
      ? (post.tags as string[]) 
      : [];
    
    // If already has 5+ tags, skip
    if (existingTags.length >= 5) {
      continue;
    }

    // Generate tags based on post's data (start fresh, not from existing)
    const tags: string[] = [];

    // Add category-based tags
    if (post.category) {
      const categoryLower = post.category.toLowerCase();
      if (categoryLower.includes('sex') || categoryLower.includes('phim')) {
        tags.push('gái gọi', 'gaigu', 'phim sex');
      }
    }

    // Add title-based tags
    if (post.title) {
      const titleLower = post.title.toLowerCase();
      if (titleLower.includes('sài gòn')) {
        tags.push('gái gọi sài gòn', 'sài gòn');
      } else if (titleLower.includes('hà nội')) {
        tags.push('gái gọi hà nội', 'hà nội');
      }
      if (titleLower.includes('xinh') || titleLower.includes('đẹp')) {
        tags.push('gái xinh', 'xinh');
      }
      if (titleLower.includes('ngon')) {
        tags.push('Ngon', 'ngon');
      }
    }

    // Add random popular tags
    const randomTags = getRandomTags();
    tags.push(...randomTags);
    
    // Merge with existing tags and remove duplicates
    const allTags = [...existingTags, ...tags];
    const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())))
      .map(tagLower => {
        // Find original case from allTags
        return allTags.find(t => t.toLowerCase() === tagLower) || tagLower;
      })
      .slice(0, 5);

    await prisma.post.update({
      where: { id: post.id },
      data: {
        tags: uniqueTags,
      },
    });

    updated++;
    if (updated % 10 === 0) {
      console.log(`Updated ${updated}/${posts.length} posts...`);
    }
  }

  console.log(`✅ Updated tags for ${updated} posts`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting tag seeding...\n');
    
    await seedGirlTags();
    console.log('');
    await seedPostTags();
    
    console.log('\n✨ Tag seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

