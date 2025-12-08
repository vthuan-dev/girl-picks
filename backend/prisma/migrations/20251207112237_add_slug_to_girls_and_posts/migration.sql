/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `girls` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `girls` ADD COLUMN `slug` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `girls_slug_key` ON `girls`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `posts_slug_key` ON `posts`(`slug`);
