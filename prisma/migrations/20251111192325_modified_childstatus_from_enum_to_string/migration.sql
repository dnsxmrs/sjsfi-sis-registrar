/*
  Warnings:

  - The `childStatus` column on the `StudentApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StudentApplication" DROP COLUMN "childStatus",
ADD COLUMN     "childStatus" VARCHAR(50) NOT NULL DEFAULT 'LEGITIMATE';
