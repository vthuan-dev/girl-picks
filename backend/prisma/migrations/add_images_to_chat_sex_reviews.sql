-- Add images column to chat_sex_reviews table
ALTER TABLE `chat_sex_reviews` 
ADD COLUMN `images` JSON DEFAULT ('[]') AFTER `comment`;
