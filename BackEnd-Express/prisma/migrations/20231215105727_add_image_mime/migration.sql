/*
  Warnings:

  - Added the required column `imageMime` to the `pictures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pictures` ADD COLUMN `imageMime` VARCHAR(25) NOT NULL;
