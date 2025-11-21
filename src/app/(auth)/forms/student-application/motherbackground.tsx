import React, { useState } from "react";
import { useFormData } from "./FormDataContext";

interface MotherBackgroundPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function MotherBackgroundPage({ onBack, onNext }: MotherBackgroundPageProps) {
  const { formData, updateFormData } = useFormData();
  const { motherBackground } = formData;
  const [otherStatus, setOtherStatus] = useState("");

  const handleInputChange = (field: keyof typeof motherBackground, value: string) => {
    updateFormData('motherBackground', {
      ...motherBackground,
      [field]: value
    });
    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  const handleStatusChange = (status: string) => {
    if (status === "Others") {
      handleInputChange('statusOfParent', `Others: ${otherStatus}`);
    } else {
      handleInputChange('statusOfParent', status);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] flex flex-col items-center py-8">
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
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">FAMILY BACKGROUND: MOTHER</div>
        </div>

        {/* Father Background Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Family Name:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.familyName}
              onChange={(e) => handleInputChange('familyName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">First Name:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Middle Name:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.middleName}
              onChange={(e) => handleInputChange('middleName', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Birth Date:</label>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Place of Birth:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Age:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Nationality:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Religion:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Landline Number:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.landlineNumber}
              onChange={(e) => handleInputChange('landlineNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Mobile Number:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">E-mail Address:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.emailAddress}
              onChange={(e) => handleInputChange('emailAddress', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Home Address:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.homeAddress}
              onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">City:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">State/ Province:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.stateProvince}
              onChange={(e) => handleInputChange('stateProvince', e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-black">Zip/ Postal Code:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.zipPostalCode}
              onChange={(e) => handleInputChange('zipPostalCode', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Educational Attainment/ Course:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.educationalAttainmentCourse}
              onChange={(e) => handleInputChange('educationalAttainmentCourse', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Occupational/ Position Held:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.occupationalPositionHeld}
              onChange={(e) => handleInputChange('occupationalPositionHeld', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Employer/ Company:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.employerCompany}
              onChange={(e) => handleInputChange('employerCompany', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Company Address:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Company City:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.city}//palitan toh
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Business Telephone Number:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.businessTelephoneNumber}
              onChange={(e) => handleInputChange('businessTelephoneNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Annual Income:</label>
            <input
              type="text"
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
              value={motherBackground.annualIncome}
              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            />
          </div>
        </div>

        {/* Status of Parent */}
        <div>
          <fieldset className="border border-gray-300 rounded p-2">
            <legend className="block text-sm font-medium mb-1 text-black px-2">Status of Parent:</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent === "Married"}
                  onChange={() => handleStatusChange("Married")}
                /> Married
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent === "Single Parent"}
                  onChange={() => handleStatusChange("Single Parent")}
                /> Single Parent
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent === "Separated"}
                  onChange={() => handleStatusChange("Separated")}
                /> Separated
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent === "Widowed"}
                  onChange={() => handleStatusChange("Widowed")}
                /> Widowed
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent === "Widowed, Remarried"}
                  onChange={() => handleStatusChange("Widowed, Remarried")}
                /> Widowed, Remarried
              </label>
              <label className="flex items-center gap-2 text-black font-medium">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-sm text-black bg-gray-100 border border-gray-300"
                  checked={motherBackground.statusOfParent?.startsWith("Others")}
                  onChange={() => handleStatusChange("Others")}
                /> Others:
                {motherBackground.statusOfParent?.startsWith("Others") && (
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
