-- AlterTable
ALTER TABLE `albums` ADD COLUMN `albumCategoryId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `album_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `album_categories_name_key`(`name`),
    UNIQUE INDEX `album_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `albums` ADD CONSTRAINT `albums_albumCategoryId_fkey` FOREIGN KEY (`albumCategoryId`) REFERENCES `album_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
