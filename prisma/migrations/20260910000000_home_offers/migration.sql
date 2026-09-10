ALTER TABLE `Setting` ADD COLUMN `homeOffers` TEXT NULL;
UPDATE `Setting` SET `homeOffers` = '{}' WHERE `homeOffers` IS NULL;
ALTER TABLE `Setting` MODIFY `homeOffers` TEXT NOT NULL;
