import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFormData } from "./FormDataContext";
import { provinces as psgcProvinces, regions as psgcRegions, municipalities as psgcMunicipalities } from 'psgc';

// PSGC types - flexible to match library's structure
interface LocationItem {
  name: string;
  code?: string;
  regionCode?: string;
  provinceCode?: string;
  region?: string;
  province?: string;
}

// Extended type for municipalities from psgc
interface PSGCMunicipality extends LocationItem {
  province?: string;
  region?: string;
}

interface GuardianBackgroundPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function GuardianBackgroundPage({ onBack, onNext }: GuardianBackgroundPageProps) {
  const { formData, updateFormData } = useFormData();
  const { guardianBackground } = formData;
  const [otherStatus, setOtherStatus] = useState("");
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [allMunicipalities, setAllMunicipalities] = useState<PSGCMunicipality[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Define required fields (including relationToApplicant)
  const requiredFields = [
    'familyName', 'firstName', 'birthDate', 'placeOfBirth', 'age',
    'nationality', 'religion', 'mobileNumber', 'emailAddress',
    'homeAddress', 'city', 'stateProvince', 'zipPostalCode',
    'educationalAttainmentCourse', 'occupationalPositionHeld', 'employerCompany',
    'companyAddress', 'annualIncome', 'statusOfParent', 'relationToApplicant'
  ];

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    const filledCount = requiredFields.filter(field => {
      const value = guardianBackground[field as keyof typeof guardianBackground];
      return value && String(value).trim() !== '';
    }).length;
    return (filledCount / requiredFields.length) * 100;
  };

  const completionPercentage = calculateCompletion();
  const requiresValidation = completionPercentage >= 50;

  // Reusable function to filter and sort municipalities
  const getFilteredCities = useCallback((locationName: string): LocationItem[] => {
    if (!locationName || allMunicipalities.length === 0) return [];

    const filtered = allMunicipalities.filter((muni) =>
      muni.province === locationName || muni.region === locationName
    );

    return (filtered as LocationItem[]).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMunicipalities]);

