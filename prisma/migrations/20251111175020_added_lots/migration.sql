/*
  Warnings:

  - You are about to drop the column `studentFormId` on the `HealthHistory` table. All the data in the column will be lost.
  - You are about to drop the column `schoolYearRef` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `yearLevelRef` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `academicYear` on the `StudentApplication` table. All the data in the column will be lost.
  - You are about to drop the column `admissionToGrade` on the `StudentApplication` table. All the data in the column will be lost.
  - You are about to drop the column `landLine` on the `StudentApplication` table. All the data in the column will be lost.
  - You are about to drop the column `specialSkills` on the `StudentApplication` table. All the data in the column will be lost.
  - You are about to alter the column `hobbiesInterests` on the `StudentApplication` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[studentApplicationId]` on the table `HealthHistory` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `parentStatus` on the `FamilyBackground` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `studentApplicationId` to the `HealthHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolYearId` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearLevelId` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodType` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heightCm` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `landlineNumber` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincialAddress` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincialCity` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincialPostalCode` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincialStateProvince` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `talents` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightKg` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearLevelId` to the `StudentApplication` table without a default value. This is not possible if the table is not empty.
  - Made the column `middleName` on table `StudentApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nickName` on table `StudentApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `childStatus` on table `StudentApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hobbiesInterests` on table `StudentApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ChildStatus" ADD VALUE 'BIOLOGICAL';

-- DropForeignKey
ALTER TABLE "HealthHistory" DROP CONSTRAINT "HealthHistory_studentFormId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_schoolYearRef_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_yearLevelRef_fkey";

-- DropIndex
DROP INDEX "HealthHistory_studentFormId_key";

-- DropIndex
DROP INDEX "Registration_schoolYearRef_yearLevelRef_status_idx";

-- DropIndex
DROP INDEX "Registration_status_schoolYearRef_idx";

-- DropIndex
DROP INDEX "StudentApplication_academicYear_admissionToGrade_status_idx";

-- DropIndex
DROP INDEX "StudentApplication_status_academicYear_idx";

-- AlterTable
ALTER TABLE "FamilyBackground" DROP COLUMN "parentStatus",
ADD COLUMN     "parentStatus" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "HealthHistory" DROP COLUMN "studentFormId",
ADD COLUMN     "studentApplicationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "schoolYearRef",
DROP COLUMN "yearLevelRef",
ADD COLUMN     "schoolYearId" INTEGER NOT NULL,
ADD COLUMN     "yearLevelId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudentApplication" DROP COLUMN "academicYear",
DROP COLUMN "admissionToGrade",
DROP COLUMN "landLine",
DROP COLUMN "specialSkills",
ADD COLUMN     "academicYearId" INTEGER NOT NULL,
ADD COLUMN     "bloodType" VARCHAR(3) NOT NULL,
ADD COLUMN     "heightCm" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "landlineNumber" VARCHAR(50) NOT NULL,
ADD COLUMN     "nationality" VARCHAR(100) NOT NULL,
ADD COLUMN     "provincialAddress" VARCHAR(255) NOT NULL,
ADD COLUMN     "provincialCity" VARCHAR(100) NOT NULL,
ADD COLUMN     "provincialPostalCode" VARCHAR(20) NOT NULL,
ADD COLUMN     "provincialStateProvince" VARCHAR(100) NOT NULL,
ADD COLUMN     "religion" VARCHAR(100) NOT NULL,
ADD COLUMN     "talents" VARCHAR(255) NOT NULL,
ADD COLUMN     "weightKg" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "yearLevelId" INTEGER NOT NULL,
ALTER COLUMN "middleName" SET NOT NULL,
ALTER COLUMN "nickName" SET NOT NULL,
ALTER COLUMN "childStatus" SET NOT NULL,
ALTER COLUMN "hobbiesInterests" SET NOT NULL,
ALTER COLUMN "hobbiesInterests" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Siblings" (
    "id" SERIAL NOT NULL,
    "studentApplicationId" INTEGER NOT NULL,
    "familyName" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255),
    "birthDate" DATE NOT NULL,
    "age" INTEGER NOT NULL,
    "gradeYearLevel" VARCHAR(100) NOT NULL,
    "schoolEmployer" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Siblings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthHistory_studentApplicationId_key" ON "HealthHistory"("studentApplicationId");

-- CreateIndex
CREATE INDEX "Registration_status_schoolYearId_idx" ON "Registration"("status", "schoolYearId");

-- CreateIndex
CREATE INDEX "Registration_schoolYearId_yearLevelId_status_idx" ON "Registration"("schoolYearId", "yearLevelId", "status");

-- CreateIndex
CREATE INDEX "StudentApplication_status_academicYearId_idx" ON "StudentApplication"("status", "academicYearId");

-- CreateIndex
CREATE INDEX "StudentApplication_academicYearId_yearLevelId_status_idx" ON "StudentApplication"("academicYearId", "yearLevelId", "status");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "AcademicTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_yearLevelId_fkey" FOREIGN KEY ("yearLevelId") REFERENCES "YearLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_yearLevelId_fkey" FOREIGN KEY ("yearLevelId") REFERENCES "YearLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthHistory" ADD CONSTRAINT "HealthHistory_studentApplicationId_fkey" FOREIGN KEY ("studentApplicationId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siblings" ADD CONSTRAINT "Siblings_studentApplicationId_fkey" FOREIGN KEY ("studentApplicationId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
