-- Create table for movie reviews (ratings + comments)

CREATE TABLE `movie_reviews` (
  `id` VARCHAR(191) NOT NULL,
  `movieId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `movie_reviews_movieId_idx`(`movieId`),
  INDEX `movie_reviews_userId_idx`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `movie_reviews`
  ADD CONSTRAINT `movie_reviews_movieId_fkey`
  FOREIGN KEY (`movieId`) REFERENCES `movies`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `movie_reviews`
  ADD CONSTRAINT `movie_reviews_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;


