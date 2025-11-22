'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, GraduationCap, Heart, Users } from 'lucide-react';
import {
    getStudentByNumber,
    type StudentPersonalData,
    type StudentHealthData,
    type StudentFamilyBackground,
    type StudentEducationalBackground,
    type StudentTransfereeBackground,
    type StudentSibling,
    type StudentRequirement,
} from '@/app/_actions/getStudentByNumber';

interface PageProps {
    params: Promise<{
        studentNumber: string;
    }>;
}

export default function StudentDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { studentNumber: encodedStudentNumber } = React.use(params);
    const studentNumber = decodeURIComponent(encodedStudentNumber);

    const [isLoading, setIsLoading] = useState(true);
    const [personalData, setPersonalData] = useState<StudentPersonalData | null>(null);
    const [healthData, setHealthData] = useState<StudentHealthData | null>(null);
    const [familyData, setFamilyData] = useState<StudentFamilyBackground[]>([]);
    const [educationalData, setEducationalData] = useState<StudentEducationalBackground | null>(null);
    const [transfereeData, setTransfereeData] = useState<StudentTransfereeBackground | null>(null);
    const [siblingsData, setSiblingsData] = useState<StudentSibling[]>([]);
    const [requirementsData, setRequirementsData] = useState<StudentRequirement[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true);
            const data = await getStudentByNumber(studentNumber);
            // console.log(data)

            if (data) {
                setPersonalData(data.personalData);
                setHealthData(data.healthData);
                setFamilyData(data.familyBackground);
                setEducationalData(data.educationalBackground);
                setTransfereeData(data.transfereeBackground);
                setSiblingsData(data.siblings);
                setRequirementsData(data.requirements);
            }
            setIsLoading(false);
        };

        if (studentNumber) {
            fetchStudentData();
        }
    }, [studentNumber]);

    const handleEditStudent = () => {
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        // Refetch data to reset any changes
        const refetchData = async () => {
            const data = await getStudentByNumber(studentNumber);
            if (data) {
                setPersonalData(data.personalData);
                setHealthData(data.healthData);
                setFamilyData(data.familyBackground);
                setEducationalData(data.educationalBackground);
                setTransfereeData(data.transfereeBackground);
                setSiblingsData(data.siblings);
                setRequirementsData(data.requirements);
            }
        };
        refetchData();
        setIsEditMode(false);
    };

    const handleSaveStudent = async () => {
        setIsSaving(true);
        try {
            // TODO: Implement save student API call
            console.log('Saving student data:', {
                personalData,
                healthData,
                familyData,
                educationalData,
                transfereeData,
                siblingsData,
                requirementsData
            });
            
            // After successful save
            alert('Student information updated successfully!');
            setIsEditMode(false);
        } catch (error) {
            console.error('Error saving student:', error);
            alert('Failed to save student information. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updatePersonalData = (field: keyof StudentPersonalData, value: string) => {
        setPersonalData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleArchiveStudent = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to archive ${personalData?.firstName} ${personalData?.familyName}?`
        );
        
        if (confirmed) {
            try {
                // TODO: Implement archive student API call
                console.log('Archiving student:', studentNumber);
                // After successful archive, redirect back to students list
                // router.push('/registrar/student-information');
            } catch (error) {
                console.error('Error archiving student:', error);
                alert('Failed to archive student. Please try again.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Students</span>
                </button>
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">Loading student data...</p>
                </div>
            </div>
        );
    }

    if (!studentNumber || !personalData) {
        return (
            <div className="p-4 sm:p-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Students</span>
                </button>
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">Student not found</p>
                </div>
            </div>
        );
    }

    // Extract family members by guardian type
    const father = familyData.find((family) => family.guardianType === 'FATHER');
    const mother = familyData.find((family) => family.guardianType === 'MOTHER');
    const guardian = familyData.find((family) => family.guardianType === 'GUARDIAN');

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header with Back Button and Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Students</span>
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                    {!isEditMode ? (
                        <>
                            <button
                                onClick={handleEditStudent}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Edit Student Information
                            </button>
                            <button
                                onClick={handleArchiveStudent}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Archive Student
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleSaveStudent}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>


            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                            {personalData?.firstName} {personalData?.middleName} {personalData?.familyName}
                        </h1>
                        <p className="text-lg text-gray-600">{studentNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${personalData?.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : personalData?.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {personalData?.status}
                    </span>
                </div>
            </div>

            {/* Student Details */}
            <div className="space-y-6">
                {/* Requirements */}
                {requirementsData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Requirements
                        </h3>
                        <div className="space-y-4">
                            {requirementsData.map((requirement) => (
                                <div key={requirement.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Type:</label>
                                            <input
                                                type="text"
                                                value={requirement.requirementType}
                                                disabled
                                                readOnly
                                                className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                                            <input
                                                type="text"
                                                value={requirement.status}
                                                disabled
                                                readOnly
                                                className={`w-full border border-gray-300 rounded px-2 py-1 text-gray-900 ${requirement.status === 'APPROVED' ? 'bg-green-100' :
                                                    requirement.status === 'SUBMITTED' ? 'bg-blue-100' :
                                                        requirement.status === 'REJECTED' ? 'bg-red-100' :
                                                            requirement.status === 'INCOMPLETE' ? 'bg-yellow-100' :
                                                                'bg-gray-100'
                                                    }`}
                                            />
                                        </div>
                                        {requirement.description && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                                                <textarea
                                                    value={requirement.description}
                                                    disabled
                                                    readOnly
                                                    rows={2}
                                                    className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                                                />
                                            </div>
                                        )}
                                        {requirement.fileUrl && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">File:</label>
                                                <a
                                                    href={requirement.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                    </h3>
                    <div className="space-y-6">
                        {/* Academic Year and Admission */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Academic Year
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData?.academicYear || 'Not specified'}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('academicYear', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admission to Grade/ Year
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData?.admissionGradeYear || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('admissionGradeYear', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Family Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.familyName || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('familyName', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.firstName || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('firstName', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.middleName || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('middleName', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nickname
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.nickname || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('nickname', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>

                        {/* Birth Information */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    placeholder="MM/DD/YY"
                                    value={personalData.birthdate || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('birthdate', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-smfont-medium text-gray-700 mb-1">
                                    Place of Birth
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.placeOfBirth || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('placeOfBirth', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.age || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('age', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Birth Order
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.birthOrder || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('birthOrder', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Siblings
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.numberOfSiblings || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('numberOfSiblings', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>

                        {/* Nationality and Religion */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nationality
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.nationality || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('nationality', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Religion
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.religion || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('religion', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Languages/ Dialect spoken at home
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.language || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('language', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>

                        </div>

                        {/* Physical Characteristics */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.height || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('height', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.weight || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('weight', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Type
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.bloodType || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('bloodType', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            {/* Group Gender and Child Status together to reduce horizontal gap */}
                            <div className="md:col-span-2 flex gap-8 items-start">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center">
                                            <input type="radio" disabled checked={personalData.gender === 'FEMALE'} className="mr-2" />
                                            <span className="text-sm text-gray-700">Female</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" disabled checked={personalData.gender === 'MALE'} className="mr-2" />
                                            <span className="text-sm text-gray-700">Male</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Child Status
                                    </label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center">
                                            <input type="radio" disabled checked={personalData.childStatus === 'Legitimate'} className="mr-2" />
                                            <span className="text-sm text-gray-700">Legitimate</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" disabled checked={personalData.childStatus === 'Biological'} className="mr-2" />
                                            <span className="text-sm text-gray-700">Biological</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" disabled checked={personalData.childStatus === 'Adopted'} className="mr-2" />
                                            <span className="text-sm text-gray-700">Adopted</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Landline Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.landlineNumber || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('landlineNumber', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.mobileNumber || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('mobileNumber', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Answer Here..."
                                    value={personalData.emailAddress || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('emailAddress', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>
                        <hr className="my-4" />

                        {/* Home Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Home Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.homeAddress || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('homeAddress', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.city || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('city', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>
                        <hr className="my-4" />

                        {/* Provincial Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincial Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.provincialAddress || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('provincialAddress', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
                                    value={personalData.provincialCity || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('provincialCity', e.target.value)}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                            </div>
                        </div>
                        <hr className="my-4" />

                        {/* Talents and Hobbies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Talents/ Special Skills
                                </label>
                                <textarea
                                    placeholder="Answer Here..."
                                    value={personalData.talentsSpecialSkills || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('talentsSpecialSkills', e.target.value)}
                                    rows={3}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                                <div className="text-right text-sm text-gray-500 mt-1">150</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hobbies and interests
                                </label>
                                <textarea
                                    placeholder="Answer Here..."
                                    value={personalData.hobbiesInterests || ''}
                                    disabled={!isEditMode}
                                    readOnly={!isEditMode}
                                    onChange={(e) => updatePersonalData('hobbiesInterests', e.target.value)}
                                    rows={3}
                                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${isEditMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}
                                />
                                <div className="text-right text-sm text-gray-500 mt-1">150</div>
                            </div>
                        </div>

                        <hr className="my-4" />
                    </div>
                </div>

                {/* Health History */}
                {healthData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Health History
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Childhood Diseases
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-gray-900">{healthData.childhoodDiseases || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Allergies
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-gray-900">{healthData.allergies}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Other Medical Conditions
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-gray-900">{healthData.medicalConditions}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Immunizations
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-gray-900">{healthData.immunizations}</p>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Physical Handicaps/ Special Needs
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-gray-900">{healthData.physicalHandicap}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Family Background */}
                {familyData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Family Background
                        </h3>

                        {/* Father's Background */}
                        {father && (
                            <div className="space-y-6">
                                <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1">
                                    FATHER&apos;S BACKGROUND
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Family Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Family Name"
                                                value={father.familyName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={father.firstName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Middle Name"
                                                value={father.middleName ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Birth Date:</label>
                                            <input
                                                type="text"
                                                placeholder="Birth Date"
                                                value={father.birthDate}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Place of Birth:</label>
                                            <input
                                                type="text"
                                                placeholder="Place of Birth"
                                                value={father.placeOfBirth}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Age:</label>
                                            <input
                                                type="text"
                                                placeholder="Age"
                                                value={father.age}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nationality:</label>
                                            <input
                                                type="text"
                                                placeholder="Nationality"
                                                value={father.nationality}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Religion:</label>
                                            <input
                                                type="text"
                                                placeholder="Religion"
                                                value={father.religion}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Landline Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Landline Number"
                                                value={father.landlineNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mobile Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                value={father.mobileNumber}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">E-mail Address:</label>
                                            <input
                                                type="email"
                                                placeholder="E-mail Address"
                                                value={father.email}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Home Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Home Address"
                                                value={father.homeAddress}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={father.city}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State/ Province:</label>
                                            <input
                                                type="text"
                                                placeholder="State / Province"
                                                value={father.stateProvince}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zip/ Postal Code:</label>
                                            <input
                                                type="text"
                                                placeholder="Zip / Postal Code"
                                                value={father.zipCode}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Educational Attainment/ Course:</label>
                                            <input
                                                type="text"
                                                placeholder="Educational Attainment / Course"
                                                value={father.education}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Occupational/ Position Held:</label>
                                            <input
                                                type="text"
                                                placeholder="Occupational / Position Held"
                                                value={father.occupation}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employer/ Company:</label>
                                            <input
                                                type="text"
                                                placeholder="Employer / Company"
                                                value={father.company ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Company Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Company Address"
                                                value={father.companyAddress ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={father.companyCity ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Business Telephone Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Business Telephone Number"
                                                value={father.businessNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Annual Income:</label>
                                            <input
                                                type="text"
                                                placeholder="Annual Income"
                                                value={father.annualIncome ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 flex-grow w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status of Parent:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-black">
                                            {[
                                                { label: "Married", value: "MARRIED" },
                                                { label: "Single Parent", value: "SINGLE_PARENT" },
                                                { label: "Separated", value: "SEPARATED" },
                                                { label: "Widowed", value: "WIDOWED" },
                                                { label: "Widowed, Remarried", value: "WIDOWED_REMARRIED" },
                                                { label: "Others: _______", value: "OTHERS" },
                                            ].map((status) => (
                                                <div key={status.value} className="inline-flex items-center">
                                                    <div
                                                        className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${father.statusOfParent === status.value ? "bg-gray-800" : ""
                                                            }`}
                                                    ></div>
                                                    <span>{status.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mother's Background */}
                        {mother && (
                            <div className="space-y-6 my-5">
                                <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1">
                                    MOTHER&apos;S BACKGROUND
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Family Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Family Name"
                                                value={mother.familyName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={mother.firstName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Middle Name"
                                                value={mother.middleName ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Birth Date:</label>
                                            <input
                                                type="text"
                                                placeholder="Birth Date"
                                                value={mother.birthDate}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Place of Birth:</label>
                                            <input
                                                type="text"
                                                placeholder="Place of Birth"
                                                value={mother.placeOfBirth}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Age:</label>
                                            <input
                                                type="text"
                                                placeholder="Age"
                                                value={mother.age}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nationality:</label>
                                            <input
                                                type="text"
                                                placeholder="Nationality"
                                                value={mother.nationality}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Religion:</label>
                                            <input
                                                type="text"
                                                placeholder="Religion"
                                                value={mother.religion}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Landline Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Landline Number"
                                                value={mother.landlineNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mobile Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                value={mother.mobileNumber}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">E-mail Address:</label>
                                            <input
                                                type="email"
                                                placeholder="E-mail Address"
                                                value={mother.email}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Home Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Home Address"
                                                value={mother.homeAddress}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={mother.city}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State/ Province:</label>
                                            <input
                                                type="text"
                                                placeholder="State / Province"
                                                value={mother.stateProvince}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zip/ Postal Code:</label>
                                            <input
                                                type="text"
                                                placeholder="Zip / Postal Code"
                                                value={mother.zipCode}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Educational Attainment/ Course:</label>
                                            <input
                                                type="text"
                                                placeholder="Educational Attainment / Course"
                                                value={mother.education}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Occupational/ Position Held:</label>
                                            <input
                                                type="text"
                                                placeholder="Occupational / Position Held"
                                                value={mother.occupation}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employer/ Company:</label>
                                            <input
                                                type="text"
                                                placeholder="Employer / Company"
                                                value={mother.company ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Company Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Company Address"
                                                value={mother.companyAddress ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={mother.companyCity ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Business Telephone Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Business Telephone Number"
                                                value={mother.businessNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Annual Income:</label>
                                            <input
                                                type="text"
                                                placeholder="Annual Income"
                                                value={mother.annualIncome ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status of Parent:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-black">
                                            {[
                                                { label: "Married", value: "MARRIED" },
                                                { label: "Single Parent", value: "SINGLE_PARENT" },
                                                { label: "Separated", value: "SEPARATED" },
                                                { label: "Widowed", value: "WIDOWED" },
                                                { label: "Widowed, Remarried", value: "WIDOWED_REMARRIED" },
                                                { label: "Others: _______", value: "OTHERS" },
                                            ].map((status) => (
                                                <div key={status.value} className="inline-flex items-center">
                                                    <div
                                                        className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${mother.statusOfParent === status.value ? 'bg-gray-800' : ''
                                                            }`}
                                                    ></div>
                                                    <span>{status.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Guardian's Background */}
                        {guardian && (
                            <div className="space-y-6 my-2">
                                <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1">
                                    GUARDIAN&apos;S BACKGROUND
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Family Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Family Name"
                                                value={guardian.familyName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                value={guardian.firstName}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Middle Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Middle Name"
                                                value={guardian.middleName ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Birth Date:</label>
                                            <input
                                                type="text"
                                                placeholder="Birth Date"
                                                value={guardian.birthDate}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Place of Birth:</label>
                                            <input
                                                type="text"
                                                placeholder="Place of Birth"
                                                value={guardian.placeOfBirth}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Age:</label>
                                            <input
                                                type="text"
                                                placeholder="Age"
                                                value={guardian.age}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nationality:</label>
                                            <input
                                                type="text"
                                                placeholder="Nationality"
                                                value={guardian.nationality}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Religion:</label>
                                            <input
                                                type="text"
                                                placeholder="Religion"
                                                value={guardian.religion}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Landline Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Landline Number"
                                                value={guardian.landlineNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mobile Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                value={guardian.mobileNumber}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">E-mail Address:</label>
                                            <input
                                                type="email"
                                                placeholder="E-mail Address"
                                                value={guardian.email}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Home Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Home Address"
                                                value={guardian.homeAddress}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={guardian.city}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">State/ Province:</label>
                                            <input
                                                type="text"
                                                placeholder="State / Province"
                                                value={guardian.stateProvince}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Zip/ Postal Code:</label>
                                            <input
                                                type="text"
                                                placeholder="Zip / Postal Code"
                                                value={guardian.zipCode}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Educational Attainment/ Course:</label>
                                            <input
                                                type="text"
                                                placeholder="Educational Attainment / Course"
                                                value={guardian.education}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Occupational/ Position Held:</label>
                                            <input
                                                type="text"
                                                placeholder="Occupational / Position Held"
                                                value={guardian.occupation}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employer/ Company:</label>
                                            <input
                                                type="text"
                                                placeholder="Employer / Company"
                                                value={guardian.company ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Company Address:</label>
                                            <input
                                                type="text"
                                                placeholder="Company Address"
                                                value={guardian.companyAddress ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City:</label>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={guardian.companyCity ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Business Telephone Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Business Telephone Number"
                                                value={guardian.businessNumber ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Annual Income:</label>
                                            <input
                                                type="text"
                                                placeholder="Annual Income"
                                                value={guardian.annualIncome ?? ''}
                                                disabled
                                                readOnly
                                                className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status of Parent:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-black">
                                            {[
                                                { label: "Married", value: "MARRIED" },
                                                { label: "Single Parent", value: "SINGLE_PARENT" },
                                                { label: "Separated", value: "SEPARATED" },
                                                { label: "Widowed", value: "WIDOWED" },
                                                { label: "Widowed, Remarried", value: "WIDOWED_REMARRIED" },
                                                { label: "Others: _______", value: "OTHERS" },
                                            ].map((status) => (
                                                <div key={status.value} className="inline-flex items-center">
                                                    <div
                                                        className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${guardian.statusOfParent === status.value ? 'bg-gray-800' : ''
                                                            }`}
                                                    ></div>
                                                    <span>{status.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Siblings */}
                        {siblingsData.length > 0 && (
                            <div className="space-y-6 my-2">
                                <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1">
                                    SIBLINGS
                                </h3>
                                <div className="space-y-6">
                                    {siblingsData.map((sibling, index) => (
                                        <div key={sibling.id} className="space-y-4 border-b pb-6 last:border-b-0">
                                            <div className="text-sm font-semibold text-gray-700">Sibling #{index + 1}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">Family Name:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.familyName}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">First Name:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.firstName}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">Middle Name:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.middleName ?? ''}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">Birth Date:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.birthDate}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">Age:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.age}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">Gr./ Yr. Level:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.gradeYearLevel}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">School/Employer:</label>
                                                    <input
                                                        type="text"
                                                        value={sibling.schoolEmployer}
                                                        disabled
                                                        readOnly
                                                        className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-50 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Educational Background */}
                {educationalData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Educational Background
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {/* School #1 */}
                                <div className="text-sm font-medium text-gray-700 mb-4">School #1:</div>

                                {/* First Row - Gr/Yr Level, School Name, Address, Inclusive Years */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gr / Yr. Level:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Answer Here..."
                                            value={educationalData.yearLevel ?? ''}
                                            disabled
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name of School:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Answer Here..."
                                            value={educationalData.schoolName ?? ''}
                                            disabled
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            School Address:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Answer Here..."
                                            value={educationalData.schoolAddress ?? ''}
                                            disabled
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Inclusive Years:
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="YYYY - YYYY"
                                            value={educationalData.inclusiveYearsAttended ?? ''}
                                            disabled
                                            readOnly
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Honors / Awards Received:
                                        </label>
                                        <textarea
                                            placeholder="Answer Here..."
                                            value={educationalData.honorsReceived.join(', ') ?? ''}
                                            disabled
                                            readOnly
                                            rows={6}
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Attended Summer Classes:
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Yes/No"
                                                value={educationalData.attendedSummerClasses ?? ''}
                                                disabled
                                                readOnly
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Summer Class Details:
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Details..."
                                                value={educationalData.summerClassDetails ?? ''}
                                                disabled
                                                readOnly
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Gr / Yr. Level Repeated:
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Answer Here..."
                                                    value={educationalData.yearRepeated ?? ''}
                                                    disabled
                                                    readOnly
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    No. of Subjects Failed:
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Answer Here..."
                                                    value={educationalData.numberOfSubjectsFailed ?? ''}
                                                    disabled
                                                    readOnly
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TRANSFEREES - Only show if transferee data exists */}
                                {transfereeData && (
                                    <>
                                        <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1 mt-6">
                                            FOR TRANSFEREES
                                        </h3>

                                        {/* Previous School */}
                                        {transfereeData.previousSchool && (
                                            <div className="border rounded-md p-4 mb-6">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Previous School:</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.previousSchool.schoolName}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Address:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.previousSchool.schoolAddress}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inclusive Years:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.previousSchool.inclusiveYears}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.previousSchool.reasonForLeaving ?? ''}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Present School */}
                                        {transfereeData.presentSchool && (
                                            <div className="border rounded-md p-4 mb-6">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Present School:</div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.presentSchool.schoolName}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Address:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.presentSchool.schoolAddress}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inclusive Years:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.presentSchool.inclusiveYears}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving:</label>
                                                        <input
                                                            type="text"
                                                            value={transfereeData.presentSchool.reasonForLeaving ?? ''}
                                                            disabled
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reason for Transferring */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transferring:</label>
                                            <textarea
                                                value={transfereeData.reasonForTransfer}
                                                disabled
                                                readOnly
                                                rows={3}
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                            />
                                        </div>

                                        {/* Disciplinary Actions */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Has the applicant been subjected to any disciplinary actions in school? If yes, please describe the action and the sanctions:
                                            </label>
                                            <textarea
                                                value={transfereeData.disciplinaryRecord ?? ''}
                                                disabled
                                                readOnly
                                                rows={3}
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
