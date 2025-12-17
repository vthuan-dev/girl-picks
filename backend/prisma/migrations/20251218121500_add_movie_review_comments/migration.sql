-- Create table for movie review comments (replies)

CREATE TABLE `movie_review_comments` (
  `id` VARCHAR(191) NOT NULL,
  `reviewId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `movie_review_comments_reviewId_idx`(`reviewId`),
  INDEX `movie_review_comments_userId_idx`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `movie_review_comments`
  ADD CONSTRAINT `movie_review_comments_reviewId_fkey`
  FOREIGN KEY (`reviewId`) REFERENCES `movie_reviews`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `movie_review_comments`
  ADD CONSTRAINT `movie_review_comments_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;


