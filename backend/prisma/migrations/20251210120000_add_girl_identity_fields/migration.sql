-- AlterTable: Add identity verification fields to girls table
ALTER TABLE `girls` 
ADD COLUMN `idCardFrontUrl` VARCHAR(191) NULL,
ADD COLUMN `idCardBackUrl` VARCHAR(191) NULL,
ADD COLUMN `selfieUrl` VARCHAR(191) NULL,
ADD COLUMN `needsReverify` BOOLEAN NOT NULL DEFAULT false;

