-- AlterTable
ALTER TABLE `Course` ADD COLUMN `purchaseNote` TEXT NOT NULL DEFAULT '';
ALTER TABLE `Course` ADD COLUMN `includes` JSON NULL;
ALTER TABLE `Course` ADD COLUMN `instructorPhoto` VARCHAR(191) NULL;
