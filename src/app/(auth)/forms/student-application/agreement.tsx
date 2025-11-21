import React, { useState } from "react";

interface AgreementProps {
  onBack?: () => void;
  onConfirm?: () => void;
}

export default function Agreement({ onBack, onConfirm }: AgreementProps) {
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [relationship, setRelationship] = useState("");

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-8 bg-[#f7f7f7]">
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
              AGREEMENT
            </h1>
          </div>
        </div>
      </div>
  {/* Card */}
  <div className="w-full bg-white rounded-lg shadow p-8 border border-gray-200 flex flex-col gap-8">
        <div className="text-base text-black mb-4">I wish to enroll my child
          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Student Full Name"
            className="border border-gray-300 rounded px-2 py-1 ml-2 w-64 text-black"
          />
          &ensp;to your school, St. Joseph School of Fairview, and upon compliance with the entrance/re-admission requirements, I understand that he/she must:
        </div>
        <ol className="list-decimal list-inside text-base text-black pl-4 space-y-2 mb-4">
          <li>Comply with all the policies and procedures such as attendance and punctuality, scholastics/academic performance set by the school;</li>
          <li>Attend and support all the activities duly organized by the school both in co-curricular and extra-curricular, particularly in the institutional activities such as School Orientation Day, Christmas party/Liturgical Activities, Educational Tour, Foundation Day, Retreat and Recollections, Community Outreach Program and JS Prom, etc.;</li>
          <li>Abide by the behavioural standards and rules of discipline as specified in the student’s handbook, e.g. wearing of prescribed uniform, behaviour within and out of the campus, etc.;</li>
          <li>Conform to all rules and regulation set forth by the institution (including the increase in tuition/miscellaneous/other fees) now enforced or may be promulgated by the school from time to time.</li>
        </ol>
        <div className="text-base text-black mb-4">
          By affixing my name, I hereby waive my right in any form and commit myself towards the realization of the vision-mission of the institution, particularly the rules and regulation as stipulated in the Student’s Handbook.
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Parent / Guardian Name:</label>
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Relationship to the Child:</label>
            <input
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Answer Here..."
              className="border border-gray-300 rounded px-2 py-1 w-full text-black"
            />
          </div>
        </div>
        <div className="w-full flex justify-end mt-2">
          <button
            className="bg-red-800 text-white px-6 py-2 rounded-md shadow hover:bg-[#7a0000] transition"
            onClick={onConfirm} //add modal for forms review here
          >
            Confirm and Review Form
          </button>
        </div>
      </div>
    </div>
  );
}
