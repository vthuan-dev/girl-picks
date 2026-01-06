-- Performance Optimization Indexes for Girls Table
-- Run this on VPS MySQL database to improve pagination performance

USE girl_pick_db;

-- Index for slug + isActive queries (detail page)
-- If index already exists, this will show an error but that's OK - just ignore it
CREATE INDEX girls_isActive_slug_idx ON girls (isActive, slug);

-- Index for pagination ORDER BY
CREATE INDEX girls_pagination_idx ON girls (isActive, isFeatured, ratingAverage, lastActiveAt);

-- Verify indexes were created
SHOW INDEX FROM girls;
