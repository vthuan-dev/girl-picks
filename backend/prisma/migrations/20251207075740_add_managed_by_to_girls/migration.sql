-- DropForeignKey
ALTER TABLE `girls` DROP FOREIGN KEY `girls_userId_fkey`;

-- AlterTable
ALTER TABLE `girls` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `birthYear` INTEGER NULL,
    ADD COLUMN `height` VARCHAR(191) NULL,
    ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `managedById` VARCHAR(191) NULL,
    ADD COLUMN `measurements` VARCHAR(191) NULL,
    ADD COLUMN `origin` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `price` VARCHAR(191) NULL,
    ADD COLUMN `province` VARCHAR(191) NULL,
    ADD COLUMN `services` JSON NOT NULL,
    ADD COLUMN `tags` JSON NOT NULL,
    ADD COLUMN `weight` VARCHAR(191) NULL,
    ADD COLUMN `workingHours` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `girls` ADD CONSTRAINT `girls_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `girls` ADD CONSTRAINT `girls_managedById_fkey` FOREIGN KEY (`managedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
