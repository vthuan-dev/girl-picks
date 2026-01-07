-- Create optimized composite index for pagination ORDER BY
-- This index matches the exact orderBy used in girls.service.ts:
-- ORDER BY isFeatured DESC, ratingAverage DESC, lastActiveAt DESC
-- The index will significantly improve performance for pagination queries, especially on later pages

CREATE INDEX `girls_isFeatured_ratingAverage_lastActiveAt_isActive_idx` ON `girls`(`isFeatured`, `ratingAverage`, `lastActiveAt`, `isActive`);

