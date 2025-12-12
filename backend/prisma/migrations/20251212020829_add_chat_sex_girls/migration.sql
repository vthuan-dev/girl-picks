-- CreateTable
CREATE TABLE `chat_sex_girls` (
    `id` VARCHAR(191) NOT NULL,
    `managedById` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `bio` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `zalo` VARCHAR(191) NULL,
    `telegram` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `price` VARCHAR(191) NULL,
    `services` JSON NOT NULL,
    `workingHours` VARCHAR(191) NULL,
    `images` JSON NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `rating` DOUBLE NULL,
    `tags` JSON NOT NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `crawledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chat_sex_girls_slug_key`(`slug`),
    INDEX `chat_sex_girls_isActive_isFeatured_idx`(`isActive`, `isFeatured`),
    INDEX `chat_sex_girls_province_isActive_idx`(`province`, `isActive`),
    INDEX `chat_sex_girls_isActive_viewCount_idx`(`isActive`, `viewCount`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_sex_girls` ADD CONSTRAINT `chat_sex_girls_managedById_fkey` FOREIGN KEY (`managedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
