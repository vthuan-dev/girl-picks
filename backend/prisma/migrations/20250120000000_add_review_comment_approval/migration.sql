-- CreateEnum
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` VARCHAR(36) NOT NULL,
  `checksum` VARCHAR(64) NOT NULL,
  `finished_at` DATETIME(3) NULL,
  `migration_name` VARCHAR(255) NOT NULL,
  `logs` TEXT NULL,
  `rolled_back_at` DATETIME(3) NULL,
  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: Add status column with default PENDING
ALTER TABLE `review_comments` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable: Add approvedById column
ALTER TABLE `review_comments` ADD COLUMN `approvedById` VARCHAR(191) NULL;

-- AlterTable: Add approvedAt column
ALTER TABLE `review_comments` ADD COLUMN `approvedAt` DATETIME(3) NULL;

-- AlterTable: Add rejectedReason column
ALTER TABLE `review_comments` ADD COLUMN `rejectedReason` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `review_comments` ADD CONSTRAINT `review_comments_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing comments to APPROVED status (backward compatibility)
UPDATE `review_comments` SET `status` = 'APPROVED' WHERE `status` = 'PENDING';

