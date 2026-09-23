ALTER TABLE `Setting` ADD COLUMN `homeJustAdded` TEXT NULL;
UPDATE `Setting` SET `homeJustAdded` = '' WHERE `homeJustAdded` IS NULL;
ALTER TABLE `Setting` MODIFY `homeJustAdded` TEXT NOT NULL;
