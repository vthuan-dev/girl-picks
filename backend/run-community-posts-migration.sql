-- Script to create community_posts tables directly
-- Run this on production database if migration fails

-- CreateTable: community_posts
CREATE TABLE IF NOT EXISTS `community_posts` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `girlId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `images` JSON NOT NULL DEFAULT ('[]'),
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `community_posts_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `community_posts_authorId_idx`(`authorId`),
    INDEX `community_posts_girlId_idx`(`girlId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: community_post_likes
CREATE TABLE IF NOT EXISTS `community_post_likes` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `community_post_likes_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: community_post_comments
CREATE TABLE IF NOT EXISTS `community_post_comments` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `community_post_comments_postId_parentId_idx`(`postId`, `parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: community_posts.authorId -> users.id
ALTER TABLE `community_posts` 
ADD CONSTRAINT `community_posts_authorId_fkey` 
FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: community_posts.girlId -> girls.id
ALTER TABLE `community_posts` 
ADD CONSTRAINT `community_posts_girlId_fkey` 
FOREIGN KEY (`girlId`) REFERENCES `girls`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: community_posts.approvedById -> users.id
ALTER TABLE `community_posts` 
ADD CONSTRAINT `community_posts_approvedById_fkey` 
FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: community_post_likes.postId -> community_posts.id
ALTER TABLE `community_post_likes` 
ADD CONSTRAINT `community_post_likes_postId_fkey` 
FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: community_post_likes.userId -> users.id
ALTER TABLE `community_post_likes` 
ADD CONSTRAINT `community_post_likes_userId_fkey` 
FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: community_post_comments.postId -> community_posts.id
ALTER TABLE `community_post_comments` 
ADD CONSTRAINT `community_post_comments_postId_fkey` 
FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: community_post_comments.userId -> users.id
ALTER TABLE `community_post_comments` 
ADD CONSTRAINT `community_post_comments_userId_fkey` 
FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: community_post_comments.parentId -> community_post_comments.id
ALTER TABLE `community_post_comments` 
ADD CONSTRAINT `community_post_comments_parentId_fkey` 
FOREIGN KEY (`parentId`) REFERENCES `community_post_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

