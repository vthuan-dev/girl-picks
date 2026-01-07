-- Add optimized composite index for pagination ORDER BY
-- Compatible with MySQL versions that don't support IF EXISTS on DROP/CREATE INDEX
-- Safe to run multiple times; it will skip if index already exists.

SET @idx_name := 'girls_isFeatured_ratingAverage_lastActiveAt_isActive_idx';

-- Drop index if it exists
SET @has_idx := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'girls'
    AND index_name = @idx_name
);
SET @drop_sql := IF(@has_idx > 0,
  CONCAT('DROP INDEX `', @idx_name, '` ON `girls`'),
  'SELECT "Index not found, skip drop"');
PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index if it does not exist
SET @has_idx_after := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'girls'
    AND index_name = @idx_name
);
SET @create_sql := IF(@has_idx_after = 0,
  CONCAT('CREATE INDEX `', @idx_name, '` ON `girls`(`isFeatured`, `ratingAverage`, `lastActiveAt`, `isActive`)'),
  'SELECT "Index already exists, skip create"');
PREPARE stmt2 FROM @create_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
