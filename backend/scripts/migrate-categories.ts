import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategories() {
  console.log('Starting category migration...');

  try {
    // Step 1: Get all unique category values from posts
    const posts = await prisma.post.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    console.log(`Found ${posts.length} unique categories`);

    // Step 2: Create categories from existing category values
    const categoryMap = new Map<string, string>(); // category name -> category id

    for (const post of posts) {
      if (!post.category) continue;

      // Check if category already exists
      let category = await prisma.category.findUnique({
        where: { name: post.category },
      });

      if (!category) {
        // Generate slug from name
        const slug = post.category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes

        // Ensure slug is unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }

        category = await prisma.category.create({
          data: {
            name: post.category,
            slug: uniqueSlug,
            isActive: true,
            order: 0,
          },
        });

        console.log(`Created category: ${category.name} (${category.slug})`);
      }

      categoryMap.set(post.category, category.id);
    }

    // Step 3: Update posts to set categoryId
    let updatedCount = 0;
    for (const [categoryName, categoryId] of categoryMap.entries()) {
      const result = await prisma.post.updateMany({
        where: {
          category: categoryName,
          categoryId: null,
        },
        data: {
          categoryId,
        },
      });

      updatedCount += result.count;
      console.log(`Updated ${result.count} posts for category: ${categoryName}`);
    }

    console.log(`\nMigration completed!`);
    console.log(`- Created/Found ${categoryMap.size} categories`);
    console.log(`- Updated ${updatedCount} posts with categoryId`);

    // Step 4: Show summary
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('\nCategory summary:');
    for (const cat of categoryStats) {
      console.log(`  - ${cat.name}: ${cat._count.posts} posts`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategories()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

