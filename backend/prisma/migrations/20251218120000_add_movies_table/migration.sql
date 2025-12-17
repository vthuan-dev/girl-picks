-- Create movies table for separated porn movies

CREATE TABLE `movies` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `videoUrl` TEXT NOT NULL,
  `poster` VARCHAR(191) NULL,
  `thumbnail` VARCHAR(191) NULL,
  `duration` VARCHAR(191) NULL,
  `categoryId` VARCHAR(191) NULL,
  `tags` JSON NOT NULL DEFAULT ('[]'),
  `viewCount` INT NOT NULL DEFAULT 0,
  `status` ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'APPROVED',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `movies_slug_key`(`slug`),
  INDEX `movies_status_createdAt_idx`(`status`, `createdAt`),
  INDEX `movies_categoryId_idx`(`categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `movies`
  ADD CONSTRAINT `movies_categoryId_fkey`
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;


