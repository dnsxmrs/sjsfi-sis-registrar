"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { submitStudentApplication } from "@/app/_actions/submitStudentApplication";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// interface ParentInfo {
//   familyName: string;
//   firstName: string;
//   middleName: string;
//   occupation: string;
//   relation: string;
// }

interface SchoolInfo {
  name: string;
  address: string;
  gradeYearLevel: string | number;
}

interface HealthHistory {
  childhoodDiseases?: string;
  allergies?: string;
  otherMedicalConditions?: string;
  immunizations?: string;
  physicalHandicaps?: string;
}

interface BackgroundInfo {
  familyName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  placeOfBirth?: string;
  age?: string;
  nationality?: string;
  religion?: string;
  landlineNumber?: string;
  mobileNumber?: string;
  emailAddress?: string;
  homeAddress?: string;
  city?: string;
  stateProvince?: string;
  zipPostalCode?: string;
  educationalAttainmentCourse?: string;
  occupationalPositionHeld?: string;
  employerCompany?: string;
  companyAddress?: string;
  businessTelephoneNumber?: string;
  annualIncome?: string;
  statusOfParent?: string;
}

interface FamilyMember {
  familyName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  age?: string;
  gradeYearLevel?: string;
  schoolEmployer?: string;
}

interface EducationalBackground {
  gradeYearLevel?: string;
  schoolName?: string;
  schoolAddress?: string;
  inclusiveYears?: string;
  honorsAwardsReceived?: string;
  gradeYearLevelRepeated?: string;
  numberOfSubjectsFailed?: string;
}

interface ReviewModalFormStudentsProps {
  show: boolean;
  onClose: () => void;
  onSubmitSuccess?: (applicationId: number) => void;
  registrationCode?: string; // Add registration code prop

  personalData: {
    academicYear: string;
    admissionGradeYear: string;
    familyName: string;
    firstName: string;
    middleName: string;
    nickname: string;
    birthDate: string;
    placeOfBirth: string;
    age: string;
    birthOrder: string;
    siblingsCount: string;
    gender: string;
    nationality: string;
    religion: string;
    height: string;
    weight: string;
    bloodType: string;
    languages: string;
    childStatus: string;
    landline: string;
    mobile: string;
    email: string;
    homeAddress: string;
    homeCity: string;
    homeStateProvince: string;
    homeZip: string;
    provincialAddress: string;
    provincialCity: string;
    provincialStateProvince: string;
    provincialZip: string;
    talents: string;
    hobbies: string;
  };

  healthHistory: HealthHistory;
  fatherBackground: BackgroundInfo;
  motherBackground: BackgroundInfo;
  guardianBackground: BackgroundInfo;
  familyMembers: FamilyMember[];
  educationalBackground: EducationalBackground[];

  transferee: {
    previousSchool: SchoolInfo;
    presentSchool: SchoolInfo;
    reasonForTransfer: string;
    disciplinaryActions: string;
  };
}

