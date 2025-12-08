/**
 * Script to generate slugs for existing Girls and Posts
 * Run: npm run generate-slugs
 */

import { PrismaClient } from '@prisma/client';
import { generateSlug, generateUniqueSlug } from '../src/common/utils/slug.util';

const prisma = new PrismaClient();

async function generateSlugsForGirls() {
  console.log('🔄 Generating slugs for Girls...');
  
  // Query all girls - don't filter by slug as it might not exist yet
  const girls = await prisma.girl.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  console.log(`📦 Found ${girls.length} girls without slugs`);

  let success = 0;
  let errors = 0;

  for (const girl of girls) {
    try {
      if (!girl.name) {
        console.log(`⚠️  Skipping girl ${girl.id} - no name`);
        continue;
      }

      const baseSlug = generateSlug(girl.name);
      if (!baseSlug) {
        console.log(`⚠️  Skipping girl ${girl.id} - empty slug generated`);
        continue;
      }

      // Get existing slugs (only if slug column exists)
      let existingSlugs: string[] = [];
      try {
        const existingGirls = await prisma.girl.findMany({
          where: {
            slug: { startsWith: baseSlug },
            NOT: { id: girl.id },
          },
          select: { slug: true },
        });
        existingSlugs = existingGirls.map((g: any) => g.slug).filter(Boolean) as string[];
      } catch (error: any) {
        // If slug column doesn't exist yet, just use empty array
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.log('⚠️  Slug column not found, skipping duplicate check');
        } else {
          throw error;
        }
      }
      
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      // Try to update with slug, handle case where column doesn't exist
      try {
        await prisma.girl.update({
          where: { id: girl.id },
          data: { slug: uniqueSlug } as any,
        });
      } catch (error: any) {
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.log(`⚠️  Slug column not found for girl ${girl.id}, skipping update`);
          continue;
        }
        throw error;
      }

      success++;
      if (success % 100 === 0) {
        console.log(`✅ Processed ${success}/${girls.length} girls...`);
      }
    } catch (error) {
      console.error(`❌ Error generating slug for girl ${girl.id}:`, error);
      errors++;
    }
  }

  console.log(`✅ Girls: ${success} success, ${errors} errors`);
}

async function generateSlugsForPosts() {
  console.log('🔄 Generating slugs for Posts...');
  
  // Query all posts - don't filter by slug as it might not exist yet
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  console.log(`📦 Found ${posts.length} posts without slugs`);

  let success = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      if (!post.title) {
        console.log(`⚠️  Skipping post ${post.id} - no title`);
        continue;
      }

      const baseSlug = generateSlug(post.title);
      if (!baseSlug) {
        console.log(`⚠️  Skipping post ${post.id} - empty slug generated`);
        continue;
      }

      // Get existing slugs (only if slug column exists)
      let existingSlugs: string[] = [];
      try {
        const existingPosts = await prisma.post.findMany({
          where: {
            slug: { startsWith: baseSlug },
            NOT: { id: post.id },
          },
          select: { slug: true },
        });
        existingSlugs = existingPosts.map((p: any) => p.slug).filter(Boolean) as string[];
      } catch (error: any) {
        // If slug column doesn't exist yet, just use empty array
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.log('⚠️  Slug column not found, skipping duplicate check');
        } else {
          throw error;
        }
      }
      
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      // Try to update with slug, handle case where column doesn't exist
      try {
        await prisma.post.update({
          where: { id: post.id },
          data: { slug: uniqueSlug } as any,
        });
      } catch (error: any) {
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.log(`⚠️  Slug column not found for post ${post.id}, skipping update`);
          continue;
        }
        throw error;
      }

      success++;
      if (success % 100 === 0) {
        console.log(`✅ Processed ${success}/${posts.length} posts...`);
      }
    } catch (error) {
      console.error(`❌ Error generating slug for post ${post.id}:`, error);
      errors++;
    }
  }

  console.log(`✅ Posts: ${success} success, ${errors} errors`);
}

async function main() {
  try {
    await generateSlugsForGirls();
    await generateSlugsForPosts();
    console.log('🎉 All slugs generated successfully!');
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

