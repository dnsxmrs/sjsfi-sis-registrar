'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash, X } from 'lucide-react';
import { getStudentApplicationTableData } from '@/app/_actions/getStudentsList';
import { sendMissingRequirementsNotification } from '@/app/_actions/sendNotification';
import { approveApplication } from '@/app/_actions/studentApplication';
import toast from 'react-hot-toast';
import { FileUpload } from '@/components/registrar/FileUpload';

const RegisterCoursePage: React.FC = () => {
    // Temporary data for Application Details sections (except Personal Data)
    const temporaryHealthHistory = {
        allergies: 'Peanuts, Shellfish, Penicillin',
        medicalConditions: 'Asthma, Mild Allergies',
        healthNotes: 'Regular check-ups required. Emergency contact: Mother'
    };

    const temporaryFamilyBackground = {
        father: {
            familyName: 'Doe',
            firstName: 'John',
            middleName: 'Smith',
            nickname: 'Johnny',
            birthDate: '1980-05-15',
            placeOfBirth: 'Manila',
            age: '43',
            nationality: 'Filipino',
            religion: 'Catholic',
            height: '175 cm',
            weight: '75 kg',
            landline: '(02) 123-4567',
            mobile: '09123456789',
            email: 'john.doe@example.com',
            homeAddress: '123 Main St, Barangay 1',
            city: 'Manila',
            stateProvince: 'Metro Manila',
            zipPostalCode: '1000',
            education: 'Bachelor of Science in Engineering',
            occupation: 'Engineer',
            employer: 'ABC Corporation',
            businessPhone: '(02) 987-6543',
            companyAddress: '456 Business Ave, Makati',
            companyCity: 'Makati',
            annualIncome: '500,000 PHP',
            status: 'Living'
        },
        mother: {
            familyName: 'Doe',
            firstName: 'Jane',
            middleName: 'Garcia',
            nickname: 'Janie',
            birthDate: '1982-08-20',
            placeOfBirth: 'Cebu',
            age: '41',
            nationality: 'Filipino',
            religion: 'Catholic',
            height: '165 cm',
            weight: '60 kg',
            landline: '(02) 234-5678',
            mobile: '09198765432',
            email: 'jane.doe@example.com',
            homeAddress: '123 Main St, Barangay 1',
            city: 'Manila',
            stateProvince: 'Metro Manila',
            zipPostalCode: '1000',
            education: 'Bachelor of Arts in Education',
            occupation: 'Teacher',
            employer: 'XYZ School',
            businessPhone: '(02) 876-5432',
            companyAddress: '789 Education Blvd, Quezon City',
            companyCity: 'Quezon City',
            annualIncome: '300,000 PHP',
            status: 'Living'
        },
        guardian: {
            relation: 'Aunt',
            familyName: 'Smith',
            firstName: 'Mary',
            middleName: 'Johnson',
            nickname: 'Aunt Mary',
            birthDate: '1975-03-10',
            placeOfBirth: 'Davao',
            age: '48',
            nationality: 'Filipino',
            religion: 'Catholic',
            height: '170 cm',
            weight: '65 kg',
            landline: '(02) 345-6789',
            mobile: '09234567890',
            email: 'mary.smith@example.com',
            homeAddress: '456 Guardian St, Barangay 2',
            city: 'Manila',
            stateProvince: 'Metro Manila',
            zipPostalCode: '1001',
            education: 'Associate Degree in Nursing',
            occupation: 'Nurse',
            employer: 'City Hospital',
            businessPhone: '(02) 765-4321',
            companyAddress: '101 Health Rd, Pasig',
            companyCity: 'Pasig',
            annualIncome: '400,000 PHP',
            status: 'Living'
        },
        siblings: [
            {
                familyName: 'Doe',
                firstName: 'Michael',
                middleName: 'Smith',
                birthDate: '2005-01-15',
                age: '18',
                gradeOccupation: 'Grade 12',
                schoolEmployer: 'St. Joseph High School'
            },
            {
                familyName: 'Doe',
                firstName: 'Sarah',
                middleName: 'Garcia',
                birthDate: '2008-06-22',
                age: '15',
                gradeOccupation: 'Grade 9',
                schoolEmployer: 'Mary Immaculate Academy'
            }
        ]
    };

    const temporaryMedicalHistory = {
        academicYear: '2024-2025',
        admissionGrade: 'Grade 7',
        familyName: 'Doe',
        firstName: 'Juan',
        middleName: 'Carlos',
        nickname: 'JC',
        birthDate: '2010-04-15',
        placeOfBirth: 'Manila',
        age: '13',
        height: '150 cm',
        weight: '45 kg',
        sex: 'Male',
        parentGuardianName: 'Jane Doe',
        landlineNumber: '(02) 123-4567',
        mobileNumber: '09123456789',
        homeAddress: '123 Main St, Barangay 1, Manila',
        city: 'Manila',
        stateProvince: 'Metro Manila',
        zipPostalCode: '1000',
    surgery: 'Not provided',
    herbalDiseases: 'Not provided',
    allergiesSpecify: 'Peanuts, Shellfish',
    otherIllnesses: 'Not provided',
        currentMedication: 'None',
        medicalHistoryChecklist: [], // Array of checked items (empty for now)
        immunizationRecord: [], // Array of checked immunizations (empty for now)
        firstAidPermission: false,
        certificationChecked: false
    };

    const temporaryAgreement = {
        parentGuardianName: 'Jane Doe',
        parentGuardianRelation: 'Mother'
    };

    const temporaryEducationalBackground = {
        lastGrade: 'Grade 6',
        lastSchool: 'St. Mary Elementary School',
        lastSchoolAddress: '456 Education St, Manila',
        inclusiveYears: '2019 - 2023',
        honors: 'Valedictorian, Math Award',
        attendedSummerYears: '2020 - 2023'
    };

    const temporaryTransfereeDetails = {
        transferReason: 'Family relocation',
        previousSchool: 'Old School Name',
        previousSchoolAddress: 'Old School Address',
        previousSchoolGrade: 'Grade 6',
        presentSchool: 'St. Joseph School of Fairview',
        presentSchoolAddress: 'Fairview, Quezon City',
        presentSchoolGrade: 'Grade 7',
        disciplinaryActions: 'None'
    };

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

    // Accordion state for view-only detailed sections
    const [openSections, setOpenSections] = useState<string[]>([]);

    const toggleSection = (key: string) => {
        setOpenSections((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
    }; 

    // Transferee section toggle: in production this should be `selectedApplication?.isTransferee`
    // For now it's ON to show the section (see comment below where it's rendered).
    const showTransfereeSection = true;

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
            <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8">
                {/* First Column: Add Student Form + All Students Table */}
                <div className="flex-1 space-y-6 order-2 md:order-1">
                    {/* All Students Table */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                            {/* Header Section: Now wraps on mobile */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                <h2 className="text-lg font-semibold text-black">Pending Applications</h2>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 shrink-0">Items per page:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="text-black px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                                /* RESPONSIVE WRAPPER: This prevents the table from breaking the layout */
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-gray-300 text-black">
                                                    <th className="py-3 px-2 font-semibold">Application ID</th>
                                                    <th className="py-3 px-2 font-semibold">Date & Time</th>
                                                    <th className="py-3 px-2 font-semibold">Full Name</th>
                                                    <th className="py-3 px-2 font-semibold">Grade Level</th>
                                                    <th className="py-3 px-2 font-semibold text-right sm:text-left">Actions</th>
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
                                                        <tr key={student.id} className="border-b border-gray-200 text-black hover:bg-gray-50 transition-colors">
                                                            <td className="py-3 px-2">{student.applicationNumber}</td>
                                                            <td className="py-3 px-2">{student.createdAt}</td>
                                                            <td className="py-3 px-2 font-medium">{student.fullName}</td>
                                                            <td className="py-3 px-2">
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                    {student.gradeLevel}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <div className="flex items-center space-x-4 justify-end sm:justify-start">
                                                                    <button
                                                                        title="View"
                                                                        className="text-gray-700 hover:text-blue-600 transition-colors"
                                                                        onClick={() => handleViewStudent(student)}
                                                                    >
                                                                        <Eye className="h-5 w-5" />
                                                                    </button>
                                                                    <button
                                                                        title="Delete"
                                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                                        onClick={() => toast(`Delete student ${student.applicationNumber}`)}
                                                                    >
                                                                        <Trash className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {students.length > 0 && (
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600 order-2 sm:order-1">
                                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                                        </div>

                                        <div className="flex items-center gap-2 order-1 sm:order-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <span className="hidden xs:inline">Previous</span>
                                            </button>

                                            <div className="hidden md:flex items-center gap-1">
                                                {getPageNumbers().map((page, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                        disabled={page === '...'}
                                                        className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
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
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <span className="hidden xs:inline">Next</span>
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
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
                        {/* Collapsible, view-only accordion showing the full application details (non-editable) */}
                        <div className="mb-4 text-black">
                            <h3 className="text-base font-semibold mb-3 mt-7">Application Details</h3>

                            {/* Accordion controls */}
                            <div className="space-y-2">
                                {/* Personal Data */}
                                <div className="border border-gray-300 rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                        onClick={() => toggleSection('personalData')}
                                        type="button"
                                    >
                                        <span className="font-semibold text-gray-800">Personal Data</span>
                                        <span className="text-gray-400 text-lg">{openSections.includes('personalData') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('personalData') && (
                                        <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
                                            {selectedApplication ? (
                                                <div className="space-y-4">
                                                    {/* Top Row: Academic Year and Admission to Grade/Year */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Academic Year</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.academicYear || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Admission to Grade/Year</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.admissionGradeYear || 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Names Row */}
                                                    <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Family Name</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.familyName || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">First Name</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.firstName || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Middle Name</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.middleName || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Nickname</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.nickname || 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Birth, Personal Details, Siblings and Sex */}
                                                    <div className="grid md:grid-cols-6 grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Birth Date</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.birthDate || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Place of Birth</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.placeOfBirth || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Age</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.age || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Birth Order</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.birthOrder || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Number of Siblings</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.numberOfSiblings || 'N/A'}</div>
                                                        </div>
                                                        <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col justify-center">
                                                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Sex</h4>
                                                            <div className="flex flex-row gap-3 flex-wrap justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedApplication.sex === 'Male' || false} 
                                                                        disabled 
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <label className="text-xs font-medium text-black">Male</label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedApplication.sex === 'Female' || false} 
                                                                        disabled 
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <label className="text-xs font-medium text-black">Female</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Physical Characteristics and Status */}
                                                    <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Height</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.height || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Weight</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.weight || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Blood Type</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.bloodType || 'N/A'}</div>
                                                        </div>
                                                        <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col justify-center">
                                                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Status</h4>
                                                            <div className="flex flex-row gap-3 flex-wrap justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedApplication.legitimate || false} 
                                                                        disabled 
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <label className="text-xs font-medium text-black">Legitimate</label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedApplication.biological || false} 
                                                                        disabled 
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <label className="text-xs font-medium text-black">Biological</label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedApplication.adopted || false} 
                                                                        disabled 
                                                                        className="w-4 h-4"
                                                                    />
                                                                    <label className="text-xs font-medium text-black">Adopted</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Contact Information */}
                                                    <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Landline Number</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.landlineNumber || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Mobile Number</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.mobileNumber || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">E-mail Address</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.emailAddress || 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Addresses */}
                                                    <div className="space-y-4 pt-2">
                                                        <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                                            <h4 className="font-semibold text-gray-800 mb-3">Home Address</h4>
                                                            <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">Home Address</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.homeAddress || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">City</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.homeCity || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">State/Province</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.homeStateProvince || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">Zip/Postal Code</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.homeZipPostalCode || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                                            <h4 className="font-semibold text-gray-800 mb-3">Provincial Address</h4>
                                                            <div className="grid md:grid-cols-4 grid-cols-1 gap-3">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">Provincial Address</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.provincialAddress || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">City</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.provincialCity || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">State/Province</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.provincialStateProvince || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1 text-black">Zip/Postal Code</label>
                                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.provincialZipPostalCode || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Skills and Interests */}
                                                    <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Talents/Special Skills</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.talents || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Hobbies and Interests</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.hobbies || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Languages/Dialect spoken at home</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication.languages || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">No application selected. Click View in the table to load details.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Health History */}
                                <div className="border border-gray-300 rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                        onClick={() => toggleSection('healthHistory')}
                                        type="button"
                                    >
                                        <span className="font-semibold text-gray-800">Health History</span>
                                        <span className="text-gray-400 text-lg">{openSections.includes('healthHistory') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('healthHistory') && (
                                        <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
                                            <div className="mt-1 grid md:grid-cols-2 grid-cols-1 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-black">Childhood Diseases</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.childhoodDiseases?.trim() ? selectedApplication.childhoodDiseases : 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-black">Allergies</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.allergies?.trim() ? selectedApplication.allergies : temporaryHealthHistory.allergies}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-black">Medical Conditions</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.medicalConditions?.trim() ? selectedApplication.medicalConditions : temporaryHealthHistory.medicalConditions}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-black">Immunizations</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.immunizations?.trim() ? selectedApplication.immunizations : 'N/A'}</div>
                                                </div>
                                                <div className="md:col-span-2 col-span-1">
                                                    <label className="block text-sm font-medium mb-1 text-black">Notes</label>
                                                    <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.healthNotes?.trim() ? selectedApplication.healthNotes : temporaryHealthHistory.healthNotes}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Family Background - Father, Mother, Guardian, and Siblings */}
                                    <div className="border border-gray-300 rounded-lg bg-white">
                                        <button
                                            className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                            onClick={() => toggleSection('familyBackground')}
                                            type="button"
                                        >
                                            <span className="font-semibold text-gray-800">Family Background</span>
                                            <span className="text-gray-400 text-lg">{openSections.includes('familyBackground') ? '−' : '+'}</span>
                                        </button>
                                        {openSections.includes('familyBackground') && (
                                            <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700 space-y-4">
                                                {['Father', 'Mother', 'Guardian'].map((role) => {
                                                    const key = role.toLowerCase() as 'father' | 'mother' | 'guardian';
                                                    return (
                                                        <div key={role} className="border border-gray-300 rounded-lg bg-white">
                                                            <button
                                                                className="w-full text-left px-3 py-2.5 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                                                onClick={() => toggleSection(key)}
                                                                type="button"
                                                            >
                                                                <span className="font-semibold text-gray-700">{role}</span>
                                                                <span className="text-gray-400 text-base">{openSections.includes(key) ? '−' : '+'}</span>
                                                            </button>
                                                            {openSections.includes(key) && (
                                                                <div className="px-3 py-3 border-t border-gray-200">
                                                                    {role === 'Guardian' && (
                                                                        <div className="mb-3 text-sm text-gray-700">Relation to Applicant: {selectedApplication?.guardianRelation || 'N/A'}</div>
                                                                    )}

                                                                    {/* Main Grid - Stacked on mobile (cols-1), 4 cols on desktop */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-700">
                                                                        {/* Names */}
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-1 text-black">Family Name</label>
                                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}FamilyName`] || temporaryFamilyBackground[key]?.familyName || 'N/A'}</div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-1 text-black">First Name</label>
                                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}FirstName`] || temporaryFamilyBackground[key]?.firstName || 'N/A'}</div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-1 text-black">Middle Name</label>
                                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}MiddleName`] || temporaryFamilyBackground[key]?.middleName || 'N/A'}</div>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-1 text-black">Nickname</label>
                                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Nickname`] || temporaryFamilyBackground[key]?.nickname || 'N/A'}</div>
                                                                        </div>

                                                                        {/* Birth & Location - 1 col mobile, 5 cols desktop */}
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 col-span-1 md:col-span-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Birth Date</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}BirthDate`] || temporaryFamilyBackground[key]?.birthDate || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Place of Birth</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}PlaceOfBirth`] || temporaryFamilyBackground[key]?.placeOfBirth || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Age</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Age`] || temporaryFamilyBackground[key]?.age || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Nationality</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Nationality`] || temporaryFamilyBackground[key]?.nationality || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Religion</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Religion`] || temporaryFamilyBackground[key]?.religion || 'N/A'}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Contact Info - 1 col mobile, 3 cols desktop */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-1 md:col-span-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Landline Number</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Landline`] || temporaryFamilyBackground[key]?.landline || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Mobile Number</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Mobile`] || temporaryFamilyBackground[key]?.mobile || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">E-mail Address</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Email`] || temporaryFamilyBackground[key]?.email || 'N/A'}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Home Address - 1 col mobile, 4 cols desktop */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 col-span-1 md:col-span-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Home Address</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}HomeAddress`] || temporaryFamilyBackground[key]?.homeAddress || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">City</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}City`] || temporaryFamilyBackground[key]?.city || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">State/ Province</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}StateProvince`] || temporaryFamilyBackground[key]?.stateProvince || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Zip/ Postal Code</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}ZipPostalCode`] || temporaryFamilyBackground[key]?.zipPostalCode || 'N/A'}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Education & Occupation */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 col-span-1 md:col-span-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Educational Attainment</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Education`] || temporaryFamilyBackground[key]?.education || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Occupation</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Occupation`] || temporaryFamilyBackground[key]?.occupation || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Employer/ Company</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}Employer`] || temporaryFamilyBackground[key]?.employer || 'N/A'}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Company Address */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 col-span-1 md:col-span-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Company Address</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}CompanyAddress`] || temporaryFamilyBackground[key]?.companyAddress || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Business Tel.</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}BusinessPhone`] || temporaryFamilyBackground[key]?.businessPhone || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">City</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}CompanyCity`] || temporaryFamilyBackground[key]?.companyCity || 'N/A'}</div>
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium mb-1 text-black">Annual Income</label>
                                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`${key}AnnualIncome`] || temporaryFamilyBackground[key]?.annualIncome || 'N/A'}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Status of Parent */}
                                                                        <div className="col-span-1 md:col-span-4 mt-2">
                                                                            <label className="block text-sm font-medium mb-1 text-black">Status of Parent</label>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                                                                                    {[
                                                                                    'Married', 
                                                                                    'Widowed',
                                                                                    'Single Parent',
                                                                                    'Widowed, Remmaried',
                                                                                    'Separated',
                                                                                    'Other: ________',
                                                                                ].map((item, index) => (
                                                                                    <div key={index} className="flex items-center space-x-2">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            disabled
                                                                                            checked={false}
                                                                                            className="w-4 h-4 cursor-not-allowed"
                                                                                        />
                                                                                        <span>{item}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                
                                                {/* Siblings */}
                                                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                                    <h4 className="font-semibold text-gray-800 mb-3">Sibling Details</h4>
                                                    <div className="text-sm text-gray-700">
                                                        {temporaryFamilyBackground.siblings.map((sibling, index) => (
                                                            <div key={index} className="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                                <div className="mb-3 font-medium text-black">Sibling #{index + 1}</div>
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">Family Name</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}FamilyName`]?.trim() ? selectedApplication[`sibling${index + 1}FamilyName`] : sibling.familyName}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">First Name</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}FirstName`]?.trim() ? selectedApplication[`sibling${index + 1}FirstName`] : sibling.firstName}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">Middle Name</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}MiddleName`]?.trim() ? selectedApplication[`sibling${index + 1}MiddleName`] : sibling.middleName}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">Birth Date</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}BirthDate`]?.trim() ? selectedApplication[`sibling${index + 1}BirthDate`] : sibling.birthDate}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">Age</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}Age`]?.trim() ? selectedApplication[`sibling${index + 1}Age`] : sibling.age}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium mb-1 text-black">Grade/Occupation</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}GradeOccupation`]?.trim() ? selectedApplication[`sibling${index + 1}GradeOccupation`] : sibling.gradeOccupation}</div>
                                                                    </div>
                                                                    <div className="col-span-1 md:col-span-2">
                                                                        <label className="block text-sm font-medium mb-1 text-black">School/Employer</label>
                                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">{selectedApplication?.[`sibling${index + 1}SchoolEmployer`]?.trim() ? selectedApplication[`sibling${index + 1}SchoolEmployer`] : sibling.schoolEmployer}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                {/* Educational Background */}
                                    <div className="border border-gray-300 rounded-lg bg-white">
                                        <button
                                            className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                            onClick={() => toggleSection('education')}
                                            type="button"
                                        >
                                            <span className="font-semibold text-gray-800">Educational Background</span>
                                            <span className="text-gray-400 text-lg">{openSections.includes('education') ? '−' : '+'}</span>
                                        </button>
                                        {openSections.includes('education') && (
                                            <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
                                                <div className="text-sm font-medium text-gray-800">School #1:</div>
                                                
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">
                                                            {selectedApplication?.lastGrade || temporaryEducationalBackground.lastGrade || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Name of School</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">
                                                            {selectedApplication?.lastSchool || temporaryEducationalBackground.lastSchool || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">School Address</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">
                                                            {selectedApplication?.lastSchoolAddress || temporaryEducationalBackground.lastSchoolAddress || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Inclusive Years</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">
                                                            {selectedApplication?.inclusiveYears || temporaryEducationalBackground.inclusiveYears || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Honors / Awards Received</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center mt-1 min-h-[38px]">
                                                            {selectedApplication?.honors || temporaryEducationalBackground.honors || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Attended Summer Classes A.Y.</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center mt-1 min-h-[38px]">
                                                            {selectedApplication?.attendedSummerYears || temporaryEducationalBackground.attendedSummerYears || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                {/* Medical History Questionnaire & Immunization */}
                                    <div className="border border-gray-300 rounded-lg bg-white">
                                        <button
                                            className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                            onClick={() => toggleSection('medical')}
                                            type="button"
                                        >
                                            <span className="font-semibold text-gray-800">Medical History / Immunization</span>
                                            <span className="text-gray-400 text-lg">{openSections.includes('medical') ? '−' : '+'}</span>
                                        </button>
                                        
                                        {openSections.includes('medical') && (
                                            <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
                                                
                                                {/* Row 1: Academic Year and Admission */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Academic Year</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.academicYear?.trim() ? selectedApplication.academicYear : temporaryMedicalHistory.academicYear || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Admission to Grade/ Year</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.admissionGrade?.trim() ? selectedApplication.admissionGrade : temporaryMedicalHistory.admissionGrade || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {/* Row 2: Family, First, Middle, Nickname */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Family Name</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalFamilyName?.trim() ? selectedApplication.medicalFamilyName : temporaryMedicalHistory.familyName || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">First Name</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalFirstName?.trim() ? selectedApplication.medicalFirstName : temporaryMedicalHistory.firstName || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Middle Name</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalMiddleName?.trim() ? selectedApplication.medicalMiddleName : temporaryMedicalHistory.middleName || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Nickname</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalNickname?.trim() ? selectedApplication.medicalNickname : temporaryMedicalHistory.nickname || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {/* Row 3: Birthdate, Place, Age, Height, Weight, Sex */}
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                                                    <div className="col-span-2 md:col-span-1">
                                                        <label className="block text-sm font-medium mb-1 text-black">Birth Date</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalBirthDate?.trim() ? selectedApplication.medicalBirthDate : temporaryMedicalHistory.birthDate || 'N/A'}</div>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-1">
                                                        <label className="block text-sm font-medium mb-1 text-black">Place of Birth</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalPlaceOfBirth?.trim() ? selectedApplication.medicalPlaceOfBirth : temporaryMedicalHistory.placeOfBirth || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Age</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalAge?.trim() ? selectedApplication.medicalAge : temporaryMedicalHistory.age || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Height</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalHeight?.trim() ? selectedApplication.medicalHeight : temporaryMedicalHistory.height || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Weight</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalWeight?.trim() ? selectedApplication.medicalWeight : temporaryMedicalHistory.weight || 'N/A'}</div>
                                                    </div>
                                                    <div className="border border-gray-300 rounded-lg p-3 bg-white flex flex-col justify-center">
                                                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Sex</h4>
                                                        <div className="flex flex-row gap-3 flex-wrap justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedApplication.sex === 'Male' || false} 
                                                                    disabled 
                                                                    className="w-4 h-4"
                                                                />
                                                                <label className="text-xs font-medium text-black">Male</label>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedApplication.sex === 'Female' || false} 
                                                                    disabled 
                                                                    className="w-4 h-4"
                                                                />
                                                                <label className="text-xs font-medium text-black">Female</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 4: Parent Name, Landline, Mobile */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Parent/ Guardian Name</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalParentGuardianName?.trim() ? selectedApplication.medicalParentGuardianName : temporaryMedicalHistory.parentGuardianName || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Landline Number</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalLandlineNumber?.trim() ? selectedApplication.medicalLandlineNumber : temporaryMedicalHistory.landlineNumber || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Mobile Number</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalMobileNumber?.trim() ? selectedApplication.medicalMobileNumber : temporaryMedicalHistory.mobileNumber || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {/* Row 5: Home, City, State, Zip */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                                    <div className="md:col-span-1">
                                                        <label className="block text-sm font-medium mb-1 text-black">Home Address</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalHomeAddress?.trim() ? selectedApplication.medicalHomeAddress : temporaryMedicalHistory.homeAddress || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">City</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalCity?.trim() ? selectedApplication.medicalCity : temporaryMedicalHistory.city || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">State/ Province</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalStateProvince?.trim() ? selectedApplication.medicalStateProvince : temporaryMedicalHistory.stateProvince || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Zip/ Postal Code</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">{selectedApplication?.medicalZipPostalCode?.trim() ? selectedApplication.medicalZipPostalCode : temporaryMedicalHistory.zipPostalCode || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {/* Medical History Checklist - Numerically Aligned */}
                                                <div className="mb-4">
                                                    <div className="text-xs text-gray-500 font-medium mb-2">Medical History:</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                                                        {[
                                                            { num: '1.', text: 'Epilepsy for the 6 months' },
                                                            { num: '2.', text: 'Head injuries leading to loss of consciousness for the last 6 months' },
                                                            { num: '3.', text: 'Recurrent headaches/ migraines' },
                                                            { num: '4.', text: 'Diseases Nervous System (Multiple sclerosis)' },
                                                            { num: '5.', text: 'Surgery' },
                                                            { num: '6.', text: 'Visual Disorders (Blindness on one eye, blurred vision, glaucoma)' },
                                                            { num: '7.', text: 'Ear infections' },
                                                            { num: '8.', text: 'Vertigo or Dizziness' },
                                                            { num: '9.', text: 'Heart Diseases' },
                                                            { num: '10.', text: 'Arthritis, Bronchitis, TB or Pneumonia' },
                                                            { num: '11.', text: 'Ulcer' },
                                                            { num: '12.', text: 'Liver Diseases or hepatitis' },
                                                            { num: '13.', text: 'Problems with joints, bones or recurrent dislocation' },
                                                            { num: '14.', text: 'Allergic skin rashes' },
                                                            { num: '15.', text: 'Mental Illness' },
                                                            { num: '16.', text: 'Allergies' },
                                                        ].map((item, index) => (
                                                            <div key={index} className="flex items-start space-x-3 py-1">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 mt-0.5 cursor-not-allowed flex-shrink-0"
                                                                />
                                                                <div className="flex">
                                                                    <span className="w-6 font-medium flex-shrink-0">{item.num}</span>
                                                                    <span>{item.text}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Additional Questions */}
                                                <div className="grid grid-cols-1 gap-4 mb-6">
                                                    {/* (Mapping through your specify fields here...) */}
                                                    {['If you had surgery, please specify', 'If you have heart diseases, please specify what:', 'For no. 10, please specify which:', 'If you have allergies, pleae specify what:', 'Do you have any medication that youre currently taking?'].map((label, idx) => (
                                                    <div key={idx}>
                                                        <label className="block text-sm font-medium mb-1 text-black">{label}</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center min-h-[38px]">N/A</div>
                                                    </div>
                                                    ))}
                                                </div>

                                                {/* Immunization Record */}
                                                <div className="mt-6 pt-4 border-t">
                                                    <div className="text-xs text-gray-500 font-medium mb-3">Immunization Record:</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>Tetanus</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>DPT</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>HepaB</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>Polio</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>Measles</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input type="checkbox" disabled className="w-4 h-4" />
                                                            <span>BCG</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Certification */}
                                                <div className="mt-4 pt-4 border-t text-sm text-gray-700">
                                                    <div className="flex items-start space-x-3">
                                                        <input type="checkbox" disabled className="w-4 h-4 mt-0.5" />
                                                        <span>I hereby certify that all the information applied therein are complete and accurate</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                {/* Agreement Section */}
                                    <div className="border border-gray-300 rounded-lg bg-white">
                                        <button
                                            className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                            onClick={() => toggleSection('agreement')}
                                            type="button"
                                        >
                                            <span className="font-semibold text-gray-800">Agreement</span>
                                            <span className="text-gray-400 text-lg">{openSections.includes('agreement') ? '−' : '+'}</span>
                                        </button>
                                        
                                        {openSections.includes('agreement') && (
                                            <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700">
                                                {selectedApplication?.agreementText ? (
                                                    <div className="text-sm text-gray-700 text-justify whitespace-pre-line">
                                                        {selectedApplication.agreementText}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-700 text-justify leading-relaxed">
                                                        I wish to enroll my child <strong className="font-bold text-black">{selectedApplication?.fullName || 'Student Full Name'}</strong> to your school, St. Joseph School of Fairview, and upon compliance with the entrance/re-admission requirements, I understand that he/she must:
                                                        <br /><br />
                                                        <ul className="space-y-2 list-none">
                                                            <li>1. Comply with all the policies and procedures such as attendance and punctuality, scholastics/academic performance set by the school;</li>
                                                            <li>2. Attend and support all the activities duly organized by the school both in co-curricular and extra-curricular, particularly in the institutional activities such as School Orientation Day, Christmas party/Liturgical Activities, Educational Tour, Foundation Day, Retreat and Recollections, Community Outreach Program and JS Prom, etc.;</li>
                                                            <li>3. Abide by the behavioural standards and rules of discipline as specified in the student&apos;s handbook, e.g. wearing of prescribed uniform, behaviour within and out of the campus, etc.;</li>
                                                            <li>4. Conform to all rules and regulation set forth by the institution (including the increase in tuition/miscellaneous/other fees) now enforced or may be promulgated by the school from time to time.</li>
                                                        </ul>
                                                        <br />
                                                        By affixing my name, <strong className="font-bold text-black">{selectedApplication?.parentGuardianName || temporaryAgreement.parentGuardianName || 'N/A'}</strong>, I hereby waive my right in any form and commit myself towards the realization of the vision-mission of the institution, particularly the rules and regulation as stipulated in the Student&apos;s Handbook.
                                                    </div>
                                                )}

                                                {/* Responsive Grid: Stacks on mobile (1 col), side-by-side on tablet+ (2 cols) */}
                                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Parent/ Guardian Name</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">
                                                            {selectedApplication?.parentGuardianName || temporaryAgreement.parentGuardianName || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-black">Relationship to the Child</label>
                                                        <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 flex items-center">
                                                            {selectedApplication?.parentGuardianRelation || selectedApplication?.guardianRelation || temporaryAgreement.parentGuardianRelation || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                {/* Transferee-specific section */}
                                    {showTransfereeSection && (
                                        <div className="border border-gray-300 rounded-lg bg-white">
                                            <button
                                                className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-t-lg"
                                                onClick={() => toggleSection('transferee')}
                                                type="button"
                                            >
                                                <span className="font-semibold text-gray-800">Transferee Details</span>
                                                <span className="text-gray-400 text-lg">{openSections.includes('transferee') ? '−' : '+'}</span>
                                            </button>
                                            
                                            {openSections.includes('transferee') && (
                                                <div className="px-4 py-4 border-t border-gray-200 text-sm text-gray-700 space-y-6">
                                                    
                                                    {/* Previous School Group */}
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Previous School</div>
                                                        {/* Responsive Grid: 1 col on mobile, 2 on small tablet, 3 on desktop */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1 text-black">School Name</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.previousSchool?.trim() ? selectedApplication.previousSchool : temporaryTransfereeDetails.previousSchool || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1 text-black">School Address</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.previousSchoolAddress?.trim() ? selectedApplication.previousSchoolAddress : temporaryTransfereeDetails.previousSchoolAddress || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <div className="sm:col-span-2 lg:col-span-1">
                                                                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.previousSchoolGrade?.trim() ? selectedApplication.previousSchoolGrade : temporaryTransfereeDetails.previousSchoolGrade || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <hr className="border-gray-100" />

                                                    {/* Present School Group */}
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Present School</div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1 text-black">School Name</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.presentSchool?.trim() ? selectedApplication.presentSchool : temporaryTransfereeDetails.presentSchool || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1 text-black">School Address</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.presentSchoolAddress?.trim() ? selectedApplication.presentSchoolAddress : temporaryTransfereeDetails.presentSchoolAddress || 'N/A'}
                                                                </div>
                                                            </div>
                                                            <div className="sm:col-span-2 lg:col-span-1">
                                                                <label className="block text-sm font-medium mb-1 text-black">Gr./ Yr. Level</label>
                                                                <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 min-h-[38px] flex items-center">
                                                                    {selectedApplication?.presentSchoolGrade?.trim() ? selectedApplication.presentSchoolGrade : temporaryTransfereeDetails.presentSchoolGrade || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Detailed Questions */}
                                                    <div className="space-y-4 pt-2">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black">Reason for Transferring</label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-justify">
                                                                {selectedApplication?.transferReason?.trim() ? selectedApplication.transferReason : temporaryTransfereeDetails.transferReason || 'N/A'}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-1 text-black leading-snug">
                                                                Has the applicant been subjected to any disciplinary actions in school? If yes, please describe the action and the sanctions
                                                            </label>
                                                            <div className="w-full text-black border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-justify">
                                                                {selectedApplication?.disciplinaryActions?.trim() ? selectedApplication.disciplinaryActions : temporaryTransfereeDetails.disciplinaryActions || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Requirement Upload Section */}
                        <div className="mb-4">
                            <span className="block text-m font-medium text-black mb-1 mt-7">Requirements Documents</span>
                            <p className="text-s text-gray-500 mb-5">
                                Upload the required documents. Each file should be in PDF, JPG, PNG, or Word format (max 10MB).
                            </p>
                            
                            {/* Updated Grid: 1 column on mobile, 2 columns on small screens and up */}
                            <div key={fileUploadKey} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

                        {/* Action Buttons: Vertical stack on mobile, horizontal on desktop */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
                            <button
                                onClick={handleRegister}
                                className="w-full sm:w-auto bg-red-800 text-white px-4 py-2 rounded text-sm flex items-center justify-center space-x-2 hover:bg-red-900 transition-colors"
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
                                className="w-full sm:w-auto bg-yellow-400 text-black px-4 py-2 rounded text-sm flex items-center justify-center space-x-2 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
