'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash, X, Mail } from 'lucide-react';
// import { getStudents } from '@/app/_actions/getStudents';
import { getStudentApplicationTableData } from '@/app/_actions/getStudentsList';
import { sendMissingRequirementsNotification, getMissingRequirements } from '@/app/_actions/sendNotification';
import { approveApplication } from '@/app/_actions/studentApplication';
import toast from 'react-hot-toast';

const RegisterCoursePage: React.FC = () => {
    const [studentID, setStudentID] = useState('');
    const [fullName, setFullName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // This will hold the application status

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [students, setStudents] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedApplication, setSelectedApplication] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [requirements, setRequirements] = useState({
        birthCertificate: false,
        f137: false,
        f138: false,
        goodMoral: false,
        privacyForm: false,
    });
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [modalData, setModalData] = useState<{
        fullName: string;
        email: string;
        missingReqs: string[];
    }>({ fullName: '', email: '', missingReqs: [] });

    const fetchStudents = async () => {
        try {
            const result = await getStudentApplicationTableData();

            if (result.success) {
                setStudents(result.students);
                // Automatically load first application details if available
                if (result.students.length > 0) {
                    handleViewStudent(result.students[0]);
                }
            } else {
                console.error('Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    // Fetch students on component mount
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            await fetchStudents();
            setIsLoading(false);
        }

        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRequirementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRequirements({
            ...requirements,
            [e.target.name]: e.target.checked,
        });
    };

    const handleRegister = () => {
        if (!selectedApplication) {
            toast.error('No application selected.');
            return;
        }

        if (!studentID || !fullName) {
            toast.error('Please select a student first by clicking the View button in the table');
            return;
        }

        // Show approval confirmation modal
        setShowApproveModal(true);
    };

    const handleConfirmApprove = async () => {
        setIsApproving(true);

        try {
            // Simulate registration logic
            const result = await approveApplication(selectedApplication, requirements);
            if (result.success) {
                toast.success('Student application approved successfully!');
                setShowApproveModal(false);
                // refresh list
                setIsLoading(true);
                await fetchStudents();
                setIsLoading(false);
            } else {
                toast.error('Failed to approve application.');
            }
        } catch {
            toast.error('Failed to approve application. An error occurred.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleNotify = async () => {
        // Check if a student is selected
        if (!studentID || !fullName || !email) {
            toast.error('Please select a student first by clicking the View button in the table');
            return;
        }

        // Check if there are missing requirements
        const missingReqs = await getMissingRequirements(requirements);
        if (missingReqs.length === 0) {
            toast('This student has submitted all requirements. No notification needed.');
            return;
        }

        // down -- make this a modal
        setModalData({
            fullName,
            email,
            missingReqs
        });
        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirmModal(false);
        setIsNotificationLoading(true);

        try {
            const result = await sendMissingRequirementsNotification({
                studentId: studentID,
                studentName: modalData.fullName,
                email: modalData.email,
                missingRequirements: modalData.missingReqs,
                notificationMethod: 'email' // For now, we'll just send email
            });

            if (result.success) {
                toast.success(`Email notification sent successfully to ${modalData.email}!\n\n${result.message}`);
            } else {
                toast.error(`Failed to send notification:\n${result.error || result.message}\n\nPlease check your email configuration.`);
            }
        } catch {
            toast.error('An error occurred while sending the notification. Please try again or check the console for details.');
        } finally {
            setIsNotificationLoading(false);
        }
        // up --
    };

    const handleViewStudent = (student: {
        id: string | number;
        applicationNumber: string | null;
        fullName: string;
        gradeLevel: string;
        status: string;
        emailAddress: string;
        createdAt: string;
    }) => {
        // Populate form fields with student data
        setStudentID(student.applicationNumber || '');
        setFullName(student.fullName);
        setGradeLevel(student.gradeLevel);
        setEmail(student.emailAddress);
        setStatus(student.status);

        setSelectedApplication(student);

        // For requirements, we'll set them to false as default since we don't have this data
        // You can modify this logic based on your actual data structure
        setRequirements({
            birthCertificate: false,
            f137: false,
            f138: true,
            goodMoral: false,
            privacyForm: false
        });
    };

    // Confirmation Modal Component for sending email
    const ConfirmationModal: React.FC = () => {
        if (!showConfirmModal) return null;

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                Confirm Email Notification
                            </h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={isNotificationLoading}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                                Send missing requirements notification to <strong>{modalData.fullName}</strong>?
                            </p>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Missing Requirements:</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    {modalData.missingReqs.map((req, index) => (
                                        <li key={index} className="flex items-center">
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Email will be sent to:</strong> {modalData.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isNotificationLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                disabled={isNotificationLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isNotificationLoading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        <span>Send Email</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Confirmation Modal Component for approving application
    const ApproveConfirmationModal: React.FC = () => {
        if (!showApproveModal) return null;

        const requirementsList = [
            { key: 'birthCertificate', label: 'Birth Certificate', checked: requirements.birthCertificate },
            { key: 'f137', label: 'F-137', checked: requirements.f137 },
            { key: 'f138', label: 'F-138', checked: requirements.f138 },
            { key: 'goodMoral', label: 'Good Moral', checked: requirements.goodMoral },
            { key: 'privacyForm', label: 'Privacy Form', checked: requirements.privacyForm },
        ];

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg
                                    className="w-6 h-6 mr-2 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Confirm Application Approval
                            </h3>
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={isApproving}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="mb-6 space-y-4">
                            <p className="text-gray-700">
                                Are you sure you want to approve this student application?
                            </p>

                            {/* Student Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-blue-900 mb-3">Student Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-blue-700 font-medium">Application ID:</span>
                                        <p className="text-blue-900">{studentID || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Full Name:</span>
                                        <p className="text-blue-900">{fullName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Grade Level:</span>
                                        <p className="text-blue-900">{gradeLevel || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 font-medium">Email:</span>
                                        <p className="text-blue-900 truncate">{email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Change */}
                            <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-2">Status Change</h4>
                                <div className="flex items-center justify-center space-x-3">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                        PENDING
                                    </span>
                                    <svg
                                        className="w-5 h-5 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        APPROVED
                                    </span>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Requirements Checklist</h4>
                                <div className="space-y-2">
                                    {requirementsList.map((req) => (
                                        <div key={req.key} className="flex items-center space-x-2">
                                            {req.checked ? (
                                                <svg
                                                    className="w-5 h-5 text-green-600 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 text-red-500 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            )}
                                            <span className={`text-sm ${req.checked ? 'text-gray-700' : 'text-gray-500'}`}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Warning if missing requirements */}
                            {requirementsList.some(req => !req.checked) && (
                                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start space-x-2">
                                    <svg
                                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    <p className="text-sm text-amber-800">
                                        Some requirements are not yet submitted. You can still approve this application.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isApproving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmApprove}
                                disabled={isApproving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isApproving ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Approving...</span>
                                    </>
                                ) : (
                                    <>
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
                                        <span>Approve Application</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
                {/* First Column: Add Student Form + All Students Table */}
                <div className="flex-1 space-y-6 order-2 md:order-1">
                    {/* All Students Table */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 text-black">Pending Applications</h2>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-500">Loading students...</div>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm"><thead>
                                <tr className="border-b border-gray-300 text-black">
                                    <th className="py-2 font-semibold">Application ID</th>
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
                                                <td className="py-2">{student.applicationNumber}</td>
                                                <td className="py-2">{student.createdAt}</td>
                                                <td className="py-2">{student.fullName}</td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        {student.gradeLevel}
                                                    </span>
                                                </td>
                                                <td className="py-2 flex space-x-4">
                                                    <button
                                                        title="View"
                                                        className="text-gray-700 hover:text-gray-900"
                                                        onClick={() => handleViewStudent(student)}
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => toast(`Delete student ${student.applicationNumber}`)}
                                                    >
                                                        <Trash className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* Add/Edit Student Form */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 text-black">
                            Student Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black" htmlFor="studentID">
                                    Application ID
                                </label>
                                <input
                                    id="studentID"
                                    type="text"
                                    placeholder="Enter student ID"
                                    value={studentID}
                                    onChange={(e) => setStudentID(e.target.value)}
                                    readOnly
                                    className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black" htmlFor="fullName">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    readOnly
                                    className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black" htmlFor="gradeLevel">
                                    Grade Level
                                </label>
                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">
                                    {gradeLevel || 'Not selected'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black" htmlFor="status">
                                    Application Status
                                </label>
                                <div className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${status
                                    ? 'bg-yellow-100 text-yellow-800 font-semibold'
                                    : 'bg-gray-100 text-black'
                                    }`}>
                                    {status || 'Not selected'}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-black" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                readOnly
                                className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div className="mb-4">
                            <span className="block text-sm font-medium text-black">Requirements</span>
                            <p className="text-xs text-gray-500 mb-2">
                                Note: Make sure to click &apos;Approve Application&apos; to save the application and requirements.
                            </p>
                            <div className="flex flex-col space-y-1">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="birthCertificate"
                                        checked={requirements.birthCertificate}
                                        onChange={handleRequirementChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm text-black">Birth Certificate</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="f137"
                                        checked={requirements.f137}
                                        onChange={handleRequirementChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm text-black">F-137</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="f138"
                                        checked={requirements.f138}
                                        onChange={handleRequirementChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm text-black">F-138</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="goodMoral"
                                        checked={requirements.goodMoral}
                                        onChange={handleRequirementChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm text-black">Good Moral</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="privacyForm"
                                        checked={requirements.privacyForm}
                                        onChange={handleRequirementChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm text-black">Privacy Form</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleRegister}
                                className="bg-red-800 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-red-900"
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
                                <span>Approve Application</span>
                            </button>
                            <button
                                onClick={handleNotify}
                                disabled={isNotificationLoading}
                                className="bg-yellow-400 text-black px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isNotificationLoading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                        </svg>
                                        <span>Notify Missing Requirements</span>
                                    </>
                                )}
                            </button>
                            {/* <button
                                onClick={handleClearForm}
                                className="bg-gray-500 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-gray-600"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>                                <span>Clear Form</span>
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal />
            <ApproveConfirmationModal />
        </div>
    );
};

export default RegisterCoursePage;