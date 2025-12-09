-- Script to migrate data from category (string) to categoryId (relation)
-- This script should be run AFTER the migration is applied

-- Step 1: Create categories from existing category values
-- Note: Using a simple slug generation (replace spaces with dashes, lowercase)
INSERT INTO categories (id, name, slug, description, isActive, `order`, createdAt, updatedAt)
SELECT 
    UUID() as id,
    category as name,
    LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        category, 
        ' ', '-'), 
        'á', 'a'), 'à', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
        'é', 'e'), 'è', 'e'), 'ẻ', 'e'), 'ẽ', 'e'), 'ẹ', 'e')
    ) as slug,
    NULL as description,
    true as isActive,
    0 as `order`,
    NOW() as createdAt,
    NOW() as updatedAt
FROM posts
WHERE category IS NOT NULL AND category != ''
GROUP BY category;

-- Step 2: Update posts to set categoryId based on category name
UPDATE posts p
INNER JOIN categories c ON c.name = p.category
SET p.categoryId = c.id
WHERE p.category IS NOT NULL AND p.category != '';

