ALTER TABLE `Setting` ADD COLUMN `homeBanners` TEXT NULL;
UPDATE `Setting` SET `homeBanners` = '[]' WHERE `homeBanners` IS NULL;
ALTER TABLE `Setting` MODIFY `homeBanners` TEXT NOT NULL;
