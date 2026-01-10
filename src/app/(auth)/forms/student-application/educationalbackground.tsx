import React, { useState } from "react";
import { useFormData } from "./FormDataContext";
import ReviewModalFormStudents from "@/components/forms/ReviewModalFormStudents";

interface StudentEducationalBackgroundPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentEducationalBackgroundPage({ onBack, onNext }: StudentEducationalBackgroundPageProps) {
  const { formData, updateFormData } = useFormData();
  const { educationalBackground, registrationType } = formData;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Validate all schools before proceeding
  const validateAllSchools = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    educationalBackground.forEach((school, index) => {
      // Required fields for each school
      const requiredFields = ['gradeYearLevel', 'schoolName', 'schoolAddress', 'inclusiveYears'];
      
      requiredFields.forEach(field => {
        const value = school[field as keyof typeof school];
        if (!value || String(value).trim() === '') {
          newErrors[`${index}-${field}`] = 'This field is required';
          isValid = false;
        }
      });

      // Validate inclusive years format (YYYY-YYYY)
      if (school.inclusiveYears && !/^\d{4}-\d{4}$/.test(school.inclusiveYears)) {
        newErrors[`${index}-inclusiveYears`] = 'Format should be YYYY-YYYY (e.g., 2018-2022)';
        isValid = false;
      }
    });

