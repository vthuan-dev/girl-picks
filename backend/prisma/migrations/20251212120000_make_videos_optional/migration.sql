-- Make videos field nullable and update NULL values to empty array
ALTER TABLE `chat_sex_girls` MODIFY COLUMN `videos` JSON NULL;

-- Update existing NULL values to empty array
UPDATE `chat_sex_girls` SET `videos` = JSON_ARRAY() WHERE `videos` IS NULL;

