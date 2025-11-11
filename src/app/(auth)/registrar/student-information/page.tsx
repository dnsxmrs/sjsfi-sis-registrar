'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, ChevronDown } from 'lucide-react';
import { getStudents } from '@/app/_actions/getStudents';

interface Student {
    id: string;
    firstName: string;
    middleName?: string | null;
    familyName: string;
    gradeLevel: string;
    status: string;
    email: string;
    studentNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    guardianName?: string;
    guardianContact?: string;
    address?: string;
}

const tabs = [
    { id: 'personal', label: <>Personal<span className="hidden md:inline"> Data</span></>, color: 'bg-red-800 text-white' },
    { id: 'health', label: <>Health<span className="hidden md:inline"> History</span></>, color: 'bg-red-800 text-white' },
    { id: 'familyBg', label: <>Family<span className="hidden md:inline"> Background</span></>, color: 'bg-red-800 text-white' },
    { id: 'education', label: <>Education<span className="hidden md:inline"> Background</span></>, color: 'bg-red-800 text-white' },
    { id: 'medical', label: <>Medical<span className="hidden md:inline"> History</span></>, color: 'bg-red-800 text-white' },
];

export default function StudentInformationPage() {
    const [activeTab, setActiveTab] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    // Fetch students on component mount
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const result = await getStudents();
                if (result.success) {
                    setStudents(result.students);
                } else {
                    console.error('Failed to fetch students:', result.error);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentNumber && student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleStudentSelect = (student: Student) => {
        setSelectedStudent(student);
        // setSearchTerm(student.name);
    };

    // STUDENT
    const renderPersonalData = () => {
        if (!selectedStudent) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-center">Please select a student to view their information</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6">
                {/* Student Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">
                                    {selectedStudent.firstName} {selectedStudent.middleName || ''} {selectedStudent.familyName}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Student Number
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.studentNumber || selectedStudent.id}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Grade Level
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.gradeLevel}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.gender || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.email || 'Not specified'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.dateOfBirth || 'Not specified'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedStudent.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {selectedStudent.status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.address || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardian Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Guardian Name
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.guardianName || 'Not specified'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Guardian Contact
                            </label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                <p className="text-gray-900">{selectedStudent.guardianContact || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // HEALTH HISTORY
    const renderHealthHistory = () => {
        // Placeholder health history data
        const healthData = {
            allergies: 'Peanuts, Pollen',
            diseases: 'Asthma',
            medicalConditions: 'Diabetic',
            immunizations: 'Up to date',
            physicalHandicap: 'Lazy eye, and a slight limp',
        };

        if (!selectedStudent) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p className="text-center">Please select a student to view their health history</p>
                </div>
            );
        }

        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Childhood Diseases
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-gray-900">{healthData.diseases}</p>
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
        );
    };

    // FAMILY BACKGROUND
    const renderFamBackground = () => {
        // Placeholder father info data
        const father = {
            familyName: 'Doe',
            firstName: 'John',
            middleName: 'Michael',
            birthDate: '01/01/1970',
            placeOfBirth: 'Manila, Philippines',
            age: '54',
            nationality: 'Filipino',
            religion: 'Catholic',
            landlineNumber: '(02) 123-4567',
            mobileNumber: '09171234567',
            email: 'john.doe@example.com',
            homeAddress: '123 Main Street',
            city: 'Quezon City',
            stateProvince: 'Metro Manila',
            zipCode: '1100',
            education: 'Bachelor of Science in Engineering',
            occupation: 'Engineer',
            company: 'ABC Construction Corp.',
            companyAddress: '456 Corporate Avenue',
            companyCity: 'Makati City',
            businessNumber: '(02) 765-4321',
            annualIncome: '₱1,200,000',
            statusOfParent: 'Married',
        };

        // Placeholder mother info data
        const mother = {
            familyName: 'Smith',
            firstName: 'Linda',
            middleName: 'Marie',
            birthDate: '1975-08-12',
            placeOfBirth: 'Los Angeles, CA',
            age: '49',
            nationality: 'American',
            religion: 'Christianity',
            landlineNumber: '(213) 555-7890',
            mobileNumber: '(310) 555-1234',
            email: 'linda.smith@example.com',
            homeAddress: '123 Maple Street',
            city: 'Los Angeles',
            stateProvince: 'California',
            zipCode: '90001',
            education: 'Bachelor of Arts in English',
            occupation: 'Teacher',
            company: 'LA Public Schools',
            companyAddress: '456 Education Blvd',
            companyCity: 'Los Angeles',
            businessNumber: '(213) 555-4567',
            annualIncome: '$50,000',
            statusOfParent: 'Married',
        };

        // Placeholder guardian info data
        const guardian = {
            familyName: 'Johnson',
            firstName: 'Mark',
            middleName: 'Anthony',
            birthDate: '1968-03-22',
            placeOfBirth: 'Houston, TX',
            age: '56',
            nationality: 'American',
            religion: 'Catholic',
            landlineNumber: '(713) 555-9876',
            mobileNumber: '(281) 555-6789',
            email: 'mark.johnson@example.com',
            homeAddress: '789 Oak Lane',
            city: 'Houston',
            stateProvince: 'Texas',
            zipCode: '77002',
            education: 'Master of Business Administration',
            occupation: 'Financial Analyst',
            company: 'Houston Finance Corp',
            companyAddress: '1010 Market Street',
            companyCity: 'Houston',
            businessNumber: '(713) 555-1122',
            annualIncome: '$75,000',
            statusOfParent: 'Single Parent',
            relationToApplicant: 'Uncle',
        };

        if (!selectedStudent) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p className="text-center">Please select a student to view their family background</p>
                </div>
            );
        }

          return (
            // ========================= FATHER =========================
            <div className="p-6 space-y-6">
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
                    value={father.middleName}
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
                    value={father.landlineNumber}
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
                    value={father.company}
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
                    value={father.companyAddress}
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
                    value={father.companyCity}
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
                    value={father.businessNumber}
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
                    value={father.annualIncome}
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
                    "Married",
                    "Single Parent",
                    "Separated",
                    "Widowed",
                    "Widowed, Remarried",
                    "Others: _______",
                    ].map((status) => (
                    <div key={status} className="inline-flex items-center">
                        <div
                        className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${
                            father.statusOfParent === status ? "bg-gray-800" : ""
                        }`}
                        ></div>
                        <span>{status}</span>
                    </div>
                    ))}
                </div>

             {/* ===================== MOTHER ===================== */}
                <div className="p-6 space-y-6 my-5">
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
                        value={mother.middleName}
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
                        value={mother.landlineNumber}
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
                        value={mother.company}
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
                        value={mother.companyAddress}
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
                        value={mother.companyCity}
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
                        value={mother.businessNumber}
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
                        value={mother.annualIncome}
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
                        'Married',
                        'Single Parent',
                        'Separated',
                        'Widowed',
                        'Widowed, Remarried',
                        'Others: _______',
                        ].map((status) => (
                        <div key={status} className="inline-flex items-center">
                            <div
                            className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${
                                mother.statusOfParent === status ? 'bg-gray-800' : ''
                            }`}
                            ></div>
                            <span>{status}</span>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                </div>

            {/* ===================== GUARDIAN ===================== */}
            <div className="p-6 space-y-6 my-2">
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
                        value={guardian.middleName}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relation to Applicant:</label>
                        <input
                        type="text"
                        placeholder="Relation to Applicant"
                        value={guardian.relationToApplicant}
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
                        value={guardian.landlineNumber}
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
                        value={guardian.company}
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
                        value={guardian.companyAddress}
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
                        value={guardian.companyCity}
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
                        value={guardian.businessNumber}
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
                        value={guardian.annualIncome}
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
                        'Married',
                        'Single Parent',
                        'Separated',
                        'Widowed',
                        'Widowed, Remarried',
                        'Others: _______',
                        ].map((status) => (
                        <div key={status} className="inline-flex items-center">
                            <div
                            className={`w-4 h-4 border border-gray-400 rounded-full mr-2 ${
                                guardian.statusOfParent === status ? 'bg-gray-800' : ''
                            }`}
                            ></div>
                            <span>{status}</span>
                        </div>
                        ))}
                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // EDUCATIONAL BACKGROUND
    const renderEducBackground = () => {
        if (!selectedStudent) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p className="text-center">Please select a student to view their educational background</p>
                </div>
            );
        }

        const school = {
           yearLevel: '',
           schoolName: '',
           schoolAddress: '', 
           honorsReceived: '',
           inclusiveYearsAttended: '',
           attendedSummerClasses: '',
           summerClassDetails: '',
        };

        return (
            <div className="p-6 space-y-6">
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
                                defaultValue={school.yearLevel}
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
                                defaultValue={school.schoolName}
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
                                defaultValue={school.schoolAddress}
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
                                defaultValue={school.inclusiveYearsAttended}
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
                                defaultValue={school.honorsReceived}
                                disabled
                                readOnly
                                rows={6}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attended Summer Classes A.Y.:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="YYYY - YYYY"
                                        defaultValue={school.summerClassDetails}
                                        disabled
                                        readOnly
                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gr / Yr. Level Repeated:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Answer Here..."
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
                                        disabled
                                        readOnly
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TRANSFEREES */}
                    <h3 className="text-center font-bold mb-4 text-black border border-gray-300 rounded-md py-1">
                    FOR TRANFEREES
                    </h3>

                    {/* Previous School */}
                    <div className="border rounded-md p-4 mb-6">
                        <div className="text-sm font-medium text-gray-700 mb-2">Previous School:</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Address:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gr. / Yr. Level:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Present School */}
                    <div className="border rounded-md p-4 mb-6">
                        <div className="text-sm font-medium text-gray-700 mb-2">Present School:</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Address:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gr. / Yr. Level:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Reason for Transferring */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transferring:</label>
                        <textarea placeholder="Answer Here..." disabled readOnly rows={3} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                        <div className="text-right text-xs text-gray-400 mt-1">250</div>
                    </div>

                    {/* Disciplinary Actions */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Has the applicant been subjected to any disciplinary actions in school? If yes, please describe the action and the sanctions:</label>
                        <textarea placeholder="Answer Here..." disabled readOnly rows={3} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                        <div className="text-right text-xs text-gray-400 mt-1">250</div>
                    </div>

                </div>
            </div>
        );
    }

    // MEDICAL HISTORY 
    const renderMedicalHistory = () => {
        if (!selectedStudent) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p className="text-center">Please select a student to view their medical history</p>
                </div>
            );
        }
            return (
                <div className="p-6 space-y-8">
                    {/* Medical History Form */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admission to Grade/Year:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div className="flex items-center gap-4 mt-6">
                                <label className="block text-sm font-medium text-gray-700">Gender:</label>
                                <div className="flex gap-2">
                                    <input type="radio" disabled readOnly /> <span>Female</span>
                                    <input type="radio" disabled readOnly /> <span>Male</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date:</label>
                                <input type="text" placeholder="MM/DD/YY" disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent/s / Guardian Name:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Landline Number:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Home Address:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City:</label>
                                <select disabled className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900">
                                    <option>Answer Here...</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province:</label>
                                <select disabled className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900">
                                    <option>Answer Here...</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code:</label>
                                <input type="text" placeholder="Answer Here..." disabled readOnly className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Medical History Checklist */}
                    <div className="border rounded-md p-4 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-2">
                                <ul className="space-y-2 text-sm text-gray-700 mt-8">
                                    <li>1. Epilepsy for the 6 months</li>
                                    <li>2. Head injuries leading to loss of consciousness for the last 6 months</li>
                                    <li>3. Recurrent headache/migraine</li>
                                    <li>4. Diseases Nervous System (Multiple Sclerosis)</li>
                                    <li>5. Surgery</li>
                                    <li>6. Visual Diseases (blindness on one eye, blurred vision, glaucoma)</li>
                                    <li>7. Ear infection</li>
                                    <li>8. Vertigo or Dizziness</li>
                                    <li>9. Heart Diseases</li>
                                    <li>10. Asthma, Bronchitis, TB or Pneumonia</li>
                                    <li>11. Ulcer</li>
                                    <li>12. Liver Diseases or Hepatitis</li>
                                    <li>13. Problems with joints, bones or recurrent dislocation</li>
                                    <li>14. Allergic skin rashes</li>
                                    <li>15. Allergies</li>
                                </ul>
                            </div>
                            <div className="col-span-1 w-full">
                                <div className="flex flex-row gap-2 w-full">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="font-semibold text-gray-700 mb-2 text-center">YES</div>
                                        {[...Array(15)].map((_, i) => (
                                            <input key={i} type="checkbox" disabled readOnly className="mb-2" />
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="font-semibold text-gray-700 mb-2 text-center">NO</div>
                                        {[...Array(15)].map((_, i) => (
                                            <input key={i} type="checkbox" disabled readOnly className="mb-2" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">If you had surgery, please specify:</label>
                                <textarea placeholder="Answer Here..." disabled readOnly rows={2} maxLength={100} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">If you have heart diseases, please specify what:</label>
                                <textarea placeholder="Answer Here..." disabled readOnly rows={2} maxLength={100} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">For no. 10, please specify which:</label>
                                <select disabled className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900">
                                    <option>Select Which</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">If you have allergies, please specify what:</label>
                                <textarea placeholder="Answer Here..." disabled readOnly rows={2} maxLength={100} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Do you have any medication that you&apos;re currently taking?</label>
                                <textarea placeholder="Answer Here..." disabled readOnly rows={2} maxLength={100} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-900" />
                            </div>
                        </div>
                    </div>

                    {/* Immunization Record */}
                    <div className="border rounded-md p-4 mt-8">
                        <div className="font-bold text-center mb-4 text-black border border-gray-300 rounded-md py-1">IMMUNIZATION RECORD</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Have you ever had the ff. Please select all that apply:</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Tetanus', 'DPT', 'HepB', 'Polio', 'Measles', 'BCC'].map((v, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input type="checkbox" disabled readOnly />
                                            <span className="text-sm">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Do you allow or school nurse to give first aid during sick days?</label>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" disabled readOnly />
                                        <span className="text-sm">Yes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" disabled readOnly />
                                        <span className="text-sm">No</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
    }

        const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return renderPersonalData();
            case 'health':
                return renderHealthHistory();
            case 'familyBg':
                return renderFamBackground();
            case 'education':
                return renderEducBackground();
            case 'medical':
                return renderMedicalHistory();
            default:
                return renderPersonalData();
        }
    };

    return (
        <div className="h-screen bg-gray-100">
            <div className="flex flex-col md:flex-row h-screen">
                {/* Students List - Above on mobile, sidebar on desktop */}
                <div className="w-full md:w-80 bg-white md:border-r border-gray-200 flex flex-col h-64 md:h-full">
                    {/* Search Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <div className="flex items-center">
                                <Search className="w-4 h-4 text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Find Student"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                    className="flex-1 border-none outline-none text-sm text-black placeholder-gray-500"
                                />
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Students Section */}
                    <div className="flex-1 overflow-hidden">
                        {/* Students List */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading students...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">No students found</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredStudents.map((student) => (
                                        <div
                                            key={student.id}
                                            onClick={() => handleStudentSelect(student)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.firstName} {student.familyName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {student.gradeLevel} • {student.studentNumber || student.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Below on mobile */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap items-center justify-between border-b border-gray-200">
                        <div className="flex flex-nowrap md:flex-wrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 md:px-8 md:py-2 text-[10px] md:text-base font-small transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-yellow-400 text-black border-b-2 border-transparent'
                                        : 'bg-red-800 text-white hover:bg-red-700 border-b-2 border-transparent'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Edit Button */}
                        <div className="pr-6">
                            <button
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit Student Information"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        {renderTabContent()}
                    </div>
                </div>
            </div>


        </div>
    );
}