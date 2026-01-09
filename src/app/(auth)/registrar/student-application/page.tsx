'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash, X } from 'lucide-react';
import { getStudentApplicationTableData } from '@/app/_actions/getStudentsList';
import { sendMissingRequirementsNotification } from '@/app/_actions/sendNotification';
import { approveApplication } from '@/app/_actions/studentApplication';
import toast from 'react-hot-toast';
import { FileUpload } from '@/components/registrar/FileUpload';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [requirementFiles, setRequirementFiles] = useState<{
        birthCertificate: File | null;
        f137: File | null;
        f138: File | null;
        goodMoral: File | null;
        privacyForm: File | null;
    }>({
        birthCertificate: null,
        f137: null,
        f138: null,
        goodMoral: null,
        privacyForm: null,
    });
    const [isNotificationLoading, setIsNotificationLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [fileUploadKey, setFileUploadKey] = useState(0); // Key to force remount of file inputs
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

    // Pagination calculations
    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = students.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
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

    const handleFileUpload = (requirementType: string, file: File | null) => {
        setRequirementFiles({
            ...requirementFiles,
            [requirementType]: file,
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
            // Pass files directly to server action - it will handle uploads
            toast.loading('Processing application approval...', { id: 'approval' });
            
            const result = await approveApplication(selectedApplication, requirementFiles);
            
            if (result.success) {
                toast.success('Student application approved successfully!', { id: 'approval' });
                setShowApproveModal(false);
                // refresh list
                setIsLoading(true);
                await fetchStudents();
                setIsLoading(false);
            } else {
                toast.error(`Failed to approve application: ${result.error}`, { id: 'approval' });
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('Failed to approve application. An error occurred.', { id: 'approval' });
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

        // Check if there are missing requirements (files not uploaded)
        const missingReqs: string[] = [];
        if (!requirementFiles.birthCertificate) missingReqs.push('Birth Certificate');
        if (!requirementFiles.f137) missingReqs.push('F-137');
        if (!requirementFiles.f138) missingReqs.push('F-138');
        if (!requirementFiles.goodMoral) missingReqs.push('Good Moral');
        if (!requirementFiles.privacyForm) missingReqs.push('Privacy Form');

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

        // Reset file uploads for the new student
        setRequirementFiles({
            birthCertificate: null,
            f137: null,
            f138: null,
            goodMoral: null,
            privacyForm: null,
        });

        // Force remount of file upload components to clear UI
        setFileUploadKey(prev => prev + 1);
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
                                Send missing requirements notification to <strong>{modalData.fullName}</strong> at <strong>{modalData.email}</strong>?
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
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
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
            { key: 'birthCertificate', label: 'Birth Certificate', checked: !!requirementFiles.birthCertificate },
            { key: 'f137', label: 'F-137', checked: !!requirementFiles.f137 },
            { key: 'f138', label: 'F-138', checked: !!requirementFiles.f138 },
            { key: 'goodMoral', label: 'Good Moral', checked: !!requirementFiles.goodMoral },
            { key: 'privacyForm', label: 'Privacy Form', checked: !!requirementFiles.privacyForm },
        ];

        return (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
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
                                    <div>
                                        <span className="text-blue-700 font-medium">Status:</span>
                                        <p className="text-blue-900 truncate">PENDING &nbsp; -&gt; &nbsp; APPROVED</p>
                                    </div>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-black">Pending Applications</h2>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Items per page:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="text-black px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        {students.length > 0 && (
                            <div className="text-sm text-gray-600 mb-4">
                                Showing {students.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, students.length)} of {students.length} applications
                            </div>
                        )}
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
                                        paginatedStudents.map((student) => (
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
                        {/* Pagination Controls */}
                        {students.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    {/* Desktop pagination info */}
                                    <div className="hidden sm:block text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    {/* Pagination buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>

                                        {/* Page numbers */}
                                        <div className="hidden sm:flex items-center gap-1">
                                            {getPageNumbers().map((page, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                    disabled={page === '...'}
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                        page === currentPage
                                                            ? 'bg-blue-600 text-white'
                                                            : page === '...'
                                                            ? 'cursor-default text-gray-400'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Mobile pagination info */}
                                    <div className="text-sm text-gray-600 sm:hidden">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                </div>
                            </div>
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
                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center cursor-not-allowed">
                                    {gradeLevel || 'Not selected'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-black" htmlFor="status">
                                    Application Status
                                </label>
                                <div className={`w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-not-allowed ${status
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
                            <span className="block text-sm font-medium text-black mb-1">Requirements Documents</span>
                            <p className="text-xs text-gray-500 mb-2">
                                Upload the required documents. Each file should be in PDF, JPG, PNG, or Word format (max 10MB).
                            </p>
                            <div key={fileUploadKey} className="grid grid-cols-2 gap-4 mb-4 space-y-3">
                                <FileUpload
                                    label="Birth Certificate"
                                    requirementType="birthCertificate"
                                    studentId={studentID}
                                    onFileSelect={(file) => handleFileUpload('birthCertificate', file)}
                                    disabled={!studentID}
                                />
                                <FileUpload
                                    label="F-137 (Permanent Record)"
                                    requirementType="f137"
                                    studentId={studentID}
                                    onFileSelect={(file) => handleFileUpload('f137', file)}
                                    disabled={!studentID}
                                />
                                <FileUpload
                                    label="F-138 (Report Card)"
                                    requirementType="f138"
                                    studentId={studentID}
                                    onFileSelect={(file) => handleFileUpload('f138', file)}
                                    disabled={!studentID}
                                />
                                <FileUpload
                                    label="Certificate of Good Moral"
                                    requirementType="goodMoral"
                                    studentId={studentID}
                                    onFileSelect={(file) => handleFileUpload('goodMoral', file)}
                                    disabled={!studentID}
                                />
                                <FileUpload
                                    label="Privacy Consent Form"
                                    requirementType="privacyForm"
                                    studentId={studentID}
                                    onFileSelect={(file) => handleFileUpload('privacyForm', file)}
                                    disabled={!studentID}
                                />
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