const ReviewModalFormStudents: React.FC<ReviewModalFormStudentsProps> = ({
  show,
  onClose,
  onSubmitSuccess,
  registrationCode,
  personalData,
  transferee,
  healthHistory,
  fatherBackground,
  motherBackground,
  guardianBackground,
  familyMembers,
  educationalBackground,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Helper function to check if an object has meaningful data
  const hasData = (obj: Record<string, unknown>, excludeFields: string[] = []): boolean => {
    return Object.entries(obj).some(([key, value]) => {
      if (excludeFields.includes(key)) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return true;
      if (typeof value === 'object' && value !== null) {
        return hasData(value as Record<string, unknown>);
      }
      return false;
    });
  };

  // Helper function to check if at least 50% of required fields are filled for parent/guardian
  const hasMinimumParentData = (parentData: BackgroundInfo): boolean => {
    if (!parentData) return false;
    
    // Define key required fields for parent/guardian information (total: 8 fields)
    const requiredFieldChecks = [
      parentData.familyName?.trim(),              // 1. Family name
      parentData.firstName?.trim(),               // 2. First name
      parentData.birthDate?.trim(),               // 3. Birth date
      parentData.age?.trim(),                     // 4. Age
      // 5. At least one contact method
      parentData.mobileNumber?.trim() || parentData.landlineNumber?.trim() || parentData.emailAddress?.trim(),
      parentData.educationalAttainmentCourse?.trim(), // 6. Educational attainment
      parentData.occupationalPositionHeld?.trim(),    // 7. Occupation
      parentData.homeAddress?.trim()              // 8. Home address
    ];
    
    const filledCount = requiredFieldChecks.filter(Boolean).length;
    const percentageFilled = (filledCount / requiredFieldChecks.length) * 100;
    
    return percentageFilled >= 50;
  };

  // Check if transferee has data (both schools and reasons)
  const hasTransfereeData = 
    transferee && (
      hasData(transferee.previousSchool as unknown as Record<string, unknown>) ||
      hasData(transferee.presentSchool as unknown as Record<string, unknown>) ||
      transferee.reasonForTransfer?.trim() !== '' ||
      transferee.disciplinaryActions?.trim() !== ''
    );

  // Check if health history has data
  const hasHealthHistoryData = healthHistory && hasData(healthHistory as unknown as Record<string, unknown>);

  // Check if father background has at least 50% of required fields filled
  const hasFatherData = hasMinimumParentData(fatherBackground);

  // Check if mother background has at least 50% of required fields filled
  const hasMotherData = hasMinimumParentData(motherBackground);

  // Check if guardian background has at least 50% of required fields filled
  const hasGuardianData = hasMinimumParentData(guardianBackground);

  // Check if family members have data
  const hasFamilyMembersData = familyMembers && familyMembers.length > 0 && familyMembers.some(member => 
    hasData(member as unknown as Record<string, unknown>)
  );

  // Check if educational background has data
  const hasEducationalBackgroundData = educationalBackground && educationalBackground.length > 0 && educationalBackground.some(edu => 
    hasData(edu as unknown as Record<string, unknown>)
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const applicationData = {
        personalData,
        healthHistory,
        fatherBackground,
        motherBackground,
        guardianBackground,
        transferee,
        familyMembers,
        educationalBackground,
        registrationCode
      };

      // console.log(applicationData)

      const result = await submitStudentApplication(applicationData);

      if (result.success && result.applicationId) {
        toast.success(result.message || "Application submitted successfully!");
        onSubmitSuccess?.(result.applicationId);
        // clear localstorage
        localStorage.clear();
        onClose();
        router.push(`/forms/home`);
      } else {
        toast.error(result.error || "Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-center text-gray-800 flex-1">
              Review Your Application Information
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6 text-red-800" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Please review all information carefully before submitting your application.
          </p>

          <div className="space-y-6 text-sm text-black">
            {/* Registration Code */}
            {registrationCode && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Registration Information</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div><span className="font-medium text-blue-700">Registration Code Used:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">{registrationCode}</span></div>
                </div>
              </div>
            )}

            {/* Personal Data - Always show */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Personal Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Academic Year:</span> {personalData.academicYear || "N/A"}</div>
                <div><span className="font-medium">Admission Grade/Year:</span> {personalData.admissionGradeYear || "N/A"}</div>
                <div><span className="font-medium">Full Name:</span> {`${personalData.firstName || "N/A"} ${personalData.middleName || "N/A"} ${personalData.familyName || "N/A"}`.trim()}</div>
                <div><span className="font-medium">Nickname:</span> {personalData.nickname || "N/A"}</div>
                <div><span className="font-medium">Birth Date:</span> {personalData.birthDate || "N/A"}</div>
                <div><span className="font-medium">Place of Birth:</span> {personalData.placeOfBirth || "N/A"}</div>
                <div><span className="font-medium">Age:</span> {personalData.age || "N/A"}</div>
                <div><span className="font-medium">Birth Order:</span> {personalData.birthOrder || "N/A"}</div>
                <div><span className="font-medium">Number of Siblings:</span> {personalData.siblingsCount || "N/A"}</div>
                <div><span className="font-medium">Gender:</span> {personalData.gender || "N/A"}</div>
                <div><span className="font-medium">Nationality:</span> {personalData.nationality || "N/A"}</div>
                <div><span className="font-medium">Religion:</span> {personalData.religion || "N/A"}</div>
                <div><span className="font-medium">Height:</span> {personalData.height || "N/A"} cm</div>
                <div><span className="font-medium">Weight:</span> {personalData.weight || "N/A"} kg</div>
                <div><span className="font-medium">Blood Type:</span> {personalData.bloodType || "N/A"}</div>
                <div><span className="font-medium">Languages/Dialect:</span> {personalData.languages || "N/A"}</div>
                <div><span className="font-medium">Status:</span> {personalData.childStatus || "N/A"}</div>
                <div><span className="font-medium">Landline Number:</span> {personalData.landline || "N/A"}</div>
                <div><span className="font-medium">Mobile Number:</span> {personalData.mobile || "N/A"}</div>
                <div className="md:col-span-3"><span className="font-medium">Email Address:</span> {personalData.email || "N/A"}</div>
                <div className="md:col-span-3"><span className="font-medium">Home Address:</span> {personalData.homeAddress || "N/A"}, {personalData.homeCity || "N/A"}, {personalData.homeStateProvince || "N/A"}, {personalData.homeZip || "N/A"}</div>
                <div className="md:col-span-3"><span className="font-medium">Provincial Address:</span> {personalData.provincialAddress || "N/A"}, {personalData.provincialCity || "N/A"}, {personalData.provincialStateProvince || "N/A"}, {personalData.provincialZip || "N/A"}</div>
                <div className="md:col-span-3"><span className="font-medium">Talents/Special Skills:</span> {personalData.talents || "N/A"}</div>
                <div className="md:col-span-3"><span className="font-medium">Hobbies and Interests:</span> {personalData.hobbies || "N/A"}</div>
              </div>
            </div>

            {/* Health History - Conditional */}
            {hasHealthHistoryData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Health History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><span className="font-medium">Childhood Diseases:</span> {healthHistory.childhoodDiseases || "N/A"}</div>
                  <div><span className="font-medium">Allergies:</span> {healthHistory.allergies || "N/A"}</div>
                  <div><span className="font-medium">Other Medical Conditions:</span> {healthHistory.otherMedicalConditions || "N/A"}</div>
                  <div><span className="font-medium">Immunizations:</span> {healthHistory.immunizations || "N/A"}</div>
                  <div className="md:col-span-2"><span className="font-medium">Physical Handicaps or Special Needs:</span> {healthHistory.physicalHandicaps || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Father Background - Conditional */}
            {hasFatherData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Father Background</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="font-medium">Full Name:</span> {`${fatherBackground.firstName || ""} ${fatherBackground.middleName || ""} ${fatherBackground.familyName || ""}`.trim() || "N/A"}</div>
                  <div><span className="font-medium">Birth Date:</span> {fatherBackground.birthDate || "N/A"}</div>
                  <div><span className="font-medium">Place of Birth:</span> {fatherBackground.placeOfBirth || "N/A"}</div>
                  <div><span className="font-medium">Age:</span> {fatherBackground.age || "N/A"}</div>
                  <div><span className="font-medium">Nationality:</span> {fatherBackground.nationality || "N/A"}</div>
                  <div><span className="font-medium">Religion:</span> {fatherBackground.religion || "N/A"}</div>
                  <div><span className="font-medium">Mobile Number:</span> {fatherBackground.mobileNumber || "N/A"}</div>
                  <div><span className="font-medium">Landline Number:</span> {fatherBackground.landlineNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">E-mail Address:</span> {fatherBackground.emailAddress || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Home Address:</span> {fatherBackground.homeAddress || "N/A"}, {fatherBackground.city || "N/A"}, {fatherBackground.stateProvince || "N/A"}, {fatherBackground.zipPostalCode || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Educational Attainment/Course:</span> {fatherBackground.educationalAttainmentCourse || "N/A"}</div>
                  <div><span className="font-medium">Occupation/Position:</span> {fatherBackground.occupationalPositionHeld || "N/A"}</div>
                  <div><span className="font-medium">Employer/Company:</span> {fatherBackground.employerCompany || "N/A"}</div>
                  <div><span className="font-medium">Business Tel.:</span> {fatherBackground.businessTelephoneNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Company Address:</span> {fatherBackground.companyAddress || "N/A"}</div>
                  <div><span className="font-medium">Annual Income:</span> {fatherBackground.annualIncome || "N/A"}</div>
                  <div><span className="font-medium">Status:</span> {fatherBackground.statusOfParent || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Mother Background - Conditional */}
            {hasMotherData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Mother Background</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="font-medium">Full Name:</span> {`${motherBackground.firstName || ""} ${motherBackground.middleName || ""} ${motherBackground.familyName || ""}`.trim() || "N/A"}</div>
                  <div><span className="font-medium">Birth Date:</span> {motherBackground.birthDate || "N/A"}</div>
                  <div><span className="font-medium">Place of Birth:</span> {motherBackground.placeOfBirth || "N/A"}</div>
                  <div><span className="font-medium">Age:</span> {motherBackground.age || "N/A"}</div>
                  <div><span className="font-medium">Nationality:</span> {motherBackground.nationality || "N/A"}</div>
                  <div><span className="font-medium">Religion:</span> {motherBackground.religion || "N/A"}</div>
                  <div><span className="font-medium">Mobile Number:</span> {motherBackground.mobileNumber || "N/A"}</div>
                  <div><span className="font-medium">Landline Number:</span> {motherBackground.landlineNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">E-mail Address:</span> {motherBackground.emailAddress || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Home Address:</span> {motherBackground.homeAddress || "N/A"}, {motherBackground.city || "N/A"}, {motherBackground.stateProvince || "N/A"}, {motherBackground.zipPostalCode || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Educational Attainment/Course:</span> {motherBackground.educationalAttainmentCourse || "N/A"}</div>
                  <div><span className="font-medium">Occupation/Position:</span> {motherBackground.occupationalPositionHeld || "N/A"}</div>
                  <div><span className="font-medium">Employer/Company:</span> {motherBackground.employerCompany || "N/A"}</div>
                  <div><span className="font-medium">Business Tel.:</span> {motherBackground.businessTelephoneNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Company Address:</span> {motherBackground.companyAddress || "N/A"}</div>
                  <div><span className="font-medium">Annual Income:</span> {motherBackground.annualIncome || "N/A"}</div>
                  <div><span className="font-medium">Status:</span> {motherBackground.statusOfParent || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Guardian Background - Conditional */}
            {hasGuardianData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Guardian Background</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="font-medium">Full Name:</span> {`${guardianBackground.firstName || ""} ${guardianBackground.middleName || ""} ${guardianBackground.familyName || ""}`.trim() || "N/A"}</div>
                  <div><span className="font-medium">Birth Date:</span> {guardianBackground.birthDate || "N/A"}</div>
                  <div><span className="font-medium">Place of Birth:</span> {guardianBackground.placeOfBirth || "N/A"}</div>
                  <div><span className="font-medium">Age:</span> {guardianBackground.age || "N/A"}</div>
                  <div><span className="font-medium">Nationality:</span> {guardianBackground.nationality || "N/A"}</div>
                  <div><span className="font-medium">Religion:</span> {guardianBackground.religion || "N/A"}</div>
                  <div><span className="font-medium">Mobile Number:</span> {guardianBackground.mobileNumber || "N/A"}</div>
                  <div><span className="font-medium">Landline Number:</span> {guardianBackground.landlineNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">E-mail Address:</span> {guardianBackground.emailAddress || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Home Address:</span> {guardianBackground.homeAddress || "N/A"}, {guardianBackground.city || "N/A"}, {guardianBackground.stateProvince || "N/A"}, {guardianBackground.zipPostalCode || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Educational Attainment/Course:</span> {guardianBackground.educationalAttainmentCourse || "N/A"}</div>
                  <div><span className="font-medium">Occupation/Position:</span> {guardianBackground.occupationalPositionHeld || "N/A"}</div>
                  <div><span className="font-medium">Employer/Company:</span> {guardianBackground.employerCompany || "N/A"}</div>
                  <div><span className="font-medium">Business Tel.:</span> {guardianBackground.businessTelephoneNumber || "N/A"}</div>
                  <div className="md:col-span-3"><span className="font-medium">Company Address:</span> {guardianBackground.companyAddress || "N/A"}</div>
                  <div><span className="font-medium">Annual Income:</span> {guardianBackground.annualIncome || "N/A"}</div>
                  <div><span className="font-medium">Status:</span> {guardianBackground.statusOfParent || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Family Members - Conditional */}
            {hasFamilyMembersData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Family Members (Siblings)</h4>
                <div className="space-y-3">
                  {familyMembers.map((member, index) => (
                    <div key={index} className="border border-gray-300 p-3 rounded bg-white">
                      <h5 className="font-medium text-gray-700 mb-2">Sibling #{index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="font-medium">Full Name:</span> {`${member.firstName || ""} ${member.middleName || ""} ${member.familyName || ""}`.trim() || "N/A"}</div>
                        <div><span className="font-medium">Birth Date:</span> {member.birthDate || "N/A"}</div>
                        <div><span className="font-medium">Age:</span> {member.age || "N/A"}</div>
                        <div><span className="font-medium">Grade/Year Level:</span> {member.gradeYearLevel || "N/A"}</div>
                        <div className="md:col-span-2"><span className="font-medium">School/Employer:</span> {member.schoolEmployer || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Educational Background - Conditional */}
            {hasEducationalBackgroundData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Educational Background</h4>
                <div className="space-y-3">
                  {educationalBackground.map((edu, index) => (
                    <div key={index} className="border border-gray-300 p-3 rounded bg-white">
                      <h5 className="font-medium text-gray-700 mb-2">School #{index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="font-medium">Grade/Year Level:</span> {edu.gradeYearLevel || "N/A"}</div>
                        <div><span className="font-medium">School Name:</span> {edu.schoolName || "N/A"}</div>
                        <div><span className="font-medium">Inclusive Years:</span> {edu.inclusiveYears || "N/A"}</div>
                        <div className="md:col-span-3"><span className="font-medium">School Address:</span> {edu.schoolAddress || "N/A"}</div>
                        <div className="md:col-span-3"><span className="font-medium">Honors/Awards Received:</span> {edu.honorsAwardsReceived || "N/A"}</div>
                        <div><span className="font-medium">Grade/Year Repeated:</span> {edu.gradeYearLevelRepeated || "N/A"}</div>
                        <div><span className="font-medium">Subjects Failed:</span> {edu.numberOfSubjectsFailed || "N/A"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transferee Data - Conditional */}
            {hasTransfereeData && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Transferee Information</h4>
                <div className="space-y-4">
                  {hasData(transferee.previousSchool as unknown as Record<string, unknown>) && (
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h5 className="font-medium text-gray-700 mb-2">Previous School</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">School Name:</span> {transferee.previousSchool.name || "N/A"}</div>
                        <div><span className="font-medium">Grade/Year Level:</span> {transferee.previousSchool.gradeYearLevel || "N/A"}</div>
                        <div className="md:col-span-2"><span className="font-medium">School Address:</span> {transferee.previousSchool.address || "N/A"}</div>
                      </div>
                    </div>
                  )}
                  {hasData(transferee.presentSchool as unknown as Record<string, unknown>) && (
                    <div className="border-l-4 border-green-500 pl-3">
                      <h5 className="font-medium text-gray-700 mb-2">Present School</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">School Name:</span> {transferee.presentSchool.name || "N/A"}</div>
                        <div><span className="font-medium">Grade/Year Level:</span> {transferee.presentSchool.gradeYearLevel || "N/A"}</div>
                        <div className="md:col-span-2"><span className="font-medium">School Address:</span> {transferee.presentSchool.address || "N/A"}</div>
                      </div>
                    </div>
                  )}
                  {transferee.reasonForTransfer?.trim() && (
                    <div>
                      <span className="font-medium">Reason for Transfer:</span>
                      <p className="mt-1 text-gray-700 bg-white p-2 rounded border border-gray-200">{transferee.reasonForTransfer}</p>
                    </div>
                  )}
                  {transferee.disciplinaryActions?.trim() && (
                    <div>
                      <span className="font-medium">Disciplinary Actions:</span>
                      <p className="mt-1 text-gray-700 bg-white p-2 rounded border border-gray-200">{transferee.disciplinaryActions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded text-white transition ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModalFormStudents;
