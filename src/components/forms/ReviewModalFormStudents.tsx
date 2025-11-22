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

      const result = await submitStudentApplication(applicationData);

      if (result.success && result.applicationId) {
        toast.success(result.message || "Application submitted successfully!");
        onSubmitSuccess?.(result.applicationId);
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

            {/* Personal Data */}
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
                <div><span className="font-medium">Height:</span> {personalData.height || "N/A"}</div>
                <div><span className="font-medium">Weight:</span> {personalData.weight || "N/A"}</div>
                <div><span className="font-medium">Blood Type:</span> {personalData.bloodType || "N/A"}</div>
                <div><span className="font-medium">Languages/Dialect:</span> {personalData.languages || "N/A"}</div>
                <div><span className="font-medium">Status:</span> {personalData.childStatus || "N/A"}</div>
                <div><span className="font-medium">Landline Number:</span> {personalData.landline || "N/A"}</div>
                <div><span className="font-medium">Mobile Number:</span> {personalData.mobile || "N/A"}</div>
                <div><span className="font-medium">Email Address:</span> {personalData.email || "N/A"}</div>
                <div><span className="font-medium">Home Address:</span> {personalData.homeAddress || "N/A"}, {personalData.homeCity || "N/A"}, {personalData.homeStateProvince || "N/A"}, {personalData.homeZip || "N/A"}</div>
                <div><span className="font-medium">Provincial Address:</span> {personalData.provincialAddress || "N/A"}, {personalData.provincialCity || "N/A"}, {personalData.provincialStateProvince || "N/A"}, {personalData.provincialZip || "N/A"}</div>
                <div><span className="font-medium">Talents/Special Skills:</span> {personalData.talents || "N/A"}</div>
                <div><span className="font-medium">Hobbies and Interests:</span> {personalData.hobbies || "N/A"}</div>
              </div>
            </div>

            {/* Transferee Data */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Transferee Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Previous School Name:</span> {transferee.previousSchool.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Previous School Address:</span> {transferee.previousSchool.address || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Previous School Grade/Year Level:</span> {transferee.previousSchool.gradeYearLevel || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Present School Name:</span> {transferee.presentSchool.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Present School Address:</span> {transferee.presentSchool.address || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Present School Grade/Year Level:</span> {transferee.presentSchool.gradeYearLevel || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Reason for Transfer:</span> {transferee.reasonForTransfer || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Disciplinary Actions:</span> {transferee.disciplinaryActions || "N/A"}
                </div>
              </div>
            </div>

            {/* Health History */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Health History</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Childhood Diseases:</span> {healthHistory.childhoodDiseases || "N/A"}</div>
                <div><span className="font-medium">Allergies:</span> {healthHistory.allergies || "N/A"}</div>
                <div><span className="font-medium">Other Medical Conditions:</span> {healthHistory.otherMedicalConditions || "N/A"}</div>
                <div><span className="font-medium">Immunizations:</span> {healthHistory.immunizations || "N/A"}</div>
                <div><span className="font-medium">Physical Handicaps or Special Needs:</span> {healthHistory.physicalHandicaps || "N/A"}</div>
              </div>
            </div>

            {/* Father Background */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Father Background</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Family Name:</span> {fatherBackground.familyName || "N/A"}</div>
                <div><span className="font-medium">First Name:</span> {fatherBackground.firstName || "N/A"}</div>
                <div><span className="font-medium">Middle Name:</span> {fatherBackground.middleName || "N/A"}</div>
                <div><span className="font-medium">Birth Date:</span> {fatherBackground.birthDate || "N/A"}</div>
                <div><span className="font-medium">Place of Birth:</span> {fatherBackground.placeOfBirth || "N/A"}</div>
                <div><span className="font-medium">Age:</span> {fatherBackground.age || "N/A"}</div>
                <div><span className="font-medium">Nationality:</span> {fatherBackground.nationality || "N/A"}</div>
                <div><span className="font-medium">Religion:</span> {fatherBackground.religion || "N/A"}</div>
                <div><span className="font-medium">Landline Number:</span> {fatherBackground.landlineNumber || "N/A"}</div>
                <div><span className="font-medium">Mobile Number:</span> {fatherBackground.mobileNumber || "N/A"}</div>
                <div><span className="font-medium">E-mail Address:</span> {fatherBackground.emailAddress || "N/A"}</div>
                <div><span className="font-medium">Home Address:</span> {fatherBackground.homeAddress || "N/A"}</div>
                <div><span className="font-medium">City:</span> {fatherBackground.city || "N/A"}</div>
                <div><span className="font-medium">State/ Province:</span> {fatherBackground.stateProvince || "N/A"}</div>
                <div><span className="font-medium">Zip/ Postal Code:</span> {fatherBackground.zipPostalCode || "N/A"}</div>
                <div><span className="font-medium">Educational Attainment/ Course:</span> {fatherBackground.educationalAttainmentCourse || "N/A"}</div>
                <div><span className="font-medium">Occupational/ Position Held:</span> {fatherBackground.occupationalPositionHeld || "N/A"}</div>
                <div><span className="font-medium">Employer/ Company:</span> {fatherBackground.employerCompany || "N/A"}</div>
                <div><span className="font-medium">Company Address:</span> {fatherBackground.companyAddress || "N/A"}</div>
                <div><span className="font-medium">Business Telephone Number:</span> {fatherBackground.businessTelephoneNumber || "N/A"}</div>
                <div><span className="font-medium">Annual Income:</span> {fatherBackground.annualIncome || "N/A"}</div>
                <div><span className="font-medium">Status of Parent:</span> {fatherBackground.statusOfParent || "N/A"}</div>
              </div>
            </div>

            {/* Mother Background */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Mother Background</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Family Name:</span> {motherBackground.familyName || "N/A"}</div>
                <div><span className="font-medium">First Name:</span> {motherBackground.firstName || "N/A"}</div>
                <div><span className="font-medium">Middle Name:</span> {motherBackground.middleName || "N/A"}</div>
                <div><span className="font-medium">Birth Date:</span> {motherBackground.birthDate || "N/A"}</div>
                <div><span className="font-medium">Place of Birth:</span> {motherBackground.placeOfBirth || "N/A"}</div>
                <div><span className="font-medium">Age:</span> {motherBackground.age || "N/A"}</div>
                <div><span className="font-medium">Nationality:</span> {motherBackground.nationality || "N/A"}</div>
                <div><span className="font-medium">Religion:</span> {motherBackground.religion || "N/A"}</div>
                <div><span className="font-medium">Landline Number:</span> {motherBackground.landlineNumber || "N/A"}</div>
                <div><span className="font-medium">Mobile Number:</span> {motherBackground.mobileNumber || "N/A"}</div>
                <div><span className="font-medium">E-mail Address:</span> {motherBackground.emailAddress || "N/A"}</div>
                <div><span className="font-medium">Home Address:</span> {motherBackground.homeAddress || "N/A"}</div>
                <div><span className="font-medium">City:</span> {motherBackground.city || "N/A"}</div>
                <div><span className="font-medium">State/ Province:</span> {motherBackground.stateProvince || "N/A"}</div>
                <div><span className="font-medium">Zip/ Postal Code:</span> {motherBackground.zipPostalCode || "N/A"}</div>
                <div><span className="font-medium">Educational Attainment/ Course:</span> {motherBackground.educationalAttainmentCourse || "N/A"}</div>
                <div><span className="font-medium">Occupational/ Position Held:</span> {motherBackground.occupationalPositionHeld || "N/A"}</div>
                <div><span className="font-medium">Employer/ Company:</span> {motherBackground.employerCompany || "N/A"}</div>
                <div><span className="font-medium">Company Address:</span> {motherBackground.companyAddress || "N/A"}</div>
                <div><span className="font-medium">Business Telephone Number:</span> {motherBackground.businessTelephoneNumber || "N/A"}</div>
                <div><span className="font-medium">Annual Income:</span> {motherBackground.annualIncome || "N/A"}</div>
                <div><span className="font-medium">Status of Parent:</span> {motherBackground.statusOfParent || "N/A"}</div>
              </div>
            </div>

            {/* Guardian Background */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Guardian Background</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><span className="font-medium">Family Name:</span> {guardianBackground.familyName || "N/A"}</div>
                <div><span className="font-medium">First Name:</span> {guardianBackground.firstName || "N/A"}</div>
                <div><span className="font-medium">Middle Name:</span> {guardianBackground.middleName || "N/A"}</div>
                <div><span className="font-medium">Birth Date:</span> {guardianBackground.birthDate || "N/A"}</div>
                <div><span className="font-medium">Place of Birth:</span> {guardianBackground.placeOfBirth || "N/A"}</div>
                <div><span className="font-medium">Age:</span> {guardianBackground.age || "N/A"}</div>
                <div><span className="font-medium">Nationality:</span> {guardianBackground.nationality || "N/A"}</div>
                <div><span className="font-medium">Religion:</span> {guardianBackground.religion || "N/A"}</div>
                <div><span className="font-medium">Landline Number:</span> {guardianBackground.landlineNumber || "N/A"}</div>
                <div><span className="font-medium">Mobile Number:</span> {guardianBackground.mobileNumber || "N/A"}</div>
                <div><span className="font-medium">E-mail Address:</span> {guardianBackground.emailAddress || "N/A"}</div>
                <div><span className="font-medium">Home Address:</span> {guardianBackground.homeAddress || "N/A"}</div>
                <div><span className="font-medium">City:</span> {guardianBackground.city || "N/A"}</div>
                <div><span className="font-medium">State/ Province:</span> {guardianBackground.stateProvince || "N/A"}</div>
                <div><span className="font-medium">Zip/ Postal Code:</span> {guardianBackground.zipPostalCode || "N/A"}</div>
                <div><span className="font-medium">Educational Attainment/ Course:</span> {guardianBackground.educationalAttainmentCourse || "N/A"}</div>
                <div><span className="font-medium">Occupational/ Position Held:</span> {guardianBackground.occupationalPositionHeld || "N/A"}</div>
                <div><span className="font-medium">Employer/ Company:</span> {guardianBackground.employerCompany || "N/A"}</div>
                <div><span className="font-medium">Company Address:</span> {guardianBackground.companyAddress || "N/A"}</div>
                <div><span className="font-medium">Business Telephone Number:</span> {guardianBackground.businessTelephoneNumber || "N/A"}</div>
                <div><span className="font-medium">Annual Income:</span> {guardianBackground.annualIncome || "N/A"}</div>
                <div><span className="font-medium">Status of Parent:</span> {guardianBackground.statusOfParent || "N/A"}</div>
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Family Members</h4>
              {familyMembers.length > 0 ? (
                <div className="space-y-2">
                  {familyMembers.map((member, index) => (
                    <div key={index} className="border p-2 rounded">
                      <div><span className="font-medium">Family Name:</span> {member.familyName || "N/A"}</div>
                      <div><span className="font-medium">First Name:</span> {member.firstName || "N/A"}</div>
                      <div><span className="font-medium">Middle Name:</span> {member.middleName || "N/A"}</div>
                      <div><span className="font-medium">Birth Date:</span> {member.birthDate || "N/A"}</div>
                      <div><span className="font-medium">Age:</span> {member.age || "N/A"}</div>
                      <div><span className="font-medium">Grade/ Year Level:</span> {member.gradeYearLevel || "N/A"}</div>
                      <div><span className="font-medium">School/Employer:</span> {member.schoolEmployer || "N/A"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>N/A</p>
              )}
            </div>

            {/* Educational Background */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-800 mb-2">Educational Background</h4>
              {educationalBackground.length > 0 ? (
                <div className="space-y-2">
                  {educationalBackground.map((edu, index) => (
                    <div key={index} className="border p-2 rounded">
                      <div><span className="font-medium">Grade/ Year Level:</span> {edu.gradeYearLevel || "N/A"}</div>
                      <div><span className="font-medium">School Name:</span> {edu.schoolName || "N/A"}</div>
                      <div><span className="font-medium">School Address:</span> {edu.schoolAddress || "N/A"}</div>
                      <div><span className="font-medium">Inclusive Years:</span> {edu.inclusiveYears || "N/A"}</div>
                      <div><span className="font-medium">Honors/ Awards Received:</span> {edu.honorsAwardsReceived || "N/A"}</div>
                      <div><span className="font-medium">Grade/ Year Level Repeated:</span> {edu.gradeYearLevelRepeated || "N/A"}</div>
                      <div><span className="font-medium">No. of Subjects Failed:</span> {edu.numberOfSubjectsFailed || "N/A"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>N/A</p>
              )}
            </div>

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
