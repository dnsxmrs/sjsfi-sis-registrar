'use client';

import { useEffect, useState } from 'react';
import { X, UserPlus, UserMinus, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getStudentsInSection,
    getUnassignedStudents,
    assignStudentToSection,
    removeStudentFromSection,
} from '@/app/_actions/studentSectionActions';

interface Student {
    id: number;
    applicationNumber: string | null;
    familyName: string;
    firstName: string;
    middleName: string | null;
    gender: string;
    emailAddress: string;
    mobileNumber: string;
    status?: string;
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    currentStudents: number;
    termYearLevel: {
        academicTermId: number;
        yearLevelId: number;
        academicTerm: {
            year: string;
        };
        yearLevel: {
            name: string;
        };
    };
}

interface ManageStudentsModalProps {
    show: boolean;
    onClose: () => void;
    section: Section | null;
    onSuccess: () => void;
}

export default function ManageStudentsModal({
    show,
    onClose,
    section,
    onSuccess,
}: ManageStudentsModalProps) {
    const [activeTab, setActiveTab] = useState<'enrolled' | 'unassigned'>('enrolled');
    const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (show && section) {
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, section]);

    const fetchStudents = async () => {
        if (!section) return;

        setLoading(true);
        try {
            // Fetch enrolled students
            const enrolledResult = await getStudentsInSection(section.id);
            if (enrolledResult.success && enrolledResult.data) {
                setEnrolledStudents(enrolledResult.data);
            }

            // Fetch unassigned students
            const unassignedResult = await getUnassignedStudents(
                section.termYearLevel.academicTermId,
                section.termYearLevel.yearLevelId
            );
            if (unassignedResult.success && unassignedResult.data) {
                setUnassignedStudents(unassignedResult.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignStudent = async (studentId: number) => {
        if (!section) return;

        try {
            const result = await assignStudentToSection(studentId, section.id);
            if (result.success) {
                toast.success('Student assigned successfully!');
                await fetchStudents();
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to assign student');
            }
        } catch (error) {
            console.error('Error assigning student:', error);
            toast.error('An error occurred');
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        try {
            const result = await removeStudentFromSection(studentId);
            if (result.success) {
                toast.success('Student removed successfully!');
                await fetchStudents();
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to remove student');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            toast.error('An error occurred');
        }
    };

    const filteredEnrolled = enrolledStudents.filter((student) =>
        `${student.firstName} ${student.familyName} ${student.emailAddress}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const filteredUnassigned = unassignedStudents.filter((student) =>
        `${student.firstName} ${student.familyName} ${student.emailAddress}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    if (!show || !section) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Manage Students - {section.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {section.termYearLevel.academicTerm.year} - {section.termYearLevel.yearLevel.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Enrolled: {enrolledStudents.length}/{section.capacity}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6">
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'enrolled'
                                ? 'text-red-800 border-red-800'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Enrolled Students ({enrolledStudents.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('unassigned')}
                        className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === 'unassigned'
                                ? 'text-red-800 border-red-800'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <UserPlus size={18} />
                            Available Students ({unassignedStudents.length})
                        </div>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Loading students...
                        </div>
                    ) : activeTab === 'enrolled' ? (
                        <div className="space-y-3">
                            {filteredEnrolled.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg mb-2">No enrolled students</p>
                                    <p className="text-sm">Add students from the Available Students tab</p>
                                </div>
                            ) : (
                                filteredEnrolled.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <span className="text-red-800 font-semibold">
                                                        {student.firstName[0]}{student.familyName[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.familyName}
                                                    </h3>
                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                        {student.applicationNumber && (
                                                            <span>App #: {student.applicationNumber}</span>
                                                        )}
                                                        <span>{student.emailAddress}</span>
                                                        <span>{student.mobileNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                            title="Remove from section"
                                        >
                                            <UserMinus size={16} />
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUnassigned.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <UserPlus size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg mb-2">No available students</p>
                                    <p className="text-sm">
                                        All students for this term and year level have been assigned
                                    </p>
                                </div>
                            ) : section.currentStudents >= section.capacity ? (
                                <div className="text-center py-12 text-yellow-600">
                                    <Users size={48} className="mx-auto mb-4" />
                                    <p className="text-lg mb-2">Section is full</p>
                                    <p className="text-sm">
                                        Remove students or increase section capacity to add more
                                    </p>
                                </div>
                            ) : (
                                filteredUnassigned.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 font-semibold">
                                                        {student.firstName[0]}{student.familyName[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {student.firstName} {student.middleName ? student.middleName + ' ' : ''}{student.familyName}
                                                    </h3>
                                                    <div className="flex gap-4 text-sm text-gray-600">
                                                        {student.applicationNumber && (
                                                            <span>App #: {student.applicationNumber}</span>
                                                        )}
                                                        <span>{student.emailAddress}</span>
                                                        <span>{student.mobileNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAssignStudent(student.id)}
                                            className="ml-4 px-3 py-2 bg-red-800 text-white hover:bg-red-900 rounded-lg transition-colors flex items-center gap-2"
                                            title="Add to section"
                                        >
                                            <UserPlus size={16} />
                                            Add
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
