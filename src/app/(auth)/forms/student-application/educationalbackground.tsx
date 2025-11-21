import React from "react";
import { useFormData } from "./FormDataContext";

interface StudentEducationalBackgroundPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentEducationalBackgroundPage({ onBack, onNext }: StudentEducationalBackgroundPageProps) {
  const { formData, updateFormData } = useFormData();
  const { educationalBackground } = formData;

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
    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
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
                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level:</label>
                <input
                  type="number"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={school.gradeYearLevel}
                  onChange={(e) => updateSchool(index, 'gradeYearLevel', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Name of School:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={school.schoolName}
                  onChange={(e) => updateSchool(index, 'schoolName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">School Address:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={school.schoolAddress}
                  onChange={(e) => updateSchool(index, 'schoolAddress', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Inclusive Years:</label>
                <input
                  type="text"
                  placeholder="YYYY-YYYY"
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={school.inclusiveYears}
                  onChange={(e) => updateSchool(index, 'inclusiveYears', e.target.value)}
                />
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
              <label className="block text-sm font-medium mb-1 text-black">Honors/ Awards Recieved:</label>
              <input
                type="text"
                placeholder="Answer Here..."
                className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                value={educationalBackground[0]?.honorsAwardsReceived || ""}
                onChange={(e) => updateSchool(0, 'honorsAwardsReceived', e.target.value)}
              />
            </div>
          </div>



          {/* Column Right */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <fieldset className="border border-gray-300 rounded p-4">
                  <div className="flex items-center space-x-4 text-black">
                    <label className="text-sm font-medium whitespace-nowrap md:col-span-1">Attended Summer Classes A.Y.</label>
                    <input
                      type="text"
                      placeholder="Answer Here..."
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
                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level Repeated:</label>
                <input
                  type="number"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={educationalBackground[0]?.gradeYearLevelRepeated || ""}
                  onChange={(e) => updateSchool(0, 'gradeYearLevelRepeated', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">No. of Subjects Failed:</label>
                <input
                  type="number"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={educationalBackground[0]?.numberOfSubjectsFailed || ""}
                  onChange={(e) => updateSchool(0, 'numberOfSubjectsFailed', e.target.value)}
                />
              </div>
            </div>
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
