-- AlterTable: Increase length for verification image fields to support potential Base64 fallback
ALTER TABLE `girls` 
MODIFY `idCardFrontUrl` LONGTEXT NULL,
MODIFY `idCardBackUrl` LONGTEXT NULL,
MODIFY `selfieUrl` LONGTEXT NULL;
