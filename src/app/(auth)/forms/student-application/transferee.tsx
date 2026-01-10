import React, { useState } from "react";
import { useFormData } from "./FormDataContext";
import ReviewModalFormStudents from "@/components/forms/ReviewModalFormStudents";

interface StudentTransfereeProps {
  onBack?: () => void;
}

export default function StudentTransfereePage({ onBack }: StudentTransfereeProps) {
  const { formData, updateFormData } = useFormData();
  const { transferee } = formData;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Safety check: ensure transferee structure exists
  if (!transferee || !transferee.previousSchool || !transferee.presentSchool) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>Transferee form data is not properly initialized.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof transferee, value: string) => {
    updateFormData('transferee', {
      ...transferee,
      [field]: value
    });
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSchoolChange = (schoolType: 'previousSchool' | 'presentSchool', field: keyof typeof transferee.previousSchool, value: string) => {
    updateFormData('transferee', {
      ...transferee,
      [schoolType]: {
        ...transferee[schoolType],
        [field]: value
      }
    });
    // Clear error when user starts typing
    const errorKey = `${schoolType}.${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate previous school
    if (!transferee.previousSchool.name.trim()) {
      newErrors['previousSchool.name'] = 'Previous school name is required';
    }
    if (!transferee.previousSchool.address.trim()) {
      newErrors['previousSchool.address'] = 'Previous school address is required';
    }
    if (!transferee.previousSchool.gradeYearLevel.trim()) {
      newErrors['previousSchool.gradeYearLevel'] = 'Grade/Year level is required';
    }

    // Validate present school
    if (!transferee.presentSchool.name.trim()) {
      newErrors['presentSchool.name'] = 'Present school name is required';
    }
    if (!transferee.presentSchool.address.trim()) {
      newErrors['presentSchool.address'] = 'Present school address is required';
    }
    if (!transferee.presentSchool.gradeYearLevel.trim()) {
      newErrors['presentSchool.gradeYearLevel'] = 'Grade/Year level is required';
    }

    // Validate reason for transfer
    if (!transferee.reasonForTransfer.trim()) {
      newErrors['reasonForTransfer'] = 'Reason for transferring is required';
    }

    // Validate disciplinary actions (required)
    if (!transferee.disciplinaryActions.trim()) {
      newErrors['disciplinaryActions'] = 'This field is required. If none, please enter "None" or "N/A"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReviewClick = () => {
    setShowErrors(true);
    if (validateForm()) {
      setShowReviewModal(true);
    } else {
      // Scroll to first error with a small delay to ensure DOM is updated
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleSubmitSuccess = (applicationId: number) => {
    console.log('Application submitted successfully with ID:', applicationId);
    // You can add navigation or other success handling here
    // For example: router.push('/forms/success');
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex flex-col items-center mb-6">
        <div className="w-full flex items-center gap-4 mt-2">
          <button
            className="bg-[#a10000] text-white px-8 py-2 rounded-md font-semibold text-md shadow hover:bg-[#7a0000] transition"
            onClick={onBack}
          >
            Back
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="w-full bg-white rounded-md py-2 px-6 font-bold text-black text-lg tracking-widest text-center flex-grow ml-3 shadow">
              STUDENT APPLICATION FORM
            </h1>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">
        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">FOR TRANSFEREES</div>
        </div>

        {/* Previous School Fields */}
        <fieldset className="border border-gray-300 rounded p-4">
          <legend className="block text-sm font-medium mb-1 text-black px-2">Previous School:</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Name of School: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., ABC High School"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['previousSchool.name'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.previousSchool.name}
                onChange={(e) => handleSchoolChange('previousSchool', 'name', e.target.value)}
              />
              {showErrors && errors['previousSchool.name'] && (
                <p className="text-red-500 text-xs mt-1">{errors['previousSchool.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                School Address: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 123 Main St., City, Province"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['previousSchool.address'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.previousSchool.address}
                onChange={(e) => handleSchoolChange('previousSchool', 'address', e.target.value)}
              />
              {showErrors && errors['previousSchool.address'] && (
                <p className="text-red-500 text-xs mt-1">{errors['previousSchool.address']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Gr./ Yr. Level: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Grade 10, Year 1"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['previousSchool.gradeYearLevel'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.previousSchool.gradeYearLevel}
                onChange={(e) => handleSchoolChange('previousSchool', 'gradeYearLevel', e.target.value)}
              />
              {showErrors && errors['previousSchool.gradeYearLevel'] && (
                <p className="text-red-500 text-xs mt-1">{errors['previousSchool.gradeYearLevel']}</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Present School Fields */}
        <fieldset className="border border-gray-300 rounded p-4">
          <legend className="block text-sm font-medium mb-1 text-black px-2">Present School:</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Name of School: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., St. Joseph School"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['presentSchool.name'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.presentSchool.name}
                onChange={(e) => handleSchoolChange('presentSchool', 'name', e.target.value)}
              />
              {showErrors && errors['presentSchool.name'] && (
                <p className="text-red-500 text-xs mt-1">{errors['presentSchool.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                School Address: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 456 School Ave., City, Province"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['presentSchool.address'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.presentSchool.address}
                onChange={(e) => handleSchoolChange('presentSchool', 'address', e.target.value)}
              />
              {showErrors && errors['presentSchool.address'] && (
                <p className="text-red-500 text-xs mt-1">{errors['presentSchool.address']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Gr./ Yr. Level: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Grade 11, Year 2"
                className={`border rounded px-2 py-1 w-full text-black ${
                  showErrors && errors['presentSchool.gradeYearLevel'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={transferee.presentSchool.gradeYearLevel}
                onChange={(e) => handleSchoolChange('presentSchool', 'gradeYearLevel', e.target.value)}
              />
              {showErrors && errors['presentSchool.gradeYearLevel'] && (
                <p className="text-red-500 text-xs mt-1">{errors['presentSchool.gradeYearLevel']}</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Reason for Transfer */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Reason for Transferring: <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              rows={5}
              maxLength={250}
              placeholder="Please provide a brief explanation of why you are transferring schools..."
              className={`input input-bordered w-full text-black border rounded px-2 py-1 resize-none pt-2 ${
                showErrors && errors['reasonForTransfer'] ? 'border-red-500' : 'border-gray-300'
              }`}
              value={transferee.reasonForTransfer}
              onChange={(e) => handleInputChange('reasonForTransfer', e.target.value)}
            />
            <span className="absolute bottom-2 right-4 text-xs text-gray-400">
              {250 - (transferee.reasonForTransfer?.length || 0)}/250
            </span>
          </div>
          {showErrors && errors['reasonForTransfer'] && (
            <p className="text-red-500 text-xs mt-1">{errors['reasonForTransfer']}</p>
          )}
        </div>

        {/* Disciplinary Actions */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Has the applicant been subjected to any disciplinary actions in school? If yes, please describe the action and the sanctions: <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              rows={5}
              maxLength={250}
              placeholder="Enter 'None' or 'N/A' if not applicable. Otherwise, please describe any disciplinary actions and sanctions..."
              className={`input input-bordered w-full text-black border rounded px-2 py-1 resize-none pt-2 ${
                showErrors && errors['disciplinaryActions'] ? 'border-red-500' : 'border-gray-300'
              }`}
              value={transferee.disciplinaryActions}
              onChange={(e) => handleInputChange('disciplinaryActions', e.target.value)}
            />
            <span className="absolute bottom-2 right-4 text-xs text-gray-400">
              {250 - (transferee.disciplinaryActions?.length || 0)}/250
            </span>
          </div>
          {showErrors && errors['disciplinaryActions'] && (
            <p className="text-red-500 text-xs mt-1">{errors['disciplinaryActions']}</p>
          )}
        </div>
      </div>


      {/* Next Page Button */}
      <div className="w-full flex justify-end mt-8 space-x-4">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          onClick={handleReviewClick}
        >
          Review & Submit Application
        </button>
      </div>

      <ReviewModalFormStudents
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitSuccess={handleSubmitSuccess}
        personalData={formData.personalData}
        transferee={formData.transferee}
        healthHistory={formData.healthHistory}
        fatherBackground={formData.fatherBackground}
        motherBackground={formData.motherBackground}
        guardianBackground={formData.guardianBackground}
        familyMembers={formData.familyMembers}
        educationalBackground={formData.educationalBackground}
        registrationCode={formData.registrationCode}
      />
    </div>
  );
}
