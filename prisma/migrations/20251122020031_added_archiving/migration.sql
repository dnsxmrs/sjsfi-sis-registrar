-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'ARCHIVED';

-- AlterEnum
ALTER TYPE "RequirementStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "FamilyBackground" ADD COLUMN     "relationToApplicant" VARCHAR(100);
