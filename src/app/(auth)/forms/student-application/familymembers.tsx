import React, { useEffect, useState } from "react";
import { useFormData } from "./FormDataContext";

interface StudentFamilyMembersPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentFamilyMembersPage({ onBack, onNext }: StudentFamilyMembersPageProps) {
  const { formData, updateFormData } = useFormData();
  const { familyMembers, personalData } = formData;
  const [errors, setErrors] = useState<{ [key: number]: { [field: string]: string } }>({});
  
  const siblingsCount = parseInt(personalData.siblingsCount) || 0;

  // Initialize familyMembers array based on siblingsCount from personalData
  useEffect(() => {
    if (siblingsCount > 0 && familyMembers.length !== siblingsCount) {
      const newFamilyMembers = Array.from({ length: siblingsCount }, (_, index) => {
        return familyMembers[index] || {
          familyName: "",
          firstName: "",
          middleName: "",
          birthDate: "",
          age: "",
          gradeYearLevel: "",
          schoolEmployer: "",
        };
      });
      updateFormData('familyMembers', newFamilyMembers);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siblingsCount]);

  // Function to calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    // If birthday hasn't occurred this year yet, subtract 1
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age); // Ensure age is not negative
  };

  // Validation function
  const validateField = (field: string, value: string): string => {
    if (!value || !value.trim()) {
      return '';
    }

    switch (field) {
      case 'familyName':
      case 'firstName':
      case 'schoolEmployer':
      case 'gradeYearLevel':
        // String fields - should not be only numbers
        if (/^\d+$/.test(value.trim())) {
          return 'Please enter valid text, not just numbers';
        }
        return '';

      case 'age':
        // Age should be a valid number
        const ageNum = parseInt(value);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
          return 'Please enter a valid age between 1 and 150';
        }
        return '';

      default:
        return '';
    }
  };

  // Validate all required fields for all siblings
  const validateAllSiblings = (): boolean => {
    const requiredFields = ['familyName', 'firstName', 'birthDate', 'age', 'gradeYearLevel', 'schoolEmployer'];
    const newErrors: { [key: number]: { [field: string]: string } } = {};
    let isValid = true;

    familyMembers.forEach((sibling, index) => {
      requiredFields.forEach(field => {
        const value = sibling[field as keyof typeof sibling];
        
        // Check if required field is empty
        if (!value || String(value).trim() === '') {
          if (!newErrors[index]) {
            newErrors[index] = {};
          }
          newErrors[index][field] = 'This field is required';
          isValid = false;
        } else {
          // Check format validation
          const formatError = validateField(field, String(value));
          if (formatError) {
            if (!newErrors[index]) {
              newErrors[index] = {};
            }
            newErrors[index][field] = formatError;
            isValid = false;
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle Next button click
  const handleNextClick = () => {
    if (siblingsCount > 0) {
      const isValid = validateAllSiblings();
      if (!isValid) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
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

  // Handler to update a specific sibling
  const updateSibling = (index: number, field: keyof typeof familyMembers[0], value: string) => {
    const updatedSiblings = [...familyMembers];
    
    // Prepare updates
    const updates: Partial<typeof familyMembers[0]> = { [field]: value };

    // If birthDate is being changed, calculate age automatically
    if (field === 'birthDate') {
      const calculatedAge = calculateAge(value);
      updates.age = calculatedAge.toString();
    }

    updatedSiblings[index] = {
      ...updatedSiblings[index],
      ...updates
    };
    
    updateFormData('familyMembers', updatedSiblings);

    // Validate the field and update errors
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (!newErrors[index]) {
        newErrors[index] = {};
      }
      
      if (error) {
        newErrors[index][field] = error;
      } else {
        delete newErrors[index][field];
      }
      
      // Clean up empty error objects
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }

      // Also clear age error when birthDate is updated
      if (field === 'birthDate' && newErrors[index]?.age) {
        delete newErrors[index].age;
      }
      
      return newErrors;
    });

    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
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
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">FAMILY MEMBERS: SIBLINGS</div>
        </div>

        {/* Info Message */}
        {siblingsCount > 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  We detected you have <strong>{siblingsCount} sibling{siblingsCount > 1 ? 's' : ''}</strong> from your Personal Data. 
                  Please fill out the information below for each sibling.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  No siblings detected from your Personal Data. If you have siblings, please go back to Personal Data and update the number of siblings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sibling Info Fields */}
        {familyMembers.map((sibling, index: number) => (
          <fieldset key={index} className="border border-gray-300 rounded p-4">
            <legend className="block text-sm font-medium mb-1 text-black px-2">{`Sibling #${index + 1}`}</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Family Name: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Santos"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.familyName ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.familyName}
                  onChange={(e) => updateSibling(index, 'familyName', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.familyName} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">First Name: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Juan"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.firstName}
                  onChange={(e) => updateSibling(index, 'firstName', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.firstName} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Middle Name: <span className="text-gray-500 text-xs">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g., Dela Cruz"
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.middleName}
                  onChange={(e) => updateSibling(index, 'middleName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Birth Date: <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.birthDate}
                  onChange={(e) => updateSibling(index, 'birthDate', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.birthDate} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Age: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  disabled
                  placeholder="Auto-calculated"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.age ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.age}
                  onChange={(e) => updateSibling(index, 'age', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.age} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Grade 10, Year 3"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.gradeYearLevel ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.gradeYearLevel}
                  onChange={(e) => updateSibling(index, 'gradeYearLevel', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.gradeYearLevel} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">School/Employer: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., ABC High School"
                  className={`border rounded px-2 py-1 w-full text-black ${errors[index]?.schoolEmployer ? 'border-red-500' : 'border-gray-300'}`}
                  value={sibling.schoolEmployer}
                  onChange={(e) => updateSibling(index, 'schoolEmployer', e.target.value)}
                />
                <ErrorMessage error={errors[index]?.schoolEmployer} />
              </div>
            </div>
          </fieldset>
        ))}
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
