'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { getSchoolYears } from '@/app/_actions/getSchoolYears';
import { getYearLevels } from '@/app/_actions/getYearLevels';
import { addRegistration, type RegistrationFormData } from '@/app/_actions/addRegistration';
import toast from 'react-hot-toast';

// Types
interface SchoolYear {
  id: number;
  year: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface YearLevel {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Province {
  code: string;
  name: string;
  regionCode: string;
}

interface Region {
  code: string;
  name: string;
}

interface City {
  code: string;
  name: string;
  provinceCode?: string;
  regionCode?: string;
}

const StudentRegistrationForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [registrationCode, setRegistrationCode] = useState<string>('');
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolYearType, setSchoolYearType] = useState<'old' | 'new' | ''>('old');
  const [gradeYearLevel, setGradeYearLevel] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | ''>('female');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [parents, setParents] = useState([
    { familyName: '', firstName: '', middleName: '', occupation: '', relation: '' },
    { familyName: '', firstName: '', middleName: '', occupation: '', relation: '' },
  ]);
  const [contactNumbers, setContactNumbers] = useState<string[]>(['']);
  const [modeOfPayment, setModeOfPayment] = useState('');
  const [amountPayable, setAmountPayable] = useState('');

  // State for dropdown data
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [provinces, setProvinces] = useState<(Province | Region)[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for requirements checkboxes
  // const [requirements, setRequirements] = useState({
  //   goodMoral: false,
  //   birthCertificate: false,
  //   f138: true,
  //   f137: false,
  //   privacyForm: false,
  // });

  // State for validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Capture registration code from URL on component mount
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // TODO: ADD VALIDATION FOR CODE THAT IS FETCHED
      setRegistrationCode(code);
    } else {
      router.push('/forms/home'); // Redirect back if no code is provided
    }

  }, [router, searchParams]);

  // Fetch school years and year levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [schoolYearsResult, yearLevelsResult, provincesResponse, regionsResponse] = await Promise.all([
          getSchoolYears(),
          getYearLevels(),
          fetch('https://psgc.gitlab.io/api/provinces/'),
          fetch('https://psgc.gitlab.io/api/regions/')
        ]);

        if (schoolYearsResult.success) {
          setSchoolYears(schoolYearsResult.schoolYears);
        }

        if (yearLevelsResult.success) {
          setYearLevels(yearLevelsResult.yearLevels);
        }

        // Combine provinces and regions
        let allLocations: (Province | Region)[] = [];

        if (provincesResponse.ok) {
          const provincesData = await provincesResponse.json();
          allLocations = [...allLocations, ...provincesData];
        }

        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          // Filter out regions that are not administrative regions (like Metro Manila)
          const administrativeRegions = regionsData.filter((region: Region) =>
            region.name.includes('Metro') || region.name.includes('NCR') ||
            region.name.includes('National Capital Region')
          );
          allLocations = [...allLocations, ...administrativeRegions];
        }

        // Sort all locations alphabetically by name
        const sortedLocations = allLocations.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProvinces(sortedLocations);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleParentChange = (index: number, field: string, value: string) => {
    const newParents = [...parents];
    newParents[index] = { ...newParents[index], [field]: value };
    setParents(newParents);
  };

  const handleAddContact = () => {
    setContactNumbers([...contactNumbers, '']);
  };

  const handleContactChange = (index: number, value: string) => {
    const newContactNumbers = [...contactNumbers];
    newContactNumbers[index] = value;
    setContactNumbers(newContactNumbers);
  };

  const handleRemoveContact = (index: number) => {
    if (contactNumbers.length > 1) {
      const newContactNumbers = contactNumbers.filter((_, i) => i !== index);
      setContactNumbers(newContactNumbers);
    }
  };

  // Handle province/region selection and fetch cities
  const handleProvinceChange = async (locationCode: string, locationName: string) => {
    setStateProvince(locationName);
    setCity(''); // Reset city when province changes
    setCities([]); // Clear cities

    if (locationCode) {
      try {
        let response;
        // Check if it's a region (like Metro Manila) or a province
        if (locationName.includes('Metro') || locationName.includes('NCR') || locationName.includes('National Capital Region')) {
          // For regions, use the regions endpoint
          response = await fetch(`https://psgc.gitlab.io/api/regions/${locationCode}/cities-municipalities/`);
        } else {
          // For provinces, use the provinces endpoint
          response = await fetch(`https://psgc.gitlab.io/api/provinces/${locationCode}/cities-municipalities/`);
        }

        if (response.ok) {
          const citiesData = await response.json();
          // Sort cities alphabetically by name
          const sortedCities = citiesData.sort((a: City, b: City) =>
            a.name.localeCompare(b.name)
          );
          setCities(sortedCities);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
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

  // Handle birth date change and auto-calculate age
  const handleBirthDateChange = (date: string) => {
    setBirthDate(date);
    const calculatedAge = calculateAge(date);
    setAge(calculatedAge.toString());

    // Clear birth date error when valid date is entered
    if (date && errors.birthDate) {
      setErrors({ ...errors, birthDate: '' });
    }
  };

  // Handle requirements checkbox changes
  // const handleRequirementChange = (requirement: keyof typeof requirements) => {
  //   setRequirements({
  //     ...requirements,
  //     [requirement]: !requirements[requirement]
  //   });
  // };

  // Validation functions
  const validateField = (field: string, value: unknown): string => {
    switch (field) {
      case 'schoolYear':
        return !value ? 'School year is required' : '';
      case 'schoolYearType':
        return !value ? 'Student type is required' : '';
      case 'gradeYearLevel':
        return !value ? 'Grade/Year level is required' : '';
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
      case 'gender':
        return !value ? 'Gender is required' : '';
      case 'streetAddress':
        return !value || typeof value !== 'string' || !value.trim() ? 'Street address is required' : '';
      case 'stateProvince':
        return !value || typeof value !== 'string' || !value.trim() ? 'Province/Region is required' : '';
      case 'city':
        return !value || typeof value !== 'string' || !value.trim() ? 'City/Municipality is required' : '';
      case 'zipCode':
        if (!value || typeof value !== 'string' || !value.trim()) return 'ZIP code is required';
        if (!/^\d{4}$/.test(value)) return 'ZIP code must be 4 digits';
        return '';
      case 'contactNumbers':
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one contact number is required';
        }
        const validContacts = value.filter((contact: string) => contact.trim());
        if (validContacts.length === 0) {
          return 'At least one valid contact number is required';
        }
        for (let i = 0; i < value.length; i++) {
          const contact = value[i].trim();
          if (contact) {
            // Remove spaces, dashes, and parentheses for validation
            const cleanContact = contact.replace(/[\s\-\(\)]/g, '');

            // Mobile number pattern: (+63|0) followed by 10 digits
            const mobilePattern = /^(\+63|0)[0-9]{10}$/;

            // Landline patterns:
            // - 7-8 digit local numbers (like 8935-2790 becomes 89352790)
            // - Area code + 7 digits (like 02-8935-2790 becomes 0289352790)
            // - With +63 prefix for landlines
            const landlinePattern = /^(\+63)?[0-9]{7,10}$/;

            if (!mobilePattern.test(cleanContact) && !landlinePattern.test(cleanContact)) {
              return `Contact number ${i + 1} must be a valid Philippine phone number (mobile: 0917-123-4567 or landline: 8935-2790)`;
            }
          }
        }
        return '';
      case 'modeOfPayment':
        return !value ? 'Mode of payment is required' : '';
      case 'amountPayable':
        if (!value || typeof value !== 'string' || !value.trim()) return 'Amount payable is required';
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          return 'Amount payable must be a valid positive number';
        }
        return '';
      case 'parents':
        if (!Array.isArray(value)) return 'Parent information is required';

        let hasValidParent = false;
        for (const parent of value) {
          const hasAnyField = parent.familyName || parent.firstName || parent.occupation || parent.relation;
          if (hasAnyField) {
            hasValidParent = true;
            if (!parent.familyName?.trim()) return 'Parent family name is required when parent information is provided';
            if (!parent.firstName?.trim()) return 'Parent first name is required when parent information is provided';
            if (!parent.relation?.trim()) return 'Parent relation is required when parent information is provided';
          }
        }

        if (!hasValidParent) {
          return 'At least one parent/guardian information is required';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate all required fields
    newErrors.schoolYear = validateField('schoolYear', schoolYear);
    newErrors.schoolYearType = validateField('schoolYearType', schoolYearType);
    newErrors.gradeYearLevel = validateField('gradeYearLevel', gradeYearLevel);
    newErrors.familyName = validateField('familyName', familyName);
    newErrors.firstName = validateField('firstName', firstName);
    newErrors.birthDate = validateField('birthDate', birthDate);
    newErrors.placeOfBirth = validateField('placeOfBirth', placeOfBirth);
    newErrors.gender = validateField('gender', gender);
    newErrors.streetAddress = validateField('streetAddress', streetAddress);
    newErrors.stateProvince = validateField('stateProvince', stateProvince);
    newErrors.city = validateField('city', city);
    newErrors.zipCode = validateField('zipCode', zipCode);
    newErrors.contactNumbers = validateField('contactNumbers', contactNumbers);
    newErrors.modeOfPayment = validateField('modeOfPayment', modeOfPayment);
    newErrors.amountPayable = validateField('amountPayable', amountPayable);
    newErrors.parents = validateField('parents', parents);

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate all fields
    const isValid = validateAllFields();

    if (!isValid) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Show review modal instead of submitting directly
    setShowReviewModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowReviewModal(false);

    try {
      // Prepare form data including the registration code
      const formData: RegistrationFormData = {
        registrationCode,
        schoolYear,
        schoolYearType: (schoolYearType || 'old') as 'old' | 'new',
        gradeYearLevel,
        familyName,
        firstName,
        middleName,
        birthDate,
        placeOfBirth,
        age,
        gender: (gender || 'female') as 'female' | 'male',
        streetAddress,
        city,
        stateProvince,
        zipCode,
        parents,
        contactNumbers: contactNumbers.filter(contact => contact.trim()), // Remove empty contacts
        modeOfPayment,
        amountPayable,
        emailAddress,
        // requirements,
      };

      // Submit the registration data to the server
      const result = await addRegistration(formData);

      if (result.success) {
        toast.success('Registration submitted successfully!');

        // Redirect to success page or forms home
        router.push('/forms/home');
      } else {
        toast.error(`Registration failed: ${result.error}`);
      }
    } catch {
      toast.error('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error display component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <p className="error-message text-red-500 text-sm mt-1">{error}</p>
    );
  };

  // Review Modal Component
  const ReviewModal: React.FC = () => {
    if (!showReviewModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-center text-gray-800 flex-1">
                Review Your Registration Information
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6 text-red-800" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Please review all information carefully before submitting your registration.
            </p>

            <div className="space-y-6 text-sm">
              {/* Registration Code */}
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">Registration Code</h4>
                <p className="text-blue-700 font-mono">{registrationCode}</p>
              </div>

              {/* School Information */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">School Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">School Year:</span>
                    <p>{schoolYear}</p>
                  </div>
                  <div>
                    <span className="font-medium">Student Type:</span>
                    <p className="capitalize">{schoolYearType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Grade/Year Level:</span>
                    <p>{gradeYearLevel}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Email Address:</span>
                  <p>{emailAddress}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Full Name:</span>
                    <p>{`${firstName} ${middleName} ${familyName}`.trim()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Birth Date:</span>
                    <p>{birthDate}</p>
                  </div>
                  <div>
                    <span className="font-medium">Place of Birth:</span>
                    <p>{placeOfBirth}</p>
                  </div>
                  <div>
                    <span className="font-medium">Age:</span>
                    <p>{age}</p>
                  </div>
                  <div>
                    <span className="font-medium">Gender:</span>
                    <p className="capitalize">{gender}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Address</h4>
                <p>{streetAddress}, {city}, {stateProvince}, {zipCode}</p>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Parent/Guardian Information</h4>
                {parents.map((parent, index) => {
                  const hasInfo = parent.familyName || parent.firstName || parent.occupation || parent.relation;
                  if (!hasInfo) return null;
                  return (
                    <div key={index} className="mb-3 p-2 border-l-4 border-blue-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Name:</span>
                          <p>{`${parent.firstName} ${parent.middleName} ${parent.familyName}`.trim()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Occupation:</span>
                          <p>{parent.occupation}</p>
                        </div>
                        <div>
                          <span className="font-medium">Relation:</span>
                          <p>{parent.relation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contact Numbers */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Contact Number/s</h4>
                <div className="space-y-1">
                  {contactNumbers.filter(contact => contact.trim()).map((contact, index) => (
                    <p key={index}>• {contact}</p>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Mode of Payment:</span>
                    <p className="capitalize">{modeOfPayment}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount Payable:</span>
                    <p>₱{parseFloat(amountPayable || '0').toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded text-white transition ${isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit Registration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-md shadow-md text-black">
      <h2 className="text-center font-bold text-lg mb-6 bg-gray-100 py-2 rounded">REGISTRATION FORM</h2>

      {/* Registration Code Display */}
      {registrationCode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Registration Code:</span>
            <span className="font-mono ml-2 bg-blue-100 px-2 py-1 rounded">{registrationCode}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">Loading school years and grade levels...</p>
          </div>
        )}

        {/* School Year and Type */}
        <div className="flex flex-wrap items-center space-x-4 rounded p-2 m-2 me-2">
          <div className="flex flex-wrap items-center border border-gray-300 gap-7 p-4">
            <div className="flex-grow min-w-[200px]">
              <label className="flex items-center space-x-2">
                <span className="text-sm font-medium whitespace-nowrap">School Year <span className="text-red-600">*</span></span>
                <select
                  value={schoolYear}
                  onChange={(e) => {
                    setSchoolYear(e.target.value);
                    if (errors.schoolYear) {
                      setErrors({ ...errors, schoolYear: '' });
                    }
                  }}
                  className={`border rounded px-2 py-1 flex-grow ${errors.schoolYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={isLoading}
                >
                  <option disabled value="">Select School Year...</option>
                  {schoolYears.map((sy) => (
                    <option key={sy.id} value={sy.year}>
                      {sy.year}
                    </option>
                  ))}
                </select>
              </label>
              <ErrorMessage error={errors.schoolYear} />
            </div>

            <div className="flex items-center space-x-4 min-w-[150px]">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="schoolYearType"
                  value="old"
                  checked={schoolYearType === 'old'}
                  onChange={() => {
                    setSchoolYearType('old');
                    if (errors.schoolYearType) {
                      setErrors({ ...errors, schoolYearType: '' });
                    }
                  }}
                  className="accent-gray-400"
                />
                <span className="text-sm font-medium">Old</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="schoolYearType"
                  value="new"
                  checked={schoolYearType === 'new'}
                  onChange={() => {
                    setSchoolYearType('new');
                    if (errors.schoolYearType) {
                      setErrors({ ...errors, schoolYearType: '' });
                    }
                  }}
                  className="accent-gray-400"
                />
                <span className="text-sm font-medium">New</span>
              </label>
            </div>
            <ErrorMessage error={errors.schoolYearType} />
          </div>

          <div className="ml-[20px] flex-grow min-w-[200px]">
            <label className="flex items-center space-x-2">
              <span className="w-35 text-sm font-medium">Grade Year/ Level <span className="text-red-600">*</span></span>
              <select
                value={gradeYearLevel}
                onChange={(e) => {
                  setGradeYearLevel(e.target.value);
                  if (errors.gradeYearLevel) {
                    setErrors({ ...errors, gradeYearLevel: '' });
                  }
                }}
                className={`border rounded px-2 py-1 flex-grow ${errors.gradeYearLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                disabled={isLoading}
              >
                <option value="">Select Grade Level...</option>
                {yearLevels.map((yl) => (
                  <option key={yl.id} value={yl.name}>
                    {yl.name}
                  </option>
                ))}
              </select>
            </label>
            <ErrorMessage error={errors.gradeYearLevel} />
          </div>

          <label className="flex items-center space-x-2 flex-grow min-w-[200px]">
            <span className="w-20 text-sm font-medium">Email Address <span className="text-red-600">*</span></span>
            <input
              type="text"
              placeholder="juandelacruz@gmail.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 flex-grow"
            />
          </label>
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="flex flex-col text-sm font-medium">
              <span className="flex items-center gap-1">
                Family Name <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                placeholder="dela Cruz"
                value={familyName}
                onChange={(e) => {
                  setFamilyName(e.target.value);
                  if (errors.familyName) {
                    setErrors({ ...errors, familyName: '' });
                  }
                }}
                className={`border rounded px-2 py-1 mt-1 ${errors.familyName ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </label>
            <ErrorMessage error={errors.familyName} />
          </div>
          <div>
            <label className="flex flex-col text-sm font-medium">
              <span className="flex items-center gap-1">
                First Name <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: '' });
                  }
                }}
                className={`border rounded px-2 py-1 mt-1 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </label>
            <ErrorMessage error={errors.firstName} />
          </div>
          <div>
            <label className="flex flex-col text-sm font-medium">
              <span className="flex items-center gap-1">
                Middle Name <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                placeholder="Santos"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 mt-1"
              />
            </label>
          </div>
        </div>

        {/* Birth Date, Place of Birth, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <label className="flex items-center space-x-2 w-full">
              <span className="w-28 text-sm font-medium">Birth Date <span className="text-red-600">*</span></span>
              <input
                type="date"
                placeholder="MM/DD/YY"
                value={birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                className={`border rounded px-2 py-1 flex-grow ${errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </label>
            <ErrorMessage error={errors.birthDate} />
          </div>
          <div>
            <label className="flex items-center space-x-2 w-full">
              <span className="w-32 text-sm font-medium">Place of Birth <span className="text-red-600">*</span></span>
              <input
                type="text"
                placeholder="Quezon City"
                value={placeOfBirth}
                onChange={(e) => {
                  setPlaceOfBirth(e.target.value);
                  if (errors.placeOfBirth) {
                    setErrors({ ...errors, placeOfBirth: '' });
                  }
                }}
                className={`border rounded px-2 py-1 flex-grow ${errors.placeOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </label>
            <ErrorMessage error={errors.placeOfBirth} />
          </div>
          <label className="flex items-center space-x-2 w-full">
            <span className="w-16 text-sm font-medium">Age <span className="text-red-600">*</span></span>
            <input
              type="text"
              placeholder="Auto-calculated"
              defaultValue={age}
              // readOnly
              className="border border-gray-300 rounded px-2 py-1 flex-grow bg-gray-50"
            />
          </label>

          <div>
            <fieldset className={`border rounded p-4 ${errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}>
              <legend className="text-sm font-medium px-2">Sex <span className="text-red-600">*</span></legend>
              <div className="flex items-center space-x-4 justify-center w-full">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => {
                      setGender('female');
                      if (errors.gender) {
                        setErrors({ ...errors, gender: '' });
                      }
                    }}
                    className="accent-gray-400"
                  />
                  <span className="text-sm font-medium">Female</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => {
                      setGender('male');
                      if (errors.gender) {
                        setErrors({ ...errors, gender: '' });
                      }
                    }}
                    className="accent-gray-400"
                  />
                  <span className="text-sm font-medium">Male</span>
                </label>
              </div>
            </fieldset>
            <ErrorMessage error={errors.gender} />
          </div>
        </div>

        {/* Address */}
        <fieldset className="border border-gray-300 rounded p-4">
          <legend className="text-sm font-medium px-2">Address:</legend>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-2">
            <div>
              <label className="flex flex-col text-sm font-medium col-span-1 sm:col-span-1">
                <span className="flex items-center gap-1">
                  Street Address <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  placeholder="Lot 1, Block 1, Phase 1, Brgy. Uno"
                  value={streetAddress}
                  onChange={(e) => {
                    setStreetAddress(e.target.value);
                    if (errors.streetAddress) {
                      setErrors({ ...errors, streetAddress: '' });
                    }
                  }}
                  className={`border rounded px-2 py-1 mt-1 ${errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </label>
              <ErrorMessage error={errors.streetAddress} />
            </div>
            <div>
              <label className="flex flex-col text-sm font-medium col-span-1">
                <span className="flex items-center gap-1">
                  Province/Region <span className="text-red-600">*</span>
                </span>
                <select
                  value={stateProvince}
                  onChange={(e) => {
                    const selectedLocation = provinces.find(p => p.name === e.target.value);
                    if (selectedLocation) {
                      handleProvinceChange(selectedLocation.code, selectedLocation.name);
                    } else {
                      setStateProvince(e.target.value);
                    }
                    if (errors.stateProvince) {
                      setErrors({ ...errors, stateProvince: '' });
                    }
                  }}
                  className={`border rounded px-2 py-1 mt-1 ${errors.stateProvince ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Province/Region...</option>
                  {provinces.map((location) => (
                    <option key={location.code} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              <ErrorMessage error={errors.stateProvince} />
            </div>
            <div>
              <label className="flex flex-col text-sm font-medium col-span-1">
                <span className="flex items-center gap-1">
                  City <span className="text-red-600">*</span>
                </span>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) {
                      setErrors({ ...errors, city: '' });
                    }
                  }}
                  className={`border rounded px-2 py-1 mt-1 ${errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={!stateProvince || cities.length === 0}
                >
                  <option value="">
                    {!stateProvince ? "Select Province/Region first..." : "Select City..."}
                  </option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
              <ErrorMessage error={errors.city} />
            </div>
            <div>
              <label className="flex flex-col text-sm font-medium col-span-1">
                <span className="flex items-center gap-1">
                  Zip/ Postal Code <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  placeholder="1121"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    if (errors.zipCode) {
                      setErrors({ ...errors, zipCode: '' });
                    }
                  }}
                  className={`border rounded px-2 py-1 mt-1 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </label>
              <ErrorMessage error={errors.zipCode} />
            </div>
          </div>
        </fieldset>

        {/* Parents/ Guardian */}
        <fieldset className="border border-gray-300 rounded p-4">
          <legend className="text-sm font-medium px-2">Parents/ Guardian:</legend>
          <div className="space-y-4 mt-2">
            {parents.map((parent, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <label className="flex flex-col text-sm font-medium">
                  Family Name:
                  <input
                    type="text"
                    placeholder="dela Cruz"
                    value={parent.familyName}
                    onChange={(e) => {
                      handleParentChange(index, 'familyName', e.target.value);
                      if (errors.parents) {
                        setErrors({ ...errors, parents: '' });
                      }
                    }}
                    className="border border-gray-300 rounded px-2 py-1 mt-1"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium">
                  First Name:
                  <input
                    type="text"
                    placeholder="Juan"
                    value={parent.firstName}
                    onChange={(e) => {
                      handleParentChange(index, 'firstName', e.target.value);
                      if (errors.parents) {
                        setErrors({ ...errors, parents: '' });
                      }
                    }}
                    className="border border-gray-300 rounded px-2 py-1 mt-1"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium">
                  Middle Name:
                  <input
                    type="text"
                    placeholder="Santos"
                    value={parent.middleName}
                    onChange={(e) => handleParentChange(index, 'middleName', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 mt-1"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium">
                  Occupation:
                  <input
                    type="text"
                    placeholder="Homemaker"
                    value={parent.occupation}
                    onChange={(e) => {
                      handleParentChange(index, 'occupation', e.target.value);
                      if (errors.parents) {
                        setErrors({ ...errors, parents: '' });
                      }
                    }}
                    className="border border-gray-300 rounded px-2 py-1 mt-1"
                  />
                </label>
                <label className="flex flex-col text-sm font-medium">
                  Relation to Student:
                  <input
                    type="text"
                    placeholder="Mother or Guardian, only one"
                    value={parent.relation}
                    onChange={(e) => {
                      handleParentChange(index, 'relation', e.target.value);
                      if (errors.parents) {
                        setErrors({ ...errors, parents: '' });
                      }
                    }}
                    className="border border-gray-300 rounded px-2 py-1 mt-1"
                  />
                </label>
              </div>
            ))}
          </div>
          <ErrorMessage error={errors.parents} />
        </fieldset>

        {/* Contact No. */}
        <div className="space-y-2 max-w-md">
          <span className="text-sm font-medium">Contact Number <span className="text-red-600">*</span></span>
          {contactNumbers.map((contact, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="0917-123-4567 or 8935-2790"
                value={contact}
                onChange={(e) => {
                  handleContactChange(index, e.target.value);
                  if (errors.contactNumbers) {
                    setErrors({ ...errors, contactNumbers: '' });
                  }
                }}
                className={`border rounded px-2 py-1 w-64 ${errors.contactNumbers ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {contactNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className="border border-red-400 rounded px-2 py-1 text-lg font-bold text-red-600 hover:bg-red-100"
                  aria-label="Remove contact"
                >
                  &minus;
                </button>
              )}
              {index === contactNumbers.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="border border-gray-400 rounded px-2 py-1 text-lg font-bold text-gray-600 hover:bg-gray-100"
                  aria-label="Add contact"
                >
                  +
                </button>
              )}
            </div>
          ))}
          <ErrorMessage error={errors.contactNumbers} />
        </div>

        {/* Mode of Payment and Amount Payable */}
        <div className="flex items-start space-x-8 mt-4">
          <div>
            <label className="flex flex-col text-sm font-medium w-64">
              <span className="flex items-center gap-1">
                Mode of Payment <span className="text-red-600">*</span>
              </span>
              <select
                value={modeOfPayment}
                onChange={(e) => {
                  setModeOfPayment(e.target.value);
                  if (errors.modeOfPayment) {
                    setErrors({ ...errors, modeOfPayment: '' });
                  }
                }}
                className={`border rounded px-2 py-1 mt-1 ${errors.modeOfPayment ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Loan">Loan</option>
                <option value="Online">Online</option>
              </select>
            </label>
            <ErrorMessage error={errors.modeOfPayment} />
          </div>
          <div className="w-48">
            <label className="text-sm font-medium">
              <span className="flex items-center gap-1">
                Amount Payable <span className="text-red-600">*</span>
              </span>
              <div className="relative mt-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountPayable}
                  onChange={(e) => {
                    setAmountPayable(e.target.value);
                    if (errors.amountPayable) {
                      setErrors({ ...errors, amountPayable: '' });
                    }
                  }}
                  className={`pl-6 border rounded px-2 py-1 w-full ${errors.amountPayable ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
            </label>
            <ErrorMessage error={errors.amountPayable} />
          </div>

        </div>

        {/* Requirements */}
        {/* <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="text-sm font-medium">
            Requirements <span className="text-red-600">*</span>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={requirements.goodMoral}
                onChange={() => handleRequirementChange('goodMoral')}
              />
              Good Moral
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={requirements.birthCertificate}
                onChange={() => handleRequirementChange('birthCertificate')}
              />
              Birth Certificate
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={requirements.f138}
                onChange={() => handleRequirementChange('f138')}
              />
              F-138
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={requirements.f137}
                onChange={() => handleRequirementChange('f137')}
              />
              F-137
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2"
                checked={requirements.privacyForm}
                onChange={() => handleRequirementChange('privacyForm')}
              />
              Privacy Form
            </label>
          </div>
        </div> */}

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded text-white transition ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-800 hover:bg-red-900'
              }`}
          >
            Review & Submit Registration
          </button>
        </div>
      </form>

      {/* Review Modal */}
      <ReviewModal />
    </div>
  );
};

export default StudentRegistrationForm;
