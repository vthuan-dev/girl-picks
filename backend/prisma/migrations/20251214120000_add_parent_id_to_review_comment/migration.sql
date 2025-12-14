-- AlterTable
ALTER TABLE `review_comments` ADD COLUMN `parent_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `review_comments` ADD CONSTRAINT `review_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `review_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