    // Validate honors/awards field (from first school)
    if (educationalBackground[0] && !educationalBackground[0].honorsAwardsReceived?.trim()) {
      newErrors['0-honorsAwardsReceived'] = 'This field is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle next button click
  const handleNextClick = () => {
    if (validateAllSchools()) {
      if (registrationType === 'OLD') {
        // Show review modal for OLD students
        setShowReviewModal(true);
      } else {
        // Proceed to transferee for NEW students
        onNext?.();
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handler to add a new school
  const addSchool = () => {
    const newSchool = {
      gradeYearLevel: "",
      schoolName: "",
      schoolAddress: "",
      inclusiveYears: "",
      honorsAwardsReceived: "",
      isAttendedSummerSchool: false,
      attendedSummerSchool: "",
      gradeYearLevelRepeated: "",
      numberOfSubjectsFailed: "",
    };
    updateFormData('educationalBackground', [...educationalBackground, newSchool]);
  };

  // Handler to update a specific school
  const updateSchool = (index: number, field: keyof typeof educationalBackground[0], value: string | boolean) => {
    const updatedSchools = [...educationalBackground];
    updatedSchools[index] = {
      ...updatedSchools[index],
      [field]: value
    };
    updateFormData('educationalBackground', updatedSchools);
    
    // Clear error for this field when user starts typing
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  // Handler for attended summer school toggle
  const handleSummerSchoolToggle = (index: number, attended: boolean) => {
    const updatedSchools = [...educationalBackground];
    updatedSchools[index] = {
      ...updatedSchools[index],
      isAttendedSummerSchool: attended,
      attendedSummerSchool: attended ? updatedSchools[index].attendedSummerSchool : ""
    };
    updateFormData('educationalBackground', updatedSchools);
  };

  // Handler to remove a school
  const removeSchool = (index: number) => {
    if (educationalBackground.length > 1) {
      const updatedSchools = educationalBackground.filter((_, i: number) => i !== index);
      updateFormData('educationalBackground', updatedSchools);
    }
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
r
      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">
        {/* Validation Errors Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Please fill in all required fields</p>
                <p className="text-sm mt-1">Some fields are missing or contain invalid data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">EDUCATIONAL BACKGROUND</div>
        </div>

        {/* School Info Fields */}
        {educationalBackground.map((school, index: number) => (
          <fieldset key={index} className="border border-gray-300 rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <legend className="block text-sm font-medium mb-1 text-black px-2">{`School #${index + 1}`}</legend>
              {educationalBackground.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSchool(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Gr./ Yr. Level<span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grade 7"
                  className={`border rounded px-2 py-1 w-full text-black ${
                    errors[`${index}-gradeYearLevel`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={school.gradeYearLevel}
                  onChange={(e) => updateSchool(index, 'gradeYearLevel', e.target.value)}
                />
                {errors[`${index}-gradeYearLevel`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`${index}-gradeYearLevel`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Name of School<span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Jose National High School"
                  className={`border rounded px-2 py-1 w-full text-black ${
                    errors[`${index}-schoolName`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={school.schoolName}
                  onChange={(e) => updateSchool(index, 'schoolName', e.target.value)}
                />
                {errors[`${index}-schoolName`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`${index}-schoolName`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  School Address<span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 Main St, City"
                  className={`border rounded px-2 py-1 w-full text-black ${
                    errors[`${index}-schoolAddress`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={school.schoolAddress}
                  onChange={(e) => updateSchool(index, 'schoolAddress', e.target.value)}
                />
                {errors[`${index}-schoolAddress`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`${index}-schoolAddress`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Inclusive Years<span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2018-2022"
                  className={`border rounded px-2 py-1 w-full text-black ${
                    errors[`${index}-inclusiveYears`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={school.inclusiveYears}
                  onChange={(e) => updateSchool(index, 'inclusiveYears', e.target.value)}
                />
                {errors[`${index}-inclusiveYears`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`${index}-inclusiveYears`]}</p>
                )}
              </div>
            </div>
          </fieldset>
        ))}

        <div className="w-full flex justify-left mt-3">
          <button
            className="bg-red-800 text-white px-6 py-2 rounded-md shadow hover:bg-[#7a0000] transition"
            onClick={addSchool}
          >
            Add School
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column Left */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Honors/ Awards Received<span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                placeholder="e.g., Honor Roll, Perfect Attendance (or 'None')"
                className={`border rounded px-2 py-1 w-full text-black ${
                  errors['0-honorsAwardsReceived'] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={educationalBackground[0]?.honorsAwardsReceived || ""}
                onChange={(e) => updateSchool(0, 'honorsAwardsReceived', e.target.value)}
              />
              {errors['0-honorsAwardsReceived'] && (
                <p className="text-red-500 text-xs mt-1">{errors['0-honorsAwardsReceived']}</p>
              )}
            </div>
          </div>



          {/* Column Right */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <fieldset className="border border-gray-300 rounded p-4">
                  <div className="flex items-center space-x-4 text-black">
                    <label className="text-sm font-medium whitespace-nowrap md:col-span-1">
                      Attended Summer Classes A.Y. <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2021-2022"
                      className="border border-gray-300 rounded px-2 py-1 w-32 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={educationalBackground[0]?.attendedSummerSchool || ""}
                      onChange={(e) => updateSchool(0, 'attendedSummerSchool', e.target.value)}
                      disabled={!educationalBackground[0]?.isAttendedSummerSchool}
                    />
                    <label className="inline-flex items-center space-x-1">
                      <input
                        type="radio"
                        name="attendedSummerSchool"
                        value="yes"
                        checked={educationalBackground[0]?.isAttendedSummerSchool === true}
                        onChange={() => handleSummerSchoolToggle(0, true)}
                      />
                      <span className="font-semibold">Yes</span>
                    </label>
                    <label className="inline-flex items-center space-x-1">
                      <input
                        type="radio"
                        name="attendedSummerSchool"
                        value="no"
                        checked={educationalBackground[0]?.isAttendedSummerSchool === false}
                        onChange={() => handleSummerSchoolToggle(0, false)}
                      />
                      <span className="font-semibold">No</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Gr./ Yr. Level Repeated <span className="text-gray-500 text-xs">(Optional)</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grade 8 (or 'None')"
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={educationalBackground[0]?.gradeYearLevelRepeated || ""}
                  onChange={(e) => updateSchool(0, 'gradeYearLevelRepeated', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  No. of Subjects Failed <span className="text-gray-500 text-xs">(Optional)</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0"
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={educationalBackground[0]?.numberOfSubjectsFailed || ""}
                  onChange={(e) => updateSchool(0, 'numberOfSubjectsFailed', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Review Modal for OLD students - using the proper ReviewModalFormStudents component */}
      <ReviewModalFormStudents
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitSuccess={(applicationId) => {
          console.log('Application submitted successfully with ID:', applicationId);
          // You can add navigation or success handling here
          // For example: router.push('/forms/success');
        }}
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

      {/* Next Page Button */}
      <div className="w-full flex justify-end mt-8">
        <button
          className="bg-red-800 text-white px-6 py-2 rounded-md shadow hover:bg-[#7a0000] transition"
          onClick={handleNextClick}
        >
          {registrationType === 'OLD' ? 'Review & Submit' : 'Next Page'}
        </button>
      </div>
    </div>
  );
}
