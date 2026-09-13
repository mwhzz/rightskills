-- AlterTable
ALTER TABLE `Course` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

SET @row := 0;
UPDATE `Course` SET `sortOrder` = (@row := @row + 1) ORDER BY `createdAt` DESC;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `staffAccess` VARCHAR(500) NOT NULL DEFAULT '["full"]';

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL DEFAULT '',
    `detail` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
