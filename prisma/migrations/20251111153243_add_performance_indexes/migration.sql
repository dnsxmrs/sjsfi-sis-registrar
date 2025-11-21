-- DropForeignKey
ALTER TABLE "ContactNumber" DROP CONSTRAINT "ContactNumber_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "FamilyBackground" DROP CONSTRAINT "FamilyBackground_studentFormId_fkey";

-- DropForeignKey
ALTER TABLE "Guardian" DROP CONSTRAINT "Guardian_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "HealthHistory" DROP CONSTRAINT "HealthHistory_studentFormId_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationCode" DROP CONSTRAINT "RegistrationCode_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "RegistrationCode" DROP CONSTRAINT "RegistrationCode_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- CreateIndex
CREATE INDEX "AcademicTerm_status_startDate_idx" ON "AcademicTerm"("status", "startDate");

-- CreateIndex
CREATE INDEX "AcademicTerm_year_status_idx" ON "AcademicTerm"("year", "status");

-- CreateIndex
CREATE INDEX "ContactNumber_registrationId_status_idx" ON "ContactNumber"("registrationId", "status");

-- CreateIndex
CREATE INDEX "ContactNumber_number_idx" ON "ContactNumber"("number");

-- CreateIndex
CREATE INDEX "FamilyBackground_studentFormId_guardianType_idx" ON "FamilyBackground"("studentFormId", "guardianType");

-- CreateIndex
CREATE INDEX "FamilyBackground_emailAddress_idx" ON "FamilyBackground"("emailAddress");

-- CreateIndex
CREATE INDEX "FamilyBackground_mobileNo_idx" ON "FamilyBackground"("mobileNo");

-- CreateIndex
CREATE INDEX "Feedback_type_status_idx" ON "Feedback"("type", "status");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "GeneralPolicy_status_idx" ON "GeneralPolicy"("status");

-- CreateIndex
CREATE INDEX "GeneralPolicy_updatedAt_idx" ON "GeneralPolicy"("updatedAt");

-- CreateIndex
CREATE INDEX "Guardian_registrationId_status_idx" ON "Guardian"("registrationId", "status");

-- CreateIndex
CREATE INDEX "HonorsAwards_educationalId_idx" ON "HonorsAwards"("educationalId");

-- CreateIndex
CREATE INDEX "Registration_status_schoolYearRef_idx" ON "Registration"("status", "schoolYearRef");

-- CreateIndex
CREATE INDEX "Registration_schoolYearRef_yearLevelRef_status_idx" ON "Registration"("schoolYearRef", "yearLevelRef", "status");

-- CreateIndex
CREATE INDEX "Registration_studentNo_status_idx" ON "Registration"("studentNo", "status");

-- CreateIndex
CREATE INDEX "Registration_emailAddress_idx" ON "Registration"("emailAddress");

-- CreateIndex
CREATE INDEX "Registration_createdAt_idx" ON "Registration"("createdAt");

-- CreateIndex
CREATE INDEX "Registration_familyName_firstName_idx" ON "Registration"("familyName", "firstName");

-- CreateIndex
CREATE INDEX "Registration_registrationType_status_idx" ON "Registration"("registrationType", "status");

-- CreateIndex
CREATE INDEX "RegistrationCode_status_expirationDate_idx" ON "RegistrationCode"("status", "expirationDate");

-- CreateIndex
CREATE INDEX "RegistrationCode_registrationCode_status_idx" ON "RegistrationCode"("registrationCode", "status");

-- CreateIndex
CREATE INDEX "RegistrationCode_applicationId_idx" ON "RegistrationCode"("applicationId");

-- CreateIndex
CREATE INDEX "Requirements_status_requirementType_idx" ON "Requirements"("status", "requirementType");

-- CreateIndex
CREATE INDEX "Requirements_createdAt_idx" ON "Requirements"("createdAt");

-- CreateIndex
CREATE INDEX "Student_studentNumber_deletedAt_idx" ON "Student"("studentNumber", "deletedAt");

-- CreateIndex
CREATE INDEX "StudentApplication_status_academicYear_idx" ON "StudentApplication"("status", "academicYear");

-- CreateIndex
CREATE INDEX "StudentApplication_academicYear_admissionToGrade_status_idx" ON "StudentApplication"("academicYear", "admissionToGrade", "status");

-- CreateIndex
CREATE INDEX "StudentApplication_emailAddress_idx" ON "StudentApplication"("emailAddress");

-- CreateIndex
CREATE INDEX "StudentApplication_createdBy_idx" ON "StudentApplication"("createdBy");

-- CreateIndex
CREATE INDEX "StudentApplication_createdAt_idx" ON "StudentApplication"("createdAt");

-- CreateIndex
CREATE INDEX "StudentApplication_familyName_firstName_idx" ON "StudentApplication"("familyName", "firstName");

-- CreateIndex
CREATE INDEX "StudentApplication_mobileNumber_idx" ON "StudentApplication"("mobileNumber");

-- CreateIndex
CREATE INDEX "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_userId_timestamp_idx" ON "SystemLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_actionCategory_timestamp_idx" ON "SystemLog"("actionCategory", "timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_actionCategory_actionType_timestamp_idx" ON "SystemLog"("actionCategory", "actionType", "timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_targetType_targetId_idx" ON "SystemLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "SystemLog_status_severityLevel_idx" ON "SystemLog"("status", "severityLevel");

-- CreateIndex
CREATE INDEX "SystemLog_sessionId_idx" ON "SystemLog"("sessionId");

-- CreateIndex
CREATE INDEX "SystemLog_ipAddress_idx" ON "SystemLog"("ipAddress");

-- CreateIndex
CREATE INDEX "SystemLog_severityLevel_timestamp_idx" ON "SystemLog"("severityLevel", "timestamp");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "User_email_status_idx" ON "User"("email", "status");

-- CreateIndex
CREATE INDEX "User_familyName_firstName_idx" ON "User"("familyName", "firstName");

-- CreateIndex
CREATE INDEX "YearLevel_status_idx" ON "YearLevel"("status");

-- CreateIndex
CREATE INDEX "YearLevel_name_status_idx" ON "YearLevel"("name", "status");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNumber" ADD CONSTRAINT "ContactNumber_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthHistory" ADD CONSTRAINT "HealthHistory_studentFormId_fkey" FOREIGN KEY ("studentFormId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBackground" ADD CONSTRAINT "FamilyBackground_studentFormId_fkey" FOREIGN KEY ("studentFormId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationCode" ADD CONSTRAINT "RegistrationCode_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "StudentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationCode" ADD CONSTRAINT "RegistrationCode_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