  // Load provinces, regions, and municipalities on component mount
  useEffect(() => {
    try {
      const allProvinces = psgcProvinces.all();
      const allRegions = psgcRegions.all();

      const ncrRegion = allRegions.filter((region) =>
        region.name.includes('Metro') || region.name.includes('NCR') ||
        region.name.includes('National Capital Region')
      );

      const allLocations = [...allProvinces, ...ncrRegion] as LocationItem[];
      const sortedLocations = allLocations.sort((a, b) => a.name.localeCompare(b.name));

      setProvinces(sortedLocations);
      setAllMunicipalities(psgcMunicipalities.all() as unknown as PSGCMunicipality[]);
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  }, []);

  // Memoize filtered cities to avoid recalculation
  const filteredCities = useMemo(() =>
    getFilteredCities(guardianBackground.stateProvince),
    [guardianBackground.stateProvince, getFilteredCities]
  );

  // Update cities when memoized values change
  useEffect(() => {
    setCities(filteredCities);
  }, [filteredCities]);

  // Validation function - validates format only, does not require fields
  const validateField = (field: string, value: unknown): string => {
    // Skip validation if field is empty (all fields are optional)
    if (!value || (typeof value === 'string' && !value.trim())) {
      return '';
    }

    switch (field) {
      case 'familyName':
      case 'firstName':
      case 'middleName':
      case 'placeOfBirth':
      case 'nationality':
      case 'religion':
      case 'educationalAttainmentCourse':
      case 'occupationalPositionHeld':
      case 'employerCompany':
      case 'companyAddress':
      case 'homeAddress':
      case 'relationToApplicant':
        // String fields - should not be only numbers
        if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
          return 'Please enter valid text, not just numbers';
        }
        return '';

      case 'age':
        // Age should be a valid number
        if (typeof value === 'string') {
          const ageNum = parseInt(value);
          if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
            return 'Please enter a valid age between 1 and 150';
          }
        }
        return '';

      case 'annualIncome':
        // Annual income should be a valid number
        if (typeof value === 'string') {
          const cleanIncome = value.replace(/[,\s]/g, '');
          if (isNaN(Number(cleanIncome)) || Number(cleanIncome) < 0) {
            return 'Please enter a valid annual income';
          }
        }
        return '';

      case 'mobileNumber':
        // Mobile number validation (Philippine format)
        if (typeof value === 'string') {
          const cleanMobile = value.replace(/[\s\-\(\)]/g, '');
          const mobilePattern = /^(\+63|0)[0-9]{10}$/;
          if (!mobilePattern.test(cleanMobile)) {
            return 'Please enter a valid Philippine mobile number (e.g., 09171234567)';
          }
        }
        return '';

      case 'emailAddress':
        // Email validation (Gmail only)
        if (typeof value === 'string') {
          const emailPattern = /^[^\s@]+@gmail\.com$/;
          if (!emailPattern.test(value)) {
            return 'Please enter a valid Gmail address (e.g., user@gmail.com)';
          }
        }
        return '';

      case 'landlineNumber':
      case 'businessTelephoneNumber':
        // Landline/telephone validation (optional, accepts N/A)
        if (typeof value === 'string' && value.trim()) {
          if (value.trim() === 'N/A') {
            return '';
          }
          const cleanLandline = value.replace(/[\s\-\(\)]/g, '');
          if (cleanLandline.length < 7) {
            return 'Please enter a valid landline number or N/A';
          }
        }
        return '';

      case 'zipPostalCode':
        // ZIP code should be 4 digits
        if (typeof value === 'string' && value.trim() && !/^\d{4}$/.test(value)) {
          return 'ZIP code must be 4 digits';
        }
        return '';

      default:
        return '';
    }
  };

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

  const handleInputChange = (field: keyof typeof guardianBackground, value: string) => {
    // Prepare updates object
    const updates: Partial<typeof guardianBackground> = { [field]: value };

    // If birthDate is being changed, calculate age automatically
    if (field === 'birthDate') {
      const calculatedAge = calculateAge(value);
      updates.age = calculatedAge.toString();
    }

    updateFormData('guardianBackground', {
      ...guardianBackground,
      ...updates
    });

    // Validate the field and update errors
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      
      // Also clear age error when birthDate is updated
      if (field === 'birthDate' && newErrors.age) {
        delete newErrors.age;
      }
      
      return newErrors;
    });

    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  // Handle province/region selection and fetch cities
  const handleProvinceChange = (locationName: string) => {
    updateFormData('guardianBackground', {
      ...guardianBackground,
      stateProvince: locationName,
      city: ''
    });

    // Clear errors for city when province changes
    if (errors.city) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  // Error display component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <p className="error-message text-red-500 text-sm mt-1">{error}</p>
    );
  };

  const handleStatusChange = (status: string) => {
    if (status === "Others") {
      handleInputChange('statusOfParent', `Others: ${otherStatus}`);
    } else {
      handleInputChange('statusOfParent', status);
    }
  };

  // Validate all required fields
  const validateAllRequiredFields = (): boolean => {
    if (!requiresValidation) {
      return true; // Skip validation if less than 50% complete
    }

    const newErrors: { [key: string]: string } = {};
    
    requiredFields.forEach(field => {
      const value = guardianBackground[field as keyof typeof guardianBackground];
      if (!value || String(value).trim() === '') {
        newErrors[field] = 'This field is required';
      } else {
        // Check format validation
        const formatError = validateField(field, value);
        if (formatError) {
          newErrors[field] = formatError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Next button click
  const handleNextClick = () => {
    if (requiresValidation) {
      const isValid = validateAllRequiredFields();
      if (!isValid) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    if (onNext) {
      onNext();
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

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">FAMILY BACKGROUND: GUARDIAN (If not living with parents)</div>
        </div>

        {/* Guardian Background Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Family Name: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Santos"
              className={`border rounded px-2 py-1 w-full text-black ${errors.familyName ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.familyName}
              onChange={(e) => handleInputChange('familyName', e.target.value)}
            />
            <ErrorMessage error={errors.familyName} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              First Name: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Juan"
              className={`border rounded px-2 py-1 w-full text-black ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
            <ErrorMessage error={errors.firstName} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Middle Name:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={guardianBackground.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Birth Date: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              className={`border rounded px-2 py-1 w-full text-black ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
            <ErrorMessage error={errors.birthDate} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Place of Birth: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Manila, Philippines"
              className={`border rounded px-2 py-1 w-full text-black ${errors.placeOfBirth ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
            />
            <ErrorMessage error={errors.placeOfBirth} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Age: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              disabled
              placeholder="Auto-calculated"
              className={`border rounded px-2 py-1 w-full text-black ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
            <ErrorMessage error={errors.age} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Nationality: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Filipino"
              className={`border rounded px-2 py-1 w-full text-black ${errors.nationality ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />
            <ErrorMessage error={errors.nationality} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Religion: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Roman Catholic"
              className={`border rounded px-2 py-1 w-full text-black ${errors.religion ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
            />
            <ErrorMessage error={errors.religion} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Landline Number:</label>
            <input
              type="text"
              placeholder="e.g., (02) 1234-5678 or N/A"
              className={`border rounded px-2 py-1 w-full text-black ${errors.landlineNumber ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.landlineNumber}
              onChange={(e) => handleInputChange('landlineNumber', e.target.value)}
            />
            <ErrorMessage error={errors.landlineNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Mobile Number: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., 09171234567"
              className={`border rounded px-2 py-1 w-full text-black ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            />
            <ErrorMessage error={errors.mobileNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              E-mail Address: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., juan.santos@gmail.com"
              className={`border rounded px-2 py-1 w-full text-black ${errors.emailAddress ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.emailAddress}
              onChange={(e) => handleInputChange('emailAddress', e.target.value)}
            />
            <ErrorMessage error={errors.emailAddress} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">
              Home Address: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., 123 Main St., Brgy. San Jose"
              className={`border rounded px-2 py-1 w-full text-black ${errors.homeAddress ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            />
            <ErrorMessage error={errors.homeAddress} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">
              City: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <select
              className={`border rounded px-2 py-1 w-full text-black ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!guardianBackground.stateProvince}
            >
              <option value="">{guardianBackground.stateProvince ? 'Select City' : 'Select Province First'}</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            <ErrorMessage error={errors.city} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">
              State/ Province: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <select
              className={`border rounded px-2 py-1 w-full text-black ${errors.stateProvince ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.stateProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">Select Province/Region</option>
              {provinces.map((location) => (
                <option key={location.name} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            <ErrorMessage error={errors.stateProvince} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">
              Zip/ Postal Code: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., 1234"
              className={`border rounded px-2 py-1 w-full text-black ${errors.zipPostalCode ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.zipPostalCode}
              onChange={(e) => handleInputChange('zipPostalCode', e.target.value)}
            />
            <ErrorMessage error={errors.zipPostalCode} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Educational Attainment/ Course: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Bachelor of Science in Engineering"
              className={`border rounded px-2 py-1 w-full text-black ${errors.educationalAttainmentCourse ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.educationalAttainmentCourse}
              onChange={(e) => handleInputChange('educationalAttainmentCourse', e.target.value)}
            />
            <ErrorMessage error={errors.educationalAttainmentCourse} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Occupational/ Position Held: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Senior Engineer"
              className={`border rounded px-2 py-1 w-full text-black ${errors.occupationalPositionHeld ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.occupationalPositionHeld}
              onChange={(e) => handleInputChange('occupationalPositionHeld', e.target.value)}
            />
            <ErrorMessage error={errors.occupationalPositionHeld} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Employer/ Company: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., ABC Corporation"
              className={`border rounded px-2 py-1 w-full text-black ${errors.employerCompany ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.employerCompany}
              onChange={(e) => handleInputChange('employerCompany', e.target.value)}
            />
            <ErrorMessage error={errors.employerCompany} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Company Address: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., 456 Business Ave., Makati City"
              className={`border rounded px-2 py-1 w-full text-black ${errors.companyAddress ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
            />
            <ErrorMessage error={errors.companyAddress} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Business Telephone Number:</label>
            <input
              type="text"
              placeholder="e.g., (02) 8765-4321 or N/A"
              className={`border rounded px-2 py-1 w-full text-black ${errors.businessTelephoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.businessTelephoneNumber}
              onChange={(e) => handleInputChange('businessTelephoneNumber', e.target.value)}
            />
            <ErrorMessage error={errors.businessTelephoneNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Annual Income: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., 500000"
              className={`border rounded px-2 py-1 w-full text-black ${errors.annualIncome ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            />
            <ErrorMessage error={errors.annualIncome} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Relation to Applicant: {requiresValidation && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Uncle, Aunt, Grandparent"
              className={`border rounded px-2 py-1 w-full text-black ${errors.relationToApplicant ? 'border-red-500' : 'border-gray-300'}`}
              value={guardianBackground.relationToApplicant}
              onChange={(e) => handleInputChange('relationToApplicant', e.target.value)}
            />
            <ErrorMessage error={errors.relationToApplicant} />
          </div>
        </div>

        {/* Status of Guardian */}
        <div>
          <fieldset className={`border rounded p-2 ${errors.statusOfParent ? 'border-red-500' : 'border-gray-300'}`}>
            <legend className="block text-sm font-medium mb-1 text-black px-2">
              Status of Guardian: {requiresValidation && <span className="text-red-500">*</span>}
            </legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent === "Married"}
                  onChange={() => handleStatusChange("Married")}
                /> Married
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent === "Single Parent"}
                  onChange={() => handleStatusChange("Single Parent")}
                /> Single Parent
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent === "Separated"}
                  onChange={() => handleStatusChange("Separated")}
                /> Separated
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent === "Widowed"}
                  onChange={() => handleStatusChange("Widowed")}
                /> Widowed
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent === "Widowed, Remarried"}
                  onChange={() => handleStatusChange("Widowed, Remarried")}
                /> Widowed, Remarried
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={guardianBackground.statusOfParent?.startsWith("Others")}
                  onChange={() => handleStatusChange("Others")}
                /> Others:
                {guardianBackground.statusOfParent?.startsWith("Others") && (
                  <input
                    type="text"
                    className="input input-bordered text-black bg-gray-100 border border-gray-300 ml-2"
                    placeholder="Please specify"
                    value={otherStatus}
                    onChange={e => {
                      setOtherStatus(e.target.value);
                      handleInputChange('statusOfParent', `Others: ${e.target.value}`);
                    }}
                    style={{ width: 120 }}
                  />
                )}
              </label>
            </div>
          </fieldset>
          <ErrorMessage error={errors.statusOfParent} />
        </div>
      </div>

      {/* Next Page Button */}
      <div className="w-full flex justify-end mt-8">
        {requiresValidation && Object.keys(errors).length > 0 && (
          <div className="flex-1 mr-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 font-medium text-sm">
              ⚠️ Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before proceeding.
            </p>
          </div>
        )}
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
