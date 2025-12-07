/*
  Warnings:

  - Added the required column `authorId` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_girlId_fkey`;

-- DropIndex
DROP INDEX `posts_girlId_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `authorId` VARCHAR(191) NOT NULL,
    MODIFY `girlId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_girlId_fkey` FOREIGN KEY (`girlId`) REFERENCES `girls`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
