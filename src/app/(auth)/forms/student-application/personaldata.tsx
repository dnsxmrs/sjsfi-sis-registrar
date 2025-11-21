import React, { useEffect, useState } from "react";
import { useFormData } from "./FormDataContext";
import { getRegistrationByCode } from "@/app/_actions/getRegistrationByCode";
import { useSearchParams } from "next/navigation";

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

  // Fetch registration data on component mount
  useEffect(() => {
    const fetchRegistrationData = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No registration code provided');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRegistrationByCode(code);

        if (result.success && result.data) {
          // Update form data with fetched data
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
  }, [searchParams]); // Only run once when component mounts

  const handleInputChange = (field: keyof typeof personalData, value: string) => {
    updateFormData('personalData', {
      ...personalData,
      [field]: value
    });
    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-8">
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

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">

        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">PERSONAL DATA</div>
        </div>
        {/* Academic Year and Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Academic Year:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.academicYear}
              onChange={(e) => handleInputChange('academicYear', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Admission to Grade/ Year:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.admissionGradeYear}
              onChange={(e) => handleInputChange('admissionGradeYear', e.target.value)}
            />
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Family Name:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.familyName}
              onChange={(e) => handleInputChange('familyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">First Name:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Middle Name:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nickname:</label>
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
            <label className="block text-sm font-medium mb-1 text-black">Birth Date:</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Place of Birth:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Age:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Birth Order:</label>
            <input
              type="text"
              placeholder="1st, 2nd, 3rd, etc."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.birthOrder}
              onChange={(e) => handleInputChange('birthOrder', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Number of Siblings:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.siblingsCount}
              onChange={(e) => handleInputChange('siblingsCount', e.target.value)}
            />
          </div>
          <fieldset className="border border-gray-300 rounded p-2">
            <legend className="block text-sm font-medium mb-1 text-black px-2">Sex:</legend>
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
          </fieldset>
        </div>

        {/* Nationality, Religion, Height, Weight, Blood Type */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nationality:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Religion:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Height: (in cm)</label>
            <input
              type="text"
              placeholder="120"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Weight: (in kg)</label>
            <input
              type="text"
              placeholder="20"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Blood Type:</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.bloodType || 'O+'}
              onChange={(e) => handleInputChange('bloodType', e.target.value)}
            >
              <option disabled value="">Select blood type</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* Languages, Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Languages/ Dialect spoken at home:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <fieldset className="border border-gray-300 rounded p-2">
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
            </fieldset>
          </div>
        </div>

        {/* Landline, Mobile, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Landline Number:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.landline}
              onChange={(e) => handleInputChange('landline', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Mobile Number:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">E-mail Address:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
        </div>

        {/* Home Address */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Home Address:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">City:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.homeCity}
              onChange={(e) => handleInputChange('homeCity', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">State/ Province:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.homeStateProvince}
              onChange={(e) => handleInputChange('homeStateProvince', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Zip/ Postal Code:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.homeZip}
              onChange={(e) => handleInputChange('homeZip', e.target.value)}
            />
          </div>
        </div>

        {/* Provincial Address */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-black">Provincial Address:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialAddress}
              onChange={(e) => handleInputChange('provincialAddress', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">City:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialCity}
              onChange={(e) => handleInputChange('provincialCity', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">State/ Province:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialStateProvince}
              onChange={(e) => handleInputChange('provincialStateProvince', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Zip/ Postal Code:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.provincialZip}
              onChange={(e) => handleInputChange('provincialZip', e.target.value)}
            />
          </div>
        </div>

        {/* Talents/Skills and Hobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-1 text-black">Talents/ Special Skills:</label>
            <input
              type="text"
              placeholder="Answer Here.."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={personalData.talents}
              onChange={(e) => handleInputChange('talents', e.target.value)}
            />
            <span className="text-gray-400 ml-2">150</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-1 text-black">Hobbies and Interests:</label>
            <input
              type="text"
              placeholder="Answer Here.."
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
          onClick={onNext}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
