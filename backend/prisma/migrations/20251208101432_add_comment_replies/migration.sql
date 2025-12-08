-- AlterTable
ALTER TABLE `post_comments` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `girls_isActive_isFeatured_ratingAverage_idx` ON `girls`(`isActive`, `isFeatured`, `ratingAverage`);

-- CreateIndex
CREATE INDEX `girls_province_isActive_idx` ON `girls`(`province`, `isActive`);

-- CreateIndex
CREATE INDEX `girls_verificationStatus_isActive_idx` ON `girls`(`verificationStatus`, `isActive`);

-- CreateIndex
CREATE INDEX `girls_lastActiveAt_idx` ON `girls`(`lastActiveAt`);

-- CreateIndex
CREATE INDEX `girls_isActive_ratingAverage_idx` ON `girls`(`isActive`, `ratingAverage`);

-- CreateIndex
CREATE INDEX `post_comments_postId_parentId_idx` ON `post_comments`(`postId`, `parentId`);

-- AddForeignKey
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `post_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
