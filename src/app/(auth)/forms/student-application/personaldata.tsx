import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useFormData } from "./FormDataContext";
import { getRegistrationByCode } from "@/app/_actions/getRegistrationByCode";
import { useSearchParams } from "next/navigation";
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

interface StudentPersonalDataPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentPersonalDataPage({ onBack, onNext }: StudentPersonalDataPageProps) {
  const { formData, updateFormData } = useFormData();
  const { personalData } = formData;
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [provincialCities, setProvincialCities] = useState<LocationItem[]>([]);
  const [allMunicipalities, setAllMunicipalities] = useState<PSGCMunicipality[]>([]);
  const [sameAsHomeAddress, setSameAsHomeAddress] = useState(false);

  // Reusable function to filter and sort municipalities
  const getFilteredCities = useCallback((locationName: string): LocationItem[] => {
    if (!locationName || allMunicipalities.length === 0) return [];
    
    const filtered = allMunicipalities.filter((muni) => 
      muni.province === locationName || muni.region === locationName
    );
    
    return (filtered as LocationItem[]).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMunicipalities]);

  // Fetch registration data on component mount
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setError('No registration code provided');
      return;
    }

    // Check if required fields are already filled - skip fetch if they are
    const hasRequiredData = personalData.familyName && 
                            personalData.firstName && 
                            personalData.birthDate &&
                            personalData.email;
    
    if (hasRequiredData) {
      console.log('Form already populated, skipping registration fetch');
      return;
    }

    const fetchRegistrationData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRegistrationByCode(code);

        if (result.success && result.data) {
          updateFormData('personalData', {
            ...personalData,
            ...result.data
          });
          console.log('Registration data loaded:', result.data);
        } else {
          setError(result.error || 'Failed to load registration data');
        }
      } catch (err) {
        console.error('Error fetching registration data:', err);
        setError('An error occurred while loading registration data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
  const filteredHomeCities = useMemo(() => 
    getFilteredCities(personalData.homeStateProvince),
    [personalData.homeStateProvince, getFilteredCities]
  );

  const filteredProvincialCities = useMemo(() => 
    getFilteredCities(personalData.provincialStateProvince),
    [personalData.provincialStateProvince, getFilteredCities]
  );

  // Update cities when memoized values change
  useEffect(() => {
    setCities(filteredHomeCities);
  }, [filteredHomeCities]);

  useEffect(() => {
    setProvincialCities(filteredProvincialCities);
  }, [filteredProvincialCities]);

  // Validation functions
  const validateField = (field: string, value: unknown): string => {
    switch (field) {
      case 'academicYear':
        return !value || typeof value !== 'string' || !value.trim() ? 'Academic year is required' : '';
      case 'admissionGradeYear':
        return !value || typeof value !== 'string' || !value.trim() ? 'Admission to grade/year is required' : '';
      case 'familyName':
        return !value || typeof value !== 'string' || !value.trim() ? 'Family name is required' : '';
      case 'firstName':
        return !value || typeof value !== 'string' || !value.trim() ? 'First name is required' : '';
      case 'birthDate':
        if (!value || typeof value !== 'string') return 'Birth date is required';
        const birthYear = new Date(value).getFullYear();
        const currentYear = new Date().getFullYear();
        if (birthYear > currentYear || birthYear < 1900) {
          return 'Please enter a valid birth date';
        }
        return '';
      case 'placeOfBirth':
        return !value || typeof value !== 'string' || !value.trim() ? 'Place of birth is required' : '';
      case 'age':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Age is required';
        const ageNum = parseInt(value);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
          return 'Please enter a valid age';
        }
        return '';
      case 'birthOrder':
        return !value || typeof value !== 'string' || !value.trim() ? 'Birth order is required' : '';
      case 'siblingsCount':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Number of siblings is required';
        const siblingsNum = parseInt(value);
        if (isNaN(siblingsNum) || siblingsNum < 0) {
          return 'Please enter a valid number';
        }
        return '';
      case 'gender':
        return !value ? 'Gender is required' : '';
      case 'nationality':
        return !value || typeof value !== 'string' || !value.trim() ? 'Nationality is required' : '';
      case 'religion':
        return !value || typeof value !== 'string' || !value.trim() ? 'Religion is required' : '';
      case 'height':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Height is required';
        const heightNum = parseFloat(value);
        if (isNaN(heightNum) || heightNum <= 0) {
          return 'Please enter a valid height in cm';
        }
        return '';
      case 'weight':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Weight is required';
        const weightNum = parseFloat(value);
        if (isNaN(weightNum) || weightNum <= 0) {
          return 'Please enter a valid weight in kg';
        }
        return '';
      case 'bloodType':
        return !value || typeof value !== 'string' || !value.trim() ? 'Blood type is required' : '';
      case 'languages':
        return !value || typeof value !== 'string' || !value.trim() ? 'Languages/dialect is required' : '';
      case 'childStatus':
        return !value || typeof value !== 'string' || !value.trim() ? 'Status is required' : '';
      case 'mobile':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Mobile number is required';
        const cleanMobile = value.replace(/[\s\-\(\)]/g, '');
        const mobilePattern = /^(\+63|0)[0-9]{10}$/;
        if (!mobilePattern.test(cleanMobile)) {
          return 'Mobile number must be a valid Philippine phone number (09171234567)';
        }
        return '';
      case 'email':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Email address is required';
        const emailPattern = /^[^\s@]+@gmail\.com$/;
        if (!emailPattern.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'homeAddress':
        return !value || typeof value !== 'string' || !value.trim() ? 'Home address is required' : '';
      case 'homeCity':
        return !value || typeof value !== 'string' || !value.trim() ? 'Home city is required' : '';
      case 'homeStateProvince':
        return !value || typeof value !== 'string' || !value.trim() ? 'Home state/province is required' : '';
      case 'homeZip':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Home ZIP code is required';
        if (!/^\d{4}$/.test(value)) return 'ZIP code must be 4 digits';
        return '';
      case 'provincialZip':
        // Optional, but if provided, must be 4 digits
        if (value && typeof value === 'string' && value.trim() && !/^\d{4}$/.test(value)) {
          return 'ZIP code must be 4 digits';
        }
        return '';
      case 'landline':
        // Optional, but if provided, validate format (accept "N/A")
        if (value && typeof value === 'string' && value.trim()) {
          if (value.trim() === 'N/A') {
            return ''; // "N/A" is acceptable
          }
          const cleanLandline = value.replace(/[\s\-\(\)]/g, '');
          if (cleanLandline.length < 7) {
            return 'Please enter a valid landline number or "N/A"';
          }
        }
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate all required fields
    newErrors.academicYear = validateField('academicYear', personalData.academicYear);
    newErrors.admissionGradeYear = validateField('admissionGradeYear', personalData.admissionGradeYear);
    newErrors.familyName = validateField('familyName', personalData.familyName);
    newErrors.firstName = validateField('firstName', personalData.firstName);
    // middleName is optional - no validation
    // nickname is optional - no validation
    newErrors.birthDate = validateField('birthDate', personalData.birthDate);
    newErrors.placeOfBirth = validateField('placeOfBirth', personalData.placeOfBirth);
    newErrors.age = validateField('age', personalData.age);
    newErrors.birthOrder = validateField('birthOrder', personalData.birthOrder);
    newErrors.siblingsCount = validateField('siblingsCount', personalData.siblingsCount);
    newErrors.gender = validateField('gender', personalData.gender);
    newErrors.nationality = validateField('nationality', personalData.nationality);
    newErrors.religion = validateField('religion', personalData.religion);
    newErrors.height = validateField('height', personalData.height);
    newErrors.weight = validateField('weight', personalData.weight);
    newErrors.bloodType = validateField('bloodType', personalData.bloodType);
    newErrors.languages = validateField('languages', personalData.languages);
    newErrors.childStatus = validateField('childStatus', personalData.childStatus);
    newErrors.landline = validateField('landline', personalData.landline);
    newErrors.mobile = validateField('mobile', personalData.mobile);
    newErrors.email = validateField('email', personalData.email);
    newErrors.homeAddress = validateField('homeAddress', personalData.homeAddress);
    newErrors.homeCity = validateField('homeCity', personalData.homeCity);
    newErrors.homeStateProvince = validateField('homeStateProvince', personalData.homeStateProvince);
    newErrors.homeZip = validateField('homeZip', personalData.homeZip);
    newErrors.provincialZip = validateField('provincialZip', personalData.provincialZip);
    // talents is optional - no validation
    // hobbies is optional - no validation

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle province/region selection and fetch cities
  const handleProvinceChange = (locationName: string) => {
    const updates: Partial<typeof personalData> = {
      homeStateProvince: locationName,
      homeCity: ''
    };

    if (sameAsHomeAddress) {
      updates.provincialStateProvince = locationName;
      updates.provincialCity = '';
    }

    updateFormData('personalData', {
      ...personalData,
      ...updates
    });
    
    // Clear errors for both fields
    if (errors.homeStateProvince || errors.homeCity) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.homeStateProvince;
        delete newErrors.homeCity;
        return newErrors;
      });
    }
  };

  // Handle provincial province/region selection and fetch cities
  const handleProvincialProvinceChange = (locationName: string) => {
    updateFormData('personalData', {
      ...personalData,
      provincialStateProvince: locationName,
      provincialCity: ''
    });
  };

  // Detect if addresses are the same and auto-tick checkbox
  useEffect(() => {
    const addressesMatch = 
      personalData.homeAddress === personalData.provincialAddress &&
      personalData.homeCity === personalData.provincialCity &&
      personalData.homeStateProvince === personalData.provincialStateProvince &&
      personalData.homeZip === personalData.provincialZip &&
      personalData.homeAddress !== '' && // Don't auto-tick if addresses are empty
      personalData.provincialAddress !== '';

    if (addressesMatch && !sameAsHomeAddress) {
      setSameAsHomeAddress(true);
    } else if (!addressesMatch && sameAsHomeAddress && personalData.provincialAddress !== '') {
      // Only uncheck if provincial address is manually different and not empty
      setSameAsHomeAddress(false);
    }
  }, [personalData.homeAddress, personalData.homeCity, personalData.homeStateProvince, personalData.homeZip, 
      personalData.provincialAddress, personalData.provincialCity, personalData.provincialStateProvince, personalData.provincialZip, sameAsHomeAddress]);

  // Handle 'Same as Home Address' checkbox
  const handleSameAsHomeAddress = (checked: boolean) => {
    setSameAsHomeAddress(checked);

    if (checked) {
      updateFormData('personalData', {
        ...personalData,
        provincialAddress: personalData.homeAddress,
        provincialStateProvince: personalData.homeStateProvince,
        provincialCity: personalData.homeCity,
        provincialZip: personalData.homeZip
      });
    } else {
      updateFormData('personalData', {
        ...personalData,
        provincialAddress: '',
        provincialStateProvince: '',
        provincialCity: '',
        provincialZip: ''
      });
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

  const handleInputChange = (field: keyof typeof personalData, value: string) => {
    const updates: Partial<typeof personalData> = { [field]: value };

    // If birthDate is being changed, calculate age automatically
    if (field === 'birthDate') {
      const calculatedAge = calculateAge(value);
      updates.age = calculatedAge.toString();
    }

    // If checkbox is ticked and home address fields are changed, sync to provincial
    if (sameAsHomeAddress) {
      if (field === 'homeAddress') {
        updates.provincialAddress = value;
      } else if (field === 'homeCity') {
        updates.provincialCity = value;
      } else if (field === 'homeZip') {
        updates.provincialZip = value;
      }
    }

    const updatedData = {
      ...personalData,
      ...updates
    };

    updateFormData('personalData', updatedData);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Also clear age error when birthDate is updated
    if (field === 'birthDate' && errors.age) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.age;
        return newErrors;
      });
    }
    
    console.log(`Updated ${field} to: ${value}`);
    console.log('Data being saved to formData:', updatedData);
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
      console.log(formData)
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

      {/* Loading State */}
      {isLoading && (
        <div className="w-full bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Loading registration data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Validation Errors Summary */}
      {/* {Object.keys(errors).length > 0 && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="list-disc list-inside mt-2">
            {Object.entries(errors).slice(0, 5).map(([field, message]) => (
              <li key={field} className="text-sm">{message}</li>
            ))}
            {Object.keys(errors).length > 5 && (
              <li className="text-sm">... and {Object.keys(errors).length - 5} more</li>
            )}
          </ul>
        </div>
      )} */}

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">

        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">PERSONAL DATA</div>
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
                <span className="font-semibold">Note:</span> Fields marked with <span className="text-red-500 font-bold">*</span> are required. For optional fields, please enter <span className="font-semibold">&quot;N/A&quot;</span> if not applicable.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Year and Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Academic Year: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="2023-2024"
              className={`border rounded px-2 py-1 w-full text-black ${errors.academicYear ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.academicYear}
              onChange={(e) => handleInputChange('academicYear', e.target.value)}
            />
            <ErrorMessage error={errors.academicYear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Admission to Grade/Year: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Grade 10, Kinder 2, etc."
              className={`border rounded px-2 py-1 w-full text-black ${errors.admissionGradeYear ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.admissionGradeYear}
              onChange={(e) => handleInputChange('admissionGradeYear', e.target.value)}
            />
            <ErrorMessage error={errors.admissionGradeYear} />
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Family Name: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="dela Cruz"
              className={`border rounded px-2 py-1 w-full text-black ${errors.familyName ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.familyName}
              onChange={(e) => handleInputChange('familyName', e.target.value)}
            />
            <ErrorMessage error={errors.familyName} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">First Name: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Juan"
              className={`border rounded px-2 py-1 w-full text-black ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
            <ErrorMessage error={errors.firstName} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Middle Name: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="Lorenzo"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nickname: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
            />
          </div>
        </div>

        {/* Birth, Age, Order, Siblings, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Birth Date: <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={`border rounded px-2 py-1 w-full text-black ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
            <ErrorMessage error={errors.birthDate} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Place of Birth: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Quezon City"
              className={`border rounded px-2 py-1 w-full text-black ${errors.placeOfBirth ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
            />
            <ErrorMessage error={errors.placeOfBirth} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Age: <span className="text-red-500">*</span></label>
            <input
              type="text"
              disabled
              placeholder="Answer Here.."
              className={`border rounded px-2 py-1 w-full text-black ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
            <ErrorMessage error={errors.age} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Birth Order: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="1st, 2nd, 3rd, etc."
              className={`border rounded px-2 py-1 w-full text-black ${errors.birthOrder ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.birthOrder}
              onChange={(e) => handleInputChange('birthOrder', e.target.value)}
            />
            <ErrorMessage error={errors.birthOrder} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Number of Siblings: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Numeric only"
              className={`border rounded px-2 py-1 w-full text-black ${errors.siblingsCount ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.siblingsCount}
              onChange={(e) => handleInputChange('siblingsCount', e.target.value)}
            />
            <ErrorMessage error={errors.siblingsCount} />
          </div>
          <fieldset className={`border rounded p-2 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}>
            <legend className="block text-sm font-medium mb-1 text-black px-2">Sex: <span className="text-red-500">*</span></legend>
            <div className="flex flex-col md:flex-row gap-4 mt-2 text-black">
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={personalData.gender === "female"}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                />
                <span>Female</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={personalData.gender === "male"}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                />
                <span>Male</span>
              </label>
            </div>
            <ErrorMessage error={errors.gender} />
          </fieldset>
        </div>

        {/* Nationality, Religion, Height, Weight, Blood Type */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nationality: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Filipino"
              className={`border rounded px-2 py-1 w-full text-black ${errors.nationality ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />
            <ErrorMessage error={errors.nationality} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Religion: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Catholic"
              className={`border rounded px-2 py-1 w-full text-black ${errors.religion ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
            />
            <ErrorMessage error={errors.religion} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Height: (in cm) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="120"
              className={`border rounded px-2 py-1 w-full text-black ${errors.height ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
            />
            <ErrorMessage error={errors.height} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Weight: (in kg) <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="20"
              className={`border rounded px-2 py-1 w-full text-black ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
            />
            <ErrorMessage error={errors.weight} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Blood Type: <span className="text-red-500">*</span></label>
            <select
              className={`border rounded px-2 py-1 w-full text-black ${errors.bloodType ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.bloodType || ''}
              onChange={(e) => handleInputChange('bloodType', e.target.value)}
            >
              <option value="">Select blood type</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            <ErrorMessage error={errors.bloodType} />
          </div>
        </div>

        {/* Languages, Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Languages/Dialect spoken at home: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="English, Filipino, Cebuano, etc."
              className={`border rounded px-2 py-1 w-full text-black ${errors.languages ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
            />
            <ErrorMessage error={errors.languages} />
          </div>

          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <fieldset className={`border rounded p-2 ${errors.childStatus ? 'border-red-500' : 'border-gray-300'}`}>
              <legend className="block text-sm font-medium mb-1 text-black px-2">Child Status: <span className="text-red-500">*</span></legend>
              <div className="flex flex-col md:flex-row gap-4 mt-2 text-black">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={personalData.childStatus === "Legitimate"}
                  onChange={() => handleInputChange('childStatus', "Legitimate")}
                />
                <label className="text-sm font-medium text-black">Legitimate</label>
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={personalData.childStatus === "Biological"}
                  onChange={() => handleInputChange('childStatus', "Biological")}
                />
                <label className="text-sm font-medium text-black">Biological</label>
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={personalData.childStatus === "Adopted"}
                  onChange={() => handleInputChange('childStatus', "Adopted")}
                />
                <label className="text-sm font-medium text-black">Adopted</label>
              </div>
              <ErrorMessage error={errors.childStatus} />
            </fieldset>
          </div>
        </div>

        {/* Landline, Mobile, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Landline Number: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="8123-4567"
              className={`border rounded px-2 py-1 w-full text-black ${errors.landline ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.landline}
              onChange={(e) => handleInputChange('landline', e.target.value)}
            />
            <ErrorMessage error={errors.landline} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Mobile Number: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="09171234567"
              className={`border rounded px-2 py-1 w-full text-black ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
            />
            <ErrorMessage error={errors.mobile} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">E-mail Address: <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className={`border rounded px-2 py-1 w-full text-black ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.email}
              onChange={(e: { target: { value: string; }; }) => handleInputChange('email', e.target.value)}
            />
            <ErrorMessage error={errors.email} />
          </div>
        </div>

        {/* Home Address */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Home Address: <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="1234 Sample St., Barangay Example"
              className={`border rounded px-2 py-1 w-full text-black ${errors.homeAddress ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            />
            <ErrorMessage error={errors.homeAddress} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">State/Province: <span className="text-red-500">*</span></label>
            <select
              className={`border rounded px-2 py-1 w-full text-black ${errors.homeStateProvince ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.homeStateProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">Select province/region</option>
              {provinces.map((province) => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            <ErrorMessage error={errors.homeStateProvince} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">City: <span className="text-red-500">*</span></label>
            <select
              className={`border rounded px-2 py-1 w-full text-black ${errors.homeCity ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.homeCity}
              onChange={(e) => handleInputChange('homeCity', e.target.value)}
              disabled={!personalData.homeStateProvince || cities.length === 0}
            >
              <option value="">Select city/municipality</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            <ErrorMessage error={errors.homeCity} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Zip/Postal Code:  <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="1234"
              className={`border rounded px-2 py-1 w-full text-black ${errors.homeZip ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.homeZip}
              onChange={(e) => handleInputChange('homeZip', e.target.value)}
            />
            <ErrorMessage error={errors.homeZip} />
          </div>
        </div>

        {/* Same as Home Address Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sameAsHomeAddress"
            checked={sameAsHomeAddress}
            onChange={(e) => handleSameAsHomeAddress(e.target.checked)}
            className="w-4 h-4 text-[#a10000] border-gray-300 rounded focus:ring-[#a10000]"
          />
          <label htmlFor="sameAsHomeAddress" className="text-sm font-medium text-black">
            Same as Home Address
          </label>
        </div>

        {/* Provincial Address */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Provincial Address: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="1234 Sample St., Barangay Example"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialAddress}
              onChange={(e) => handleInputChange('provincialAddress', e.target.value)}
              disabled={sameAsHomeAddress}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">State/Province: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <select
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialStateProvince}
              onChange={(e) => handleProvincialProvinceChange(e.target.value)}
              disabled={sameAsHomeAddress}
            >
              <option value="">Select province/region</option>
              {provinces.map((province) => (
                <option key={province.name} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">City: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <select
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialCity}
              onChange={(e) => handleInputChange('provincialCity', e.target.value)}
              disabled={sameAsHomeAddress || !personalData.provincialStateProvince || provincialCities.length === 0}
            >
              <option value="">Select city/municipality</option>
              {provincialCities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Zip/Postal Code: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="1234"
              className={`border rounded px-2 py-1 w-full text-black ${errors.provincialZip ? 'border-red-500' : 'border-gray-300'}`}
              value={personalData.provincialZip}
              onChange={(e) => handleInputChange('provincialZip', e.target.value)}
              disabled={sameAsHomeAddress}
            />
            <ErrorMessage error={errors.provincialZip} />
          </div>
        </div>

        {/* Talents/Skills and Hobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-1 text-black">Talents/Special Skills: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="Singing, Dancing, etc."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.talents}
              onChange={(e) => handleInputChange('talents', e.target.value)}
            />
            <span className="text-gray-400 ml-2">150</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-1 text-black">Hobbies and Interests: <span className="text-gray-500 text-xs">(Optional)</span></label>
            <input
              type="text"
              placeholder="Reading, Painting, etc."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.hobbies}
              onChange={(e) => handleInputChange('hobbies', e.target.value)}
            />
            <span className="text-gray-400 ml-2">150</span>
          </div>
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
