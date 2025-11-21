import React from "react";
import { useFormData } from "./FormDataContext";

interface StudentHealthHistoryPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentHealthHistoryPage({ onBack, onNext }: StudentHealthHistoryPageProps) {
  const { formData, updateFormData } = useFormData();
  const { healthHistory } = formData;

  const handleInputChange = (field: keyof typeof healthHistory, value: string) => {
    updateFormData('healthHistory', {
      ...healthHistory,
      [field]: value
    });
    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  return (
    <div className=" flex min-h-screen flex-col items-center py-8">
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

        {/* Health History Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Childhood Diseases:</label>
              <input
                type="text"
                placeholder="Answer Here..."
                className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                value={healthHistory.childhoodDiseases}
                onChange={(e) => handleInputChange('childhoodDiseases', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Other Medical Conditions:</label>
              <input
                type="text"
                placeholder="Answer Here..."
                className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                value={healthHistory.otherMedicalConditions}
                onChange={(e) => handleInputChange('otherMedicalConditions', e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Allergies:</label>
              <input
                type="text"
                placeholder="Answer Here..."
                className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                value={healthHistory.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Immunizations:</label>
              <input
                type="text"
                placeholder="Answer Here..."
                className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                value={healthHistory.immunizations}
                onChange={(e) => handleInputChange('immunizations', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Physical Handicaps / Special Needs */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Any Physical handicaps or special needs which should be taken in consideration (please specify):</label>
          <div className="relative">
            <textarea
              rows={5}
              maxLength={250}
              placeholder="Answer Here..."
              className="input input-bordered w-full text-black border border-gray-300 rounded px-2 py-1 resize-none pt-2"
              value={healthHistory.physicalHandicaps}
              onChange={(e) => handleInputChange('physicalHandicaps', e.target.value)}
            />
            <span className="absolute bottom-2 right-4 text-xs text-gray-400">250</span>
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
