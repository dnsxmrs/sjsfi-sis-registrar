'use client';

import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Eye, Copy, Check, X } from 'lucide-react';
import { rejectRegistration } from '@/app/_actions/rejectRegistration';
import { approveRegistration } from '@/app/_actions/approveRegistration';
import { generateRegistrationCode } from '@/app/(auth)/forms/_actions/code';
import { getStudentTableData, getOneStudentTableData } from '@/app/_actions/getStudentsList';

const RegisterCoursePage: React.FC = () => {
    // Selected registration details state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isCodeCopied, setIsCodeCopied] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [students, setStudents] = useState<any[]>([]);

    const studentsList = async () => {
        try {
            const result = await getStudentTableData();
            if (result.success) {
                setStudents(result.students);

                // Automatically load first registration details if available
                if (result.students.length > 0 && !selectedRegistration) {
                    await handleViewStudent(result.students[0].id);
                }
            } else {
                console.error('Failed to fetch students:');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }

    // Fetch students on component mount
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            await studentsList();
            setIsLoading(false);
        };

        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGenerateRegistration = async () => {
        setIsGeneratingCode(true);
        setGeneratedCode('');
        setIsCodeCopied(false);

        try {
            const result = await generateRegistrationCode();

            if (result.success && result.code) {
                setGeneratedCode(result.code);

                // Show success alert with the generated code
                // alert(`✅ Registration Code Generated Successfully!\n\nCode: ${result.code}\n\nThis code is unique and can only be used once for registration.\nPlease provide this code to the student to access the registration form.`);
                toast.success(`Registration Code Generated: ${result.code}`, {
                    duration: 5000,
                });
            } else {
                toast.error(`Failed to generate registration code: ${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            console.error('Error generating registration code:', error);
            toast.error('An error occurred while generating the registration code. Please try again.');
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleCopyCode = async () => {
        if (generatedCode) {
            try {
                await navigator.clipboard.writeText(generatedCode);
                setIsCodeCopied(true);
                setTimeout(() => setIsCodeCopied(false), 2000); // Reset after 2 seconds
            } catch {
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = generatedCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setIsCodeCopied(true);
                setTimeout(() => setIsCodeCopied(false), 2000);
            }
        }
    };

    const handleRegister = async () => {
        if (!selectedRegistrationId) {
            toast.error('No registration selected.');
            return;
        }
        try {
            const result = await approveRegistration(selectedRegistrationId);

            if (result.success && result.code) {
                setGeneratedCode(result.code);
                toast.success(`Registration Code Generated: ${result.code}`, {
                    duration: 5000,
                });

                // Update the selected registration status
                if (selectedRegistration) {
                    setSelectedRegistration({
                        ...selectedRegistration,
                        status: 'APPROVED'
                    });
                }

                // Refresh the students list
                studentsList();

            } else {
                toast.error(`Failed to generate registration code: ${result.error || 'Unknown error occurred'}`);
            }

        } catch {
            toast.error('An error occurred while generating the registration code. Please try again.');
        } finally {
            setSelectedRegistration(null);
        }
    };

    const handleRejectRegistration = async () => {
        if (!selectedRegistrationId) {
            toast.error('No registration selected.');
            return;
        }

        // Just show the modal for confirmation
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!selectedRegistrationId) {
            toast.error('No registration selected.');
            return;
        }

        setShowRejectModal(false);

        try {
            const result = await rejectRegistration(selectedRegistrationId);
            if (result.success) {
                toast.success(`Registration rejected for ${selectedRegistration?.firstName} ${selectedRegistration?.familyName}`);

                // Refresh the students list
                const refreshResult = await getStudentTableData();
                if (refreshResult.success) {
                    setStudents(refreshResult.students);
                }

                // Clear selection
                setSelectedRegistration(null);
                setSelectedRegistrationId(null);
            } else {
                toast.error(`Failed to reject registration: ${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            console.error('Error rejecting registration:', error);
            toast.error('An error occurred while rejecting the registration. Please try again.');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleViewStudent = async (studentId: any) => {
        setIsLoadingDetails(true);
        try {
            // fetch the selected registration data
            const result = await getOneStudentTableData(studentId);
            setSelectedRegistration(result);
            setSelectedRegistrationId(studentId);
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast.error('Failed to load student details');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Rejection Modal Component
    const RejectionModal: React.FC = () => {
        if (!showRejectModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                Reject Registration
                            </h3>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to reject the registration for <strong>{selectedRegistration?.firstName} {selectedRegistration?.familyName}</strong>?
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                                <p className="text-sm text-gray-700">
                                    <strong>Registration ID:</strong> {selectedRegistration?.studentNo}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Full Name:</strong> {selectedRegistration?.firstName} {selectedRegistration?.familyName}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Grade Level:</strong> {selectedRegistration?.yearLevel?.name}
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-red-800">Warning</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        This action cannot be undone. The registration will be permanently rejected.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Reject Registration</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-6 space-y-6 bg-gray-100">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
                <aside className="w-full md:w-56 space-y-4 flex-shrink-0 order-1 md:order-2">
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col space-y-3">
                        <label className="block text-sm font-medium text-black px-3">
                            Quick Access Buttons
                        </label>
                        <button
                            className="bg-red-800 text-white py-2 rounded text-sm hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            onClick={() => handleGenerateRegistration()}
                            disabled={isGeneratingCode}
                        >
                            {isGeneratingCode ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <span>Generate Registration Code</span>
                            )}
                        </button>

                        {/* Generated Code Display */}
                        {generatedCode && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
                                <label className="block text-xs font-medium text-green-800">
                                    Generated Code:
                                </label>
                                <div className="flex items-center space-x-2 w-full">
                                    <input
                                        type="text"
                                        value={generatedCode}
                                        readOnly
                                        className="flex-1 min-w-0 text-sm font-mono bg-white border border-green-300 rounded px-2 py-1 text-green-800 truncate"
                                    />
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex-shrink-0 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                                        title="Copy to clipboard"
                                    >
                                        {isCodeCopied ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-green-700">
                                    Provide this code to the student/parent for registration access.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>
                {/* First Column: Add Student Form + All Students Table */}
                <div className="flex-1 space-y-6 order-2 md:order-1">
                    {/* All Students Table */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 text-black">Pending Registration</h2>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-500">Loading students...</div>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm"><thead>
                                <tr className="border-b border-gray-300 text-black">
                                    <th className="py-2 font-semibold">Registration ID</th>
                                    <th className="py-2 font-semibold">Date & Time</th>
                                    <th className="py-2 font-semibold">Full Name</th>
                                    <th className="py-2 font-semibold">Grade Level</th>
                                    <th className="py-2 font-semibold">Actions</th>
                                </tr>
                            </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-4 text-center text-gray-500">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id} className="border-b border-gray-200 text-black hover:bg-gray-50">
                                                <td className="py-2">{student.registrationId}</td>
                                                <td className="py-2">{student.createdAt}</td>
                                                <td className="py-2">{student.fullName}</td>
                                                {/* <td className="py-2">{student.familyName}</td> */}
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        {student.gradeLevel}
                                                    </span>
                                                </td>
                                                <td className="py-2 flex space-x-4">
                                                    <button
                                                        title="View"
                                                        className="text-gray-700 hover:text-gray-900"
                                                        onClick={() => handleViewStudent(student.id)}
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Registration Details */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 text-black">
                            Registration Details
                        </h2>
                        {isLoadingDetails ? (
                            <div className="flex flex-col justify-center items-center py-16 space-y-4">
                                <div className="animate-spin h-12 w-12 border-4 border-red-800 border-t-transparent rounded-full"></div>
                                <p className="text-gray-600 text-sm">Loading registration details...</p>
                            </div>
                        ) : selectedRegistration ? (
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Basic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Registration ID</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.studentNo}
                                            </div>
                                        </div>
                                        <div>
                                            {/* empty 2nd column to force down the other fields */}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">First Name</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.firstName}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Middle Name</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.middleName || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Family Name</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.familyName}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Email Address</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.emailAddress}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Birthdate</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.birthdate}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Place of Birth</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.placeOfBirth}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Age</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.age} years old
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Gender</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.gender}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Address Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Street Address</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.streetAddress}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">City</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.city}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">State/Province</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.stateProvince}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Postal Code</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.postalCode}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Academic Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">School Year</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.schoolYear.year}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Grade Level</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.yearLevel.name}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Registration Type</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.registrationType}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Registration Status</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 bg-gray-100">
                                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${selectedRegistration.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedRegistration.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {selectedRegistration.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Mode of Payment</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.modeOfPayment}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Amount Payable</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                ₱ {selectedRegistration.amountPayable.toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Numbers */}
                                {selectedRegistration.contactNumbers.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Contact Number/s</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {selectedRegistration.contactNumbers.map((contact: any, index: number) => (
                                                <div key={contact.id}>
                                                    <label className="block text-sm font-medium mb-1 text-black">Contact {index + 1}</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                        {contact.number}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Guardians */}
                                {selectedRegistration.guardians.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Guardian/s</h3>
                                        <div className="space-y-4">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {selectedRegistration.guardians.map((guardian: any, index: number) => (
                                                <div key={guardian.id} className="border border-gray-200 rounded p-3 bg-gray-50 text-black">
                                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Guardian {index + 1}</h4>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <strong>Name:</strong> {guardian.firstName} {guardian.middleName ? guardian.middleName + ' ' : ''}{guardian.familyName}
                                                        </div>
                                                        <div>
                                                            <strong>Relation:</strong> {guardian.relationToStudent}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <strong>Occupation:</strong> {guardian.occupation}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Registration Dates */}
                                <div>
                                    <h3 className="text-md font-semibold mb-3 text-gray-800 border-b pb-2">Registration Dates</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Created At</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.createdAt}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-black">Last Updated</label>
                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100">
                                                {selectedRegistration.updatedAt}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4 pt-4 border-t">
                                    <button
                                        onClick={handleRegister}
                                        disabled={selectedRegistration.status === 'APPROVED'}
                                        className={`px-4 py-2 rounded text-sm flex items-center space-x-2 ${selectedRegistration.status === 'APPROVED'
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-800 hover:bg-red-900'
                                            } text-white`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span>
                                            {selectedRegistration.status === 'APPROVED' ? 'Already Approved' : 'Approve Registration'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleRejectRegistration}
                                        disabled={selectedRegistration.status !== 'PENDING'}
                                        className={`px-4 py-2 rounded text-sm flex items-center space-x-2 ${selectedRegistration.status !== 'PENDING'
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gray-600 hover:bg-gray-700'
                                            } text-white`}
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Reject Registration</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>Select a registration from the table above to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Rejection Modal */}
            <RejectionModal />
        </div>
    );
};

export default RegisterCoursePage;