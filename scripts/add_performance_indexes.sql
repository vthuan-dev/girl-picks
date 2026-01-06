-- Performance Optimization Indexes for Girls Table
-- Run this on VPS MySQL database to improve pagination performance

USE girl_pick_db;

-- Index for slug + isActive queries (detail page)
CREATE INDEX IF NOT EXISTS girls_isActive_slug_idx ON girls (isActive, slug);

-- Index for pagination ORDER BY: isFeatured DESC, ratingAverage DESC, lastActiveAt DESC
CREATE INDEX IF NOT EXISTS girls_pagination_idx ON girls (isActive, isFeatured, ratingAverage, lastActiveAt);

-- Verify indexes were created
SHOW INDEX FROM girls;
