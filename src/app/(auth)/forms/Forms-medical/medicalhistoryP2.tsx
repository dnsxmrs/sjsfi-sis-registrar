import React from "react";
import Agreement from "../student-application/agreement";

interface MedicalHistoryPage2Props {
  onBack?: () => void;
  onNext?: () => void;
  showAgreement?: boolean;
}

export default function MedicalHistoryPage2({ onBack, onNext, showAgreement }: MedicalHistoryPage2Props) {
  const [showAgreementPage, setShowAgreementPage] = React.useState(false);

  if (showAgreementPage || showAgreement) {
    return <Agreement onBack={() => setShowAgreementPage(false)} />;
  }

  return (
    <div className=" flex min-screen flex-col items-center py-8">
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
              MEDICAL HISTORY QUESTIONNAIRE
            </h1>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-6">
        {/* Section Title */}
        <div className="w-full flex justify-center">
          <div className="text-lg tracking-wide py-2 text-black shadow border-gray-200 rounded w-full text-center p-3">
            Please indicate whether you currently have or have ever had any of the following medical condition, select all that apply 
            </div>
        </div>

        {/* Health History Fields */}
        <div className="flex flex-col gap-6 mt-5">
          {/* Header row */}
          <fieldset className="border border-gray-300 rounded p-2">
            <div className="grid grid-cols-3 gap-4 text-black font-semibold text-center">
              <div></div>
              <div>YES</div>
              <div>NO</div>
            </div>
          </fieldset>
          {/* Rows */}
          {[
            "Epilepsy or the 6 months",
            "Head Injuries leading to loss of consciousness for the last 6 months",
            "Recurrent headache/ migraine",
            "Diseases Nervous System (Multiple Sclerosis)",
            "Surgery",
            "Visual Diseases (blindness on one eye, blurred vision, glaucoma)",
            "Ear Infection",
            "Vertigo or Dizziness",
            "Heart Diseases",
            "Asthma, Bronchitis, TB or Pneumonia",
            "Ulcer",
            "Liver Diseases or Hepatitis",
            "Problems with joints, bones or recurrent dislocation",
            "Allergic skin rashes",
            "Mental Illness",
            "Allergies"
          ].map((condition, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 items-center text-black text-sm">
              <div className="text-left">{i + 1}. {condition}</div>
              <div className="flex justify-center">
                <input type="radio" name={`condition-${i + 1}`} value="yes" />
              </div>
              <div className="flex justify-center">
                <input type="radio" name={`condition-${i + 1}`} value="no" />
              </div>
            </div>
          ))}
        </div>

        {/* Questions */}
          <div className="flex flex-col gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">If you had surgery, please specify:</label>
              <input type="text" placeholder="Answer Here..." className="border border-gray-300 rounded px-2 py-1 w-full text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">If you have heart diseases, please specify what:</label>
              <input type="text" placeholder="Answer Here..." className="border border-gray-300 rounded px-2 py-1 w-full text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">For no. 10, please specify which:</label>
              <input type="text" placeholder="Answer Here..." className="border border-gray-300 rounded px-2 py-1 w-full text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">If you have allergies, please specify what:</label>
              <input type="text" placeholder="Answer Here..." className="border border-gray-300 rounded px-2 py-1 w-full text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Do you have any medication that youre currently taking?:</label>
              <input type="text" placeholder="Answer Here..." className="border border-gray-300 rounded px-2 py-1 w-full text-black" />
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
