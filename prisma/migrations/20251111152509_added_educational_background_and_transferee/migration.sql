-- CreateTable
CREATE TABLE "EducationalBackground" (
    "id" SERIAL NOT NULL,
    "studentFormId" INTEGER NOT NULL,
    "yearLevel" TEXT,
    "schoolName" TEXT,
    "schoolAddress" TEXT,
    "inclusiveYearsAttended" TEXT,
    "attendedSummerClasses" BOOLEAN,
    "summerClassDetails" TEXT,
    "yearRepeated" TEXT,
    "numberOfSubjectsFailed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EducationalBackground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HonorsAwards" (
    "id" SERIAL NOT NULL,
    "educationalId" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HonorsAwards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transferee" (
    "id" SERIAL NOT NULL,
    "studentFormId" INTEGER NOT NULL,
    "reasonForTransfer" VARCHAR(255) NOT NULL,
    "disiplinaryRecord" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transferee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviousSchool" (
    "id" SERIAL NOT NULL,
    "transferId" INTEGER NOT NULL,
    "schoolName" VARCHAR(255) NOT NULL,
    "schoolAddress" VARCHAR(255) NOT NULL,
    "inclusiveYears" VARCHAR(100) NOT NULL,
    "reasonForLeaving" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PreviousSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentSchool" (
    "id" SERIAL NOT NULL,
    "transferId" INTEGER NOT NULL,
    "schoolName" VARCHAR(255) NOT NULL,
    "schoolAddress" VARCHAR(255) NOT NULL,
    "inclusiveYears" VARCHAR(100) NOT NULL,
    "reasonForLeaving" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PresentSchool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EducationalBackground_studentFormId_key" ON "EducationalBackground"("studentFormId");

-- CreateIndex
CREATE UNIQUE INDEX "Transferee_studentFormId_key" ON "Transferee"("studentFormId");

-- CreateIndex
CREATE UNIQUE INDEX "PreviousSchool_transferId_key" ON "PreviousSchool"("transferId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentSchool_transferId_key" ON "PresentSchool"("transferId");

-- AddForeignKey
ALTER TABLE "EducationalBackground" ADD CONSTRAINT "EducationalBackground_studentFormId_fkey" FOREIGN KEY ("studentFormId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HonorsAwards" ADD CONSTRAINT "HonorsAwards_educationalId_fkey" FOREIGN KEY ("educationalId") REFERENCES "EducationalBackground"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferee" ADD CONSTRAINT "Transferee_studentFormId_fkey" FOREIGN KEY ("studentFormId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviousSchool" ADD CONSTRAINT "PreviousSchool_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transferee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentSchool" ADD CONSTRAINT "PresentSchool_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transferee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
