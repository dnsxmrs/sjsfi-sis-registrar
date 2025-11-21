-- AlterTable
ALTER TABLE "Requirements" ADD COLUMN     "studentApplicationId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Requirements" ADD CONSTRAINT "Requirements_studentApplicationId_fkey" FOREIGN KEY ("studentApplicationId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
