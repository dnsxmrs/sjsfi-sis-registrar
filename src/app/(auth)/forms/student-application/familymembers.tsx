import React from "react";
import { useFormData } from "./FormDataContext";

interface StudentFamilyMembersPageProps {
  onBack?: () => void;
  onNext?: () => void;
}

export default function StudentFamilyMembersPage({ onBack, onNext }: StudentFamilyMembersPageProps) {
  const { formData, updateFormData } = useFormData();
  const { familyMembers } = formData;

  // Handler to add a new sibling
  const addSibling = () => {
    const newSibling = {
      familyName: "",
      firstName: "",
      middleName: "",
      birthDate: "",
      age: "",
      gradeYearLevel: "",
      schoolEmployer: "",
    };
    updateFormData('familyMembers', [...familyMembers, newSibling]);
  };

  // Handler to update a specific sibling
  const updateSibling = (index: number, field: keyof typeof familyMembers[0], value: string) => {
    const updatedSiblings = [...familyMembers];
    updatedSiblings[index] = {
      ...updatedSiblings[index],
      [field]: value
    };
    updateFormData('familyMembers', updatedSiblings);
    console.log(`Updated ${field} to: ${value}`);
    console.log(formData);
  };

  // Handler to remove a sibling
  const removeSibling = (index: number) => {
    if (familyMembers.length > 1) {
      const updatedSiblings = familyMembers.filter((_, i: number) => i !== index);
      updateFormData('familyMembers', updatedSiblings);
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
          <div className="font-bold text-lg tracking-wide py-2 text-white bg-[#a10000] rounded w-full text-center">FAMILY MEMBERS: SIBLINGS</div>
        </div>

        {/* Sibling Info Fields */}
        {familyMembers.map((sibling, index: number) => (
          <fieldset key={index} className="border border-gray-300 rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <legend className="block text-sm font-medium mb-1 text-black px-2">{`Sibling #${index + 1}`}</legend>
              {familyMembers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSibling(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Family Name:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.familyName}
                  onChange={(e) => updateSibling(index, 'familyName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">First Name:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.firstName}
                  onChange={(e) => updateSibling(index, 'firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Middle Name:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.middleName}
                  onChange={(e) => updateSibling(index, 'middleName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Birth Date:</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.birthDate}
                  onChange={(e) => updateSibling(index, 'birthDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Age:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.age}
                  onChange={(e) => updateSibling(index, 'age', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.gradeYearLevel}
                  onChange={(e) => updateSibling(index, 'gradeYearLevel', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">School Employer:</label>
                <input
                  type="text"
                  placeholder="Answer Here..."
                  className="border border-gray-300 rounded px-2 py-1 w-full text-black"
                  value={sibling.schoolEmployer}
                  onChange={(e) => updateSibling(index, 'schoolEmployer', e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        ))}

        <div className="w-full flex justify-left mt-8">
          <button
            className="bg-red-800 text-white px-6 py-2 rounded-md shadow hover:bg-[#7a0000] transition"
            onClick={addSibling}
          >
            Add Sibling
          </button>
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
