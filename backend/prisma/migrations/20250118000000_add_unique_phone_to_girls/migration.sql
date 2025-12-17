-- Add unique constraint to phone column in girls table
-- Step 1: Clean up duplicates first (keep the first one, delete others)
-- This will keep the oldest record (lowest id) for each phone number
DELETE g1 FROM girls g1
INNER JOIN girls g2 
WHERE g1.id > g2.id 
  AND g1.phone = g2.phone 
  AND g1.phone IS NOT NULL 
  AND g1.phone != '';

-- Step 2: Set empty strings to NULL (to avoid unique constraint issues with empty strings)
UPDATE girls SET phone = NULL WHERE phone = '';

-- Step 3: Add unique constraint
-- Note: MySQL allows multiple NULL values in a UNIQUE column, which is what we want
ALTER TABLE `girls` ADD UNIQUE INDEX `girls_phone_key`(`phone`);

