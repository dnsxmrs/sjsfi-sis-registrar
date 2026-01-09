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
                        {/* Collapsible, view-only accordion showing the full application details (non-editable) */}
                        <div className="mb-4 text-black">
                            <h3 className="text-base font-semibold mb-3 mt-7">Application Details</h3>

                            {/* Accordion controls */}
                            <div className="space-y-3">
                                {/* Personal Data */}
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('personalData')}
                                        type="button"
                                    >
                                        <span className="font-medium">Personal Data</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('personalData') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('personalData') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black">
                                            {selectedApplication ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <div className="text-xs text-gray-500">Application ID</div>
                                                        <div className="text-sm font-medium">{selectedApplication.applicationNumber || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Full Name</div>
                                                        <div className="text-sm font-medium">{selectedApplication.fullName || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Grade Level</div>
                                                        <div className="text-sm">{selectedApplication.gradeLevel || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Email</div>
                                                        <div className="text-sm">{selectedApplication.emailAddress || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Status</div>
                                                        <div className="text-sm">{selectedApplication.status || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500">Applied At</div>
                                                        <div className="text-sm">{selectedApplication.createdAt || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">No application selected. Click View in the table to load details.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Health History */}
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('healthHistory')}
                                        type="button"
                                    >
                                        <span className="font-medium">Health History</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('healthHistory') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('healthHistory') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black">
                                            <div className="mt-1 grid grid-cols-2 gap-3">
                                                <div>
<div className="text-xs text-gray-500">Allergies</div>
<div className="text-sm">{selectedApplication?.allergies?.trim() ? selectedApplication.allergies : temporaryHealthHistory.allergies}</div>
                                                </div>
                                                <div>
<div className="text-xs text-gray-500">Medical Conditions</div>
<div className="text-sm">{selectedApplication?.medicalConditions?.trim() ? selectedApplication.medicalConditions : temporaryHealthHistory.medicalConditions}</div>
                                                </div>
                                                <div className="col-span-2">
<div className="text-xs text-gray-500">Notes</div>
<div className="text-sm">{selectedApplication?.healthNotes?.trim() ? selectedApplication.healthNotes : temporaryHealthHistory.healthNotes}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Family Background - Father, Mother, Guardian, and Siblings */}
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('familyBackground')}
                                        type="button"
                                    >
                                        <span className="font-medium">Family Background</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('familyBackground') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('familyBackground') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black space-y-4">
                                            {['Father', 'Mother', 'Guardian'].map((role) => {
                                                const key = role.toLowerCase() as 'father' | 'mother' | 'guardian';
                                                return (
                                                    <div key={role} className="border rounded bg-gray-50">
                                                        <button
                                                            className="w-full text-left px-3 py-2 flex justify-between items-center"
                                                            onClick={() => toggleSection(key)}
                                                            type="button"
                                                        >
                                                            <span className="font-medium">{role}</span>
                                                            <span className="text-sm text-gray-500">{openSections.includes(key) ? '−' : '+'}</span>
                                                        </button>
                                                        {openSections.includes(key) && (
                                                            <div className="px-3 pb-3 pt-0">
                                                                {role === 'Guardian' && (
                                                                    <div className="mb-3 text-sm text-black">Relation to Applicant: {selectedApplication?.guardianRelation || 'N/A'}</div>
                                                                )}

                                                                <div className="grid grid-cols-4 gap-3 text-sm text-black">
                                                                    {/* Names */}
                                                                    <div>
<div className="text-xs text-gray-500">Family Name:</div>
<div>{selectedApplication?.[`${key}FamilyName`] || temporaryFamilyBackground[key]?.familyName || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">First Name:</div>
<div>{selectedApplication?.[`${key}FirstName`] || temporaryFamilyBackground[key]?.firstName || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Middle Name:</div>
<div>{selectedApplication?.[`${key}MiddleName`] || temporaryFamilyBackground[key]?.middleName || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Nickname:</div>
<div>{selectedApplication?.[`${key}Nickname`] || temporaryFamilyBackground[key]?.nickname || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Birth & Location */}
                                                                    <div>
<div className="text-xs text-gray-500">Birth Date:</div>
<div>{selectedApplication?.[`${key}BirthDate`] || temporaryFamilyBackground[key]?.birthDate || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Place of Birth:</div>
<div>{selectedApplication?.[`${key}PlaceOfBirth`] || temporaryFamilyBackground[key]?.placeOfBirth || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Age:</div>
<div>{selectedApplication?.[`${key}Age`] || temporaryFamilyBackground[key]?.age || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Nationality:</div>
<div>{selectedApplication?.[`${key}Nationality`] || temporaryFamilyBackground[key]?.nationality || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Religion & Physical */}
                                                                    <div>
<div className="text-xs text-gray-500">Religion:</div>
<div>{selectedApplication?.[`${key}Religion`] || temporaryFamilyBackground[key]?.religion || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Height:</div>
<div>{selectedApplication?.[`${key}Height`] || temporaryFamilyBackground[key]?.height || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Weight:</div>
<div>{selectedApplication?.[`${key}Weight`] || temporaryFamilyBackground[key]?.weight || 'N/A'}</div>
                                                                    </div>
                                                                    <div />

                                                                    {/* Contact Info */}
                                                                    <div>
<div className="text-xs text-gray-500">Landline Number:</div>
<div>{selectedApplication?.[`${key}Landline`] || temporaryFamilyBackground[key]?.landline || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Mobile Number:</div>
<div>{selectedApplication?.[`${key}Mobile`] || temporaryFamilyBackground[key]?.mobile || 'N/A'}</div>
                                                                    </div>
                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">E-mail Address:</div>
<div>{selectedApplication?.[`${key}Email`] || temporaryFamilyBackground[key]?.email || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Home Address */}
                                                                    <div className="col-span-3">
<div className="text-xs text-gray-500">Home Address:</div>
<div>{selectedApplication?.[`${key}HomeAddress`] || temporaryFamilyBackground[key]?.homeAddress || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">City:</div>
<div>{selectedApplication?.[`${key}City`] || temporaryFamilyBackground[key]?.city || 'N/A'}</div>
                                                                    </div>

                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">State/ Province:</div>
<div>{selectedApplication?.[`${key}StateProvince`] || temporaryFamilyBackground[key]?.stateProvince || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">Zip/ Postal Code:</div>
<div>{selectedApplication?.[`${key}ZipPostalCode`] || temporaryFamilyBackground[key]?.zipPostalCode || 'N/A'}</div>
                                                                    </div>
                                                                    <div />

                                                                    {/* Education & Occupation */}
                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">Educational Attainment/ Course:</div>
<div>{selectedApplication?.[`${key}Education`] || temporaryFamilyBackground[key]?.education || 'N/A'}</div>
                                                                    </div>
                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">Occupational/ Position Held:</div>
<div>{selectedApplication?.[`${key}Occupation`] || temporaryFamilyBackground[key]?.occupation || 'N/A'}</div>
                                                                    </div>

                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">Employer/ Company:</div>
<div>{selectedApplication?.[`${key}Employer`] || temporaryFamilyBackground[key]?.employer || 'N/A'}</div>
                                                                    </div>
                                                                    <div className="col-span-2">
<div className="text-xs text-gray-500">Business Telephone Number:</div>
<div>{selectedApplication?.[`${key}BusinessPhone`] || temporaryFamilyBackground[key]?.businessPhone || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Company Address */}
                                                                    <div className="col-span-3">
<div className="text-xs text-gray-500">Company Address:</div>
<div>{selectedApplication?.[`${key}CompanyAddress`] || temporaryFamilyBackground[key]?.companyAddress || 'N/A'}</div>
                                                                    </div>
                                                                    <div>
<div className="text-xs text-gray-500">City:</div>
<div>{selectedApplication?.[`${key}CompanyCity`] || temporaryFamilyBackground[key]?.companyCity || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Annual Income */}
                                                                    <div>
<div className="text-xs text-gray-500">Annual Income:</div>
<div>{selectedApplication?.[`${key}AnnualIncome`] || temporaryFamilyBackground[key]?.annualIncome || 'N/A'}</div>
                                                                    </div>

                                                                    {/* Status of Parent */}
                                                                    <div className="col-span-4 mt-2">
                                                                        <div className="text-xs text-gray-500 font-medium">Status of Parent:</div>
<div className="text-sm text-gray-700 mt-1">{selectedApplication?.[`${key}Status`] || temporaryFamilyBackground[key]?.status || 'N/A'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {/* Siblings */}
                                            <div className="border rounded p-3 bg-gray-50">
                                                <h4 className="font-semibold text-black mb-3">Sibling Details</h4>
                                                <div className="text-sm text-black">
                                                    {temporaryFamilyBackground.siblings.map((sibling, index) => (
                                                        <div key={index} className="mb-4">
                                                            <div className="mb-3 text-xs text-gray-500">Sibling #{index + 1}:</div>
                                                            <div className="grid grid-cols-4 gap-3">
                                                                <div>
                                                                    <div className="text-xs text-gray-500">Family Name:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}FamilyName`]?.trim() ? selectedApplication[`sibling${index + 1}FamilyName`] : sibling.familyName}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-500">First Name:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}FirstName`]?.trim() ? selectedApplication[`sibling${index + 1}FirstName`] : sibling.firstName}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-500">Middle Name:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}MiddleName`]?.trim() ? selectedApplication[`sibling${index + 1}MiddleName`] : sibling.middleName}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-500">Birth Date:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}BirthDate`]?.trim() ? selectedApplication[`sibling${index + 1}BirthDate`] : sibling.birthDate}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-500">Age:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}Age`]?.trim() ? selectedApplication[`sibling${index + 1}Age`] : sibling.age}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs text-gray-500">Gr./Yr. Level/Occupation:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}GradeOccupation`]?.trim() ? selectedApplication[`sibling${index + 1}GradeOccupation`] : sibling.gradeOccupation}</div>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <div className="text-xs text-gray-500">School/Employer:</div>
                                                                    <div>{selectedApplication?.[`sibling${index + 1}SchoolEmployer`]?.trim() ? selectedApplication[`sibling${index + 1}SchoolEmployer`] : sibling.schoolEmployer}</div>
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
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('education')}
                                        type="button"
                                    >
                                        <span className="font-medium">Educational Background</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('education') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('education') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black">
                                            <div className="text-sm text-black">School #1:</div>
                                            <div className="mt-2 grid grid-cols-4 gap-3 items-end">
                                                <div>
                                                    <div className="text-xs text-gray-500">Gr./ Yr. Level:</div>
                                                    <div>{selectedApplication?.lastGrade || temporaryEducationalBackground.lastGrade}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Name of School:</div>
                                                    <div>{selectedApplication?.lastSchool || temporaryEducationalBackground.lastSchool}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">School Address:</div>
                                                    <div>{selectedApplication?.lastSchoolAddress || temporaryEducationalBackground.lastSchoolAddress}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Inclusive Years</div>
                                                    <div>{selectedApplication?.inclusiveYears || temporaryEducationalBackground.inclusiveYears}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Honors / Awards Received:</div>
                                                    <div className="mt-1">{selectedApplication?.honors || temporaryEducationalBackground.honors}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Attended Summer Classes A.Y.</div>
                                                    <div className="mt-1">{selectedApplication?.attendedSummerYears || temporaryEducationalBackground.attendedSummerYears}</div>
                                                    <div className="mt-2 flex items-center space-x-4">
                                                        <div className="text-xs text-gray-500">Yes</div>
                                                        <div className="text-xs text-gray-500">No</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Medical History Questionnaire & Immunization */}
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('medical')}
                                        type="button"
                                    >
                                        <span className="font-medium">Medical History / Immunization</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('medical') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('medical') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black">
                                            <div className="grid grid-cols-4 gap-3 mb-4">
                                                <div>
<div className="text-xs text-gray-500">Academic Year:</div>
<div>{selectedApplication?.academicYear?.trim() ? selectedApplication.academicYear : temporaryMedicalHistory.academicYear || 'N/A'}</div>
                                                </div>
                                                <div>
<div className="text-xs text-gray-500">Admission to Grade/ Year:</div>
<div>{selectedApplication?.admissionGrade?.trim() ? selectedApplication.admissionGrade : temporaryMedicalHistory.admissionGrade || 'N/A'}</div>
                                                </div>
                                                <div />
                                                <div />
                                            </div>

                                            <div className="grid grid-cols-4 gap-3 mb-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Family Name:</div>
                                                    <div>{selectedApplication?.medicalFamilyName?.trim() ? selectedApplication.medicalFamilyName : temporaryMedicalHistory.familyName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">First Name:</div>
                                                    <div>{selectedApplication?.medicalFirstName?.trim() ? selectedApplication.medicalFirstName : temporaryMedicalHistory.firstName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Middle Name:</div>
                                                    <div>{selectedApplication?.medicalMiddleName?.trim() ? selectedApplication.medicalMiddleName : temporaryMedicalHistory.middleName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Nickname:</div>
                                                    <div>{selectedApplication?.medicalNickname?.trim() ? selectedApplication.medicalNickname : temporaryMedicalHistory.nickname || 'N/A'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-gray-500">Birth Date:</div>
                                                    <div>{selectedApplication?.medicalBirthDate?.trim() ? selectedApplication.medicalBirthDate : temporaryMedicalHistory.birthDate || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Place of Birth:</div>
                                                    <div>{selectedApplication?.medicalPlaceOfBirth?.trim() ? selectedApplication.medicalPlaceOfBirth : temporaryMedicalHistory.placeOfBirth || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Age:</div>
                                                    <div>{selectedApplication?.medicalAge?.trim() ? selectedApplication.medicalAge : temporaryMedicalHistory.age || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Height:</div>
                                                    <div>{selectedApplication?.medicalHeight?.trim() ? selectedApplication.medicalHeight : temporaryMedicalHistory.height || 'N/A'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-gray-500">Weight:</div>
                                                    <div>{selectedApplication?.medicalWeight?.trim() ? selectedApplication.medicalWeight : temporaryMedicalHistory.weight || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Sex:</div>
                                                    <div>{selectedApplication?.medicalSex?.trim() ? selectedApplication.medicalSex : temporaryMedicalHistory.sex || 'N/A'}</div>
                                                </div>
                                                <div />
                                                <div />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Parent/ Guardian Name:</div>
                                                    <div>{selectedApplication?.medicalParentGuardianName?.trim() ? selectedApplication.medicalParentGuardianName : temporaryMedicalHistory.parentGuardianName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Landline Number:</div>
                                                    <div>{selectedApplication?.medicalLandlineNumber?.trim() ? selectedApplication.medicalLandlineNumber : temporaryMedicalHistory.landlineNumber || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Mobile Number:</div>
                                                    <div>{selectedApplication?.medicalMobileNumber?.trim() ? selectedApplication.medicalMobileNumber : temporaryMedicalHistory.mobileNumber || 'N/A'}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div className="col-span-2">
                                                    <div className="text-xs text-gray-500">Home Address:</div>
                                                    <div>{selectedApplication?.medicalHomeAddress?.trim() ? selectedApplication.medicalHomeAddress : temporaryMedicalHistory.homeAddress || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">City:</div>
                                                    <div>{selectedApplication?.medicalCity?.trim() ? selectedApplication.medicalCity : temporaryMedicalHistory.city || 'N/A'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-gray-500">State/ Province:</div>
                                                    <div>{selectedApplication?.medicalStateProvince?.trim() ? selectedApplication.medicalStateProvince : temporaryMedicalHistory.stateProvince || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Zip/ Postal Code:</div>
                                                    <div>{selectedApplication?.medicalZipPostalCode?.trim() ? selectedApplication.medicalZipPostalCode : temporaryMedicalHistory.zipPostalCode || 'N/A'}</div>
                                                </div>
                                            </div>

                                            {/* Medical History Checklist */}
                                            <div className="mb-4">
                                                <div className="text-xs text-gray-500 font-medium mb-2">Medical History:</div>
                                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
{[
'1. Influenza died in the last 8 months',
'2. Heart murmur leading to loss of consciousness for the last 8 months',
                                                        '3. Recurrent headaches/ migraines',
                                                        '4. Disorders Nervous System (Multiple sclerosis)',
                                                        '5. Digestive problems',
                                                        '6. Visual Disorders (Blindness on one eye, blurred vision, glaucoma)',
                                                        '7. Ear infections',
                                                        '8. Herpes Disorders',
                                                        '9. Arthritis, Bronchitis, TB or Pneumonia',
                                                        '10. Ulcer',
                                                        '11. Joint Disorders or hepatitis',
                                                        '12. Problems with pus/les, boces or recurrent discoloration',
                                                        '13. Allergic skin reaction',
                                                        '14. Mental Illness',
                                                        '15. Allergies'
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

                                            {/* Right side - Additional questions */}
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">If you had surgery, please specify:</div>
                                                    <div>{selectedApplication?.medicalSurgery || temporaryMedicalHistory.surgery || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">If you have herbal diseases, please specify what:</div>
                                                    <div>{selectedApplication?.medicalHerbalDiseases || temporaryMedicalHistory.herbalDiseases || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">For no. 15, please specify which:</div>
                                                    <div>{selectedApplication?.medicalAllergiesSpecify || temporaryMedicalHistory.allergiesSpecify || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">If you have other illnesses, please specify what:</div>
                                                    <div>{selectedApplication?.medicalOtherIllnesses || temporaryMedicalHistory.otherIllnesses || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Do you have any medication that you&apos;re currently taking?</div>
                                                    <div>{selectedApplication?.medicalCurrentMedication || temporaryMedicalHistory.currentMedication || 'N/A'}</div>
                                                </div>
                                            </div>

                                            {/* Immunization Record */}
                                            <div className="mt-6 pt-4 border-t">
                                                <div className="text-xs text-gray-500 font-medium mb-3">Immunization Record:</div>
                                                <div className="text-sm text-gray-700">
                                                    <div className="mb-3">Have you ever had the 16 Poises select all that apply:</div>
                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>Tetanus</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>Polio</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>DPT</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>Measles</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>Hepatit</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled
                                                                    checked={false}
                                                                    className="w-4 h-4 cursor-not-allowed"
                                                                />
                                                                <span>BCG</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="text-xs text-gray-500 mb-2">Do you officer or schoolnurse to give first aid during sick days?</div>
                                                    <div className="mt-1 text-sm text-gray-700 space-x-4">
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                disabled
                                                                checked={false}
                                                                className="w-4 h-4 cursor-not-allowed"
                                                            />
                                                            <span>Yes</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                disabled
                                                                checked={false}
                                                                className="w-4 h-4 cursor-not-allowed"
                                                            />
                                                            <span>No</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Certification */}
                                            <div className="mt-4 pt-4 border-t text-sm text-gray-700">
                                                <div className="flex items-start space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        disabled
                                                        checked={false}
                                                        className="w-4 h-4 cursor-not-allowed mt-0.5"
                                                    />
                                                    <span>I hereby certify that all the information applied therein are complete and accurate</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="border rounded-lg bg-white">
                                    <button
                                        className="w-full text-left px-4 py-3 flex justify-between items-center"
                                        onClick={() => toggleSection('agreement')}
                                        type="button"
                                    >
                                        <span className="font-medium">Agreement</span>
                                        <span className="text-sm text-gray-500">{openSections.includes('agreement') ? '−' : '+'}</span>
                                    </button>
                                    {openSections.includes('agreement') && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-black">
            {selectedApplication?.agreementText ? (
                <div className="text-sm text-black">{selectedApplication.agreementText}</div>
            ) : (
                <div className="text-sm text-black">
                    I wish to enroll my child {selectedApplication?.fullName || 'Student Full Name'} to your school, St. Joseph School of Fairview, and upon compliance with the entrance/re-admission requirements, I understand that he/she must:
                    <br /><br />
                    1. Comply with all the policies and procedures such as attendance and punctuality, scholastics/academic performance set by the school;
                    <br />
                    2. Attend and support all the activities duly organized by the school both in co-curricular and extra-curricular, particularly in the institutional activities such as School Orientation Day, Christmas party/Liturgical Activities, Educational Tour, Foundation Day, Retreat and Recollections, Community Outreach Program and JS Prom, etc.;
                    <br />
                    3. Abide by the behavioural standards and rules of discipline as specified in the student's handbook, e.g. wearing of prescribed uniform, behaviour within and out of the campus, etc.;
                    <br />
                    4. Conform to all rules and regulation set forth by the institution (including the increase in tuition/miscellaneous/other fees) now enforced or may be promulgated by the school from time to time.
                    <br /><br />
                    By affixing my name, {selectedApplication?.parentGuardianName || temporaryAgreement.parentGuardianName || 'N/A'}, I hereby waive my right in any form and commit myself towards the realization of the vision-mission of the institution, particularly the rules and regulation as stipulated in the Student's Handbook.
                </div>
            )}

                                            <div className="mt-6 grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500">Parent/ Guardian Name:</div>
                                                    <div className="mt-1 text-sm text-black">{selectedApplication?.parentGuardianName || temporaryAgreement.parentGuardianName || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Relationship to the Child:</div>
                                                    <div className="mt-1 text-sm text-black">{selectedApplication?.parentGuardianRelation || selectedApplication?.guardianRelation || temporaryAgreement.parentGuardianRelation || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Transferee-specific section (TOGGLE comment: replace `showTransfereeSection` with `selectedApplication?.isTransferee` to enable real conditional display) */}
                                {showTransfereeSection && (
                                    <div className="border rounded-lg bg-white">
                                        <button
                                            className="w-full text-left px-4 py-3 flex justify-between items-center"
                                            onClick={() => toggleSection('transferee')}
                                            type="button"
                                        >
                                            <span className="font-medium">Transferee Details</span>
                                            <span className="text-sm text-gray-500">{openSections.includes('transferee') ? '−' : '+'}</span>
                                        </button>
                                        {openSections.includes('transferee') && (
                                            <div className="px-4 pb-4 pt-0 text-sm text-black space-y-4">
                                                <div>
                                                    <div className="text-sm font-medium text-black">Previous School</div>
                                                    <div className="mt-2 grid grid-cols-3 gap-3 items-end">
                                                        <div>
                                                            <div className="text-xs text-gray-500">School Name:</div>
                                                            <div>{selectedApplication?.previousSchool?.trim() ? selectedApplication.previousSchool : temporaryTransfereeDetails.previousSchool || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">School Address:</div>
                                                            <div>{selectedApplication?.previousSchoolAddress?.trim() ? selectedApplication.previousSchoolAddress : temporaryTransfereeDetails.previousSchoolAddress || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Gr./ Yr. Level:</div>
                                                            <div>{selectedApplication?.previousSchoolGrade?.trim() ? selectedApplication.previousSchoolGrade : temporaryTransfereeDetails.previousSchoolGrade || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm font-medium text-black">Present School</div>
                                                    <div className="mt-2 grid grid-cols-3 gap-3 items-end">
                                                        <div>
                                                            <div className="text-xs text-gray-500">School Name:</div>
                                                            <div>{selectedApplication?.presentSchool?.trim() ? selectedApplication.presentSchool : temporaryTransfereeDetails.presentSchool || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">School Address:</div>
                                                            <div>{selectedApplication?.presentSchoolAddress?.trim() ? selectedApplication.presentSchoolAddress : temporaryTransfereeDetails.presentSchoolAddress || 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Gr./ Yr. Level:</div>
                                                            <div>{selectedApplication?.presentSchoolGrade?.trim() ? selectedApplication.presentSchoolGrade : temporaryTransfereeDetails.presentSchoolGrade || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-gray-500">Reason for Transferring:</div>
                                                    <div className="mt-1">{selectedApplication?.transferReason?.trim() ? selectedApplication.transferReason : temporaryTransfereeDetails.transferReason || 'N/A'}</div>
                                                </div>

                                                <div>
                                                    <div className="text-xs text-gray-500">Has the applicant been subjected to any disciplinary actions in school? If yes, please describe the action and the sanctions:</div>
                                                    <div className="mt-1">{selectedApplication?.disciplinaryActions?.trim() ? selectedApplication.disciplinaryActions : temporaryTransfereeDetails.disciplinaryActions || 'N/A'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="block text-m font-medium text-black mb-1 mt-7">Requirements Documents</span>
                            <p className="text-s text-gray-500 mb-5">
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
                        <div className="flex space-x-4 mt-8 ">
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