/*
  Warnings:

  - A unique constraint covering the columns `[applicationNumber]` on the table `StudentApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StudentApplication" ADD COLUMN     "applicationNumber" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "StudentApplication_applicationNumber_key" ON "StudentApplication"("applicationNumber");
