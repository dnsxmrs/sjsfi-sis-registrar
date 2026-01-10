import React, { useState } from "react";
import { useFormData } from "./FormDataContext";

interface StudentHealthHistoryPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentHealthHistoryPage({ onBack, onNext }: StudentHealthHistoryPageProps) {
  const { formData, updateFormData } = useFormData();
  const { healthHistory } = formData;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation function
  const validateField = (field: string, value: string): string => {
    // If empty or only whitespace, require N/A
    if (!value || !value.trim()) {
      return 'Please enter information or "N/A" if not applicable';
    }

    // Check if the value is purely numeric
    if (/^\d+$/.test(value.trim())) {
      return 'Please enter valid text, not just numbers';
    }

    return '';
  };

  const validateAllFields = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    newErrors.childhoodDiseases = validateField('childhoodDiseases', healthHistory.childhoodDiseases);
    newErrors.otherMedicalConditions = validateField('otherMedicalConditions', healthHistory.otherMedicalConditions);
    newErrors.allergies = validateField('allergies', healthHistory.allergies);
    newErrors.immunizations = validateField('immunizations', healthHistory.immunizations);
    newErrors.physicalHandicaps = validateField('physicalHandicaps', healthHistory.physicalHandicaps);

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof healthHistory, value: string) => {
    updateFormData('healthHistory', {
      ...healthHistory,
      [field]: value
    });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  const handleNextClick = () => {
    // Validate all fields before proceeding
    const isValid = validateAllFields();
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // If validation passes, proceed to next page
    if (onNext) {
      onNext();
    }
  };

  // Error display component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <p className="error-message text-red-500 text-sm mt-1">{error}</p>
    );
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
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">HEALTH HISTORY</div>
        </div>

        {/* Instruction Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Note:</span> All fields are required. Please enter <span className="font-semibold">&quot;N/A&quot;</span> if not applicable.
              </p>
            </div>
          </div>
        </div>

        {/* Health History Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Childhood Diseases: <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Chickenpox, Asthma"
                className={`border rounded px-2 py-1 w-full text-black ${errors.childhoodDiseases ? 'border-red-500' : 'border-gray-300'}`}
                value={healthHistory.childhoodDiseases}
                onChange={(e) => handleInputChange('childhoodDiseases', e.target.value)}
              />
              <ErrorMessage error={errors.childhoodDiseases} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Other Medical Conditions: <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Surgeries, chronic illnesses"
                className={`border rounded px-2 py-1 w-full text-black ${errors.otherMedicalConditions ? 'border-red-500' : 'border-gray-300'}`}
                value={healthHistory.otherMedicalConditions}
                onChange={(e) => handleInputChange('otherMedicalConditions', e.target.value)}
              />
              <ErrorMessage error={errors.otherMedicalConditions} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Allergies: <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Peanuts, Penicillin, Latex"
                className={`border rounded px-2 py-1 w-full text-black ${errors.allergies ? 'border-red-500' : 'border-gray-300'}`}
                value={healthHistory.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
              />
              <ErrorMessage error={errors.allergies} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Immunizations: <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., BCG, MMR, Polio, COVID-19"
                className={`border rounded px-2 py-1 w-full text-black ${errors.immunizations ? 'border-red-500' : 'border-gray-300'}`}
                value={healthHistory.immunizations}
                onChange={(e) => handleInputChange('immunizations', e.target.value)}
              />
              <ErrorMessage error={errors.immunizations} />
            </div>
          </div>
        </div>

        {/* Physical Handicaps / Special Needs */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Any Physical handicaps or special needs which should be taken in consideration (please specify): <span className="text-red-500">*</span></label>
          <div className="relative">
            <textarea
              rows={5}
              maxLength={250}
              placeholder="e.g., Visual impairment, mobility aids, learning support needs"
              className={`input input-bordered w-full text-black border rounded px-2 py-1 resize-none pt-2 ${errors.physicalHandicaps ? 'border-red-500' : 'border-gray-300'}`}
              value={healthHistory.physicalHandicaps}
              onChange={(e) => handleInputChange('physicalHandicaps', e.target.value)}
            />
            <span className="absolute bottom-2 right-4 text-xs text-gray-400">250</span>
          </div>
          <ErrorMessage error={errors.physicalHandicaps} />
        </div>
      </div>

      {/* Next Page Button */}
      <div className="w-full flex justify-end mt-8">
        <button
          className="bg-red-800 text-white px-6 py-2 rounded-md shadow hover:bg-[#7a0000] transition"
          onClick={handleNextClick}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
