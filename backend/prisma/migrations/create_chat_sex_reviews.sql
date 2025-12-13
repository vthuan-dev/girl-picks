-- Create chat_sex_reviews table
CREATE TABLE IF NOT EXISTS `chat_sex_reviews` (
  `id` VARCHAR(191) NOT NULL,
  `girl_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `user_name` VARCHAR(191) NULL,
  `is_approved` BOOLEAN NOT NULL DEFAULT true,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `chat_sex_reviews_girl_id_idx` (`girl_id`),
  INDEX `chat_sex_reviews_user_id_idx` (`user_id`),
  INDEX `chat_sex_reviews_is_approved_is_active_idx` (`is_approved`, `is_active`),
  
  CONSTRAINT `chat_sex_reviews_girl_id_fkey` 
    FOREIGN KEY (`girl_id`) REFERENCES `chat_sex_girls`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chat_sex_reviews_user_id_fkey` 
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
