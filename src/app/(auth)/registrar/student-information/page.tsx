'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Archive, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllApprovedStudentApplications, archiveStudent } from '@/app/_actions/getStudents';
import toast from 'react-hot-toast';


type SortField = 'studentNumber' | 'name' | 'schoolYear' | 'gradeLevel';
type SortOrder = 'asc' | 'desc' | null;

export default function StudentInformationPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [selectedSchoolYears, setSelectedSchoolYears] = useState<string[]>([]);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            const response = await getAllApprovedStudentApplications();
            if (response && response.success && Array.isArray(response.applications)) {
                setStudents(response.applications);
            }
            console.log(response);
            setIsLoading(false);
        };
        fetchStudents();
    }, []);


    // Get unique grade levels and school years from data
    const uniqueGradeLevels = useMemo(() => {
        return Array.from(new Set(students.map(s => s.yearLevel?.name).filter(Boolean))).sort();
    }, [students]);

    const uniqueSchoolYears = useMemo(() => {
        return Array.from(new Set(students.map(s => s.academicYear?.year).filter(Boolean))).sort();
    }, [students]);

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortOrder === 'asc') {
                setSortOrder('desc');
            } else if (sortOrder === 'desc') {
                setSortOrder(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4" />;
        }
        if (sortOrder === 'asc') {
            return <ArrowUp className="w-4 h-4" />;
        }
        return <ArrowDown className="w-4 h-4" />;
    };

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        const result = students.filter(student => {
            const fullName = `${student.firstName} ${student.middleName || ''} ${student.familyName}`.toLowerCase();
            const matchesSearch =
                (student.applicationNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                fullName.includes(searchQuery.toLowerCase());

            const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(student.yearLevel?.name);
            const matchesSchoolYear = selectedSchoolYears.length === 0 || selectedSchoolYears.includes(student.academicYear?.year);

            return matchesSearch && matchesGrade && matchesSchoolYear;
        });

        // Apply sorting
        if (sortField && sortOrder) {
            result.sort((a, b) => {
                let aValue: string;
                let bValue: string;

                if (sortField === 'name') {
                    aValue = `${a.familyName} ${a.firstName} ${a.middleName || ''}`;
                    bValue = `${b.familyName} ${b.firstName} ${b.middleName || ''}`;
                } else if (sortField === 'gradeLevel') {
                    // Extract numeric part for proper sorting
                    const aGrade = a.yearLevel?.name || '';
                    const bGrade = b.yearLevel?.name || '';
                    const aNum = parseInt(aGrade.replace('Grade ', ''));
                    const bNum = parseInt(bGrade.replace('Grade ', ''));
                    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
                } else if (sortField === 'studentNumber') {
                    aValue = a.applicationNumber || '';
                    bValue = b.applicationNumber || '';
                } else if (sortField === 'schoolYear') {
                    aValue = a.academicYear?.year || '';
                    bValue = b.academicYear?.year || '';
                } else {
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
                }

                const comparison = aValue.localeCompare(bValue);
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [searchQuery, selectedGrades, selectedSchoolYears, sortField, sortOrder, students]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGrades, selectedSchoolYears]);

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

    // Handle grade level selection
    const toggleGradeLevel = (grade: string) => {
        setSelectedGrades(prev =>
            prev.includes(grade)
                ? prev.filter(g => g !== grade)
                : [...prev, grade]
        );
    };

    // Handle school year selection
    const toggleSchoolYear = (year: string) => {
        setSelectedSchoolYears(prev =>
            prev.includes(year)
                ? prev.filter(y => y !== year)
                : [...prev, year]
        );
    };

    const handleViewStudent = (applicationNumber: string) => {
        router.push(`/registrar/student-information/${encodeURIComponent(applicationNumber)}`);
    };

    const handleArchiveStudent = async (applicationNumber: string) => {
        if (!confirm('Are you sure you want to archive this student? This action can be reversed later.')) {
            return;
        }

        const result = await archiveStudent(applicationNumber);
        if (result.success) {
            // Refresh the students list
            const response = await getAllApprovedStudentApplications();
            if (response && response.success && Array.isArray(response.applications)) {
                setStudents(response.applications);
            }
            toast.success('Student archived successfully');
        } else {
            toast.error(`Failed to archive student: ${result.error}`);
        }
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="mx-auto">
                <h1 className="text-2xl sm:text-3xl font-semibold text-black mb-6">Student Information</h1>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Search Input */}
                        <div className="bg-white flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by student number or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="placeholder-gray text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Grade Level Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Level
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueGradeLevels.map((grade) => (
                                        <button
                                            key={grade}
                                            onClick={() => toggleGradeLevel(grade)}
                                            className={`px-3 py-1.5 cursor-pointer text-sm rounded-lg border transition-colors ${selectedGrades.includes(grade)
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                                {selectedGrades.length > 0 && (
                                    <button
                                        onClick={() => setSelectedGrades([])}
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* School Year Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Year
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueSchoolYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => toggleSchoolYear(year)}
                                            className={`px-3 py-1.5 cursor-pointer text-sm rounded-lg border transition-colors ${selectedSchoolYears.includes(year)
                                                    ? 'bg-green-500 text-white border-green-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                                {selectedSchoolYears.length > 0 && (
                                    <button
                                        onClick={() => setSelectedSchoolYears([])}
                                        className="mt-2 text-sm text-green-600 hover:text-green-800 cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Count and Items Per Page */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="text-sm text-gray-600">
                                Showing {filteredAndSortedStudents.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Items per page:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="text-black cursor-pointer px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Mobile View - Cards */}
                    <div className="block lg:hidden">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-500">Loading students...</div>
                            </div>
                        ) : filteredAndSortedStudents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No students found matching your criteria.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {paginatedStudents.map((student) => (
                                    <div key={student.id} className="p-4 hover:bg-gray-50">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {student.firstName} {student.middleName} {student.familyName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{student.applicationNumber}</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.yearLevel?.name}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{student.academicYear?.year}</p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleViewStudent(student.applicationNumber)}
                                                    className="flex-1 cursor-pointer flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                                {/* <button
                                                    onClick={() => handleEditStudent(student.id)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button> */}
                                                <button
                                                    onClick={() => handleArchiveStudent(student.applicationNumber)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                    <span>Archive</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop View - Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-500">Loading students...</div>
                            </div>
                        ) : filteredAndSortedStudents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No students found matching your criteria.
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort('studentNumber')}
                                                className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                            >
                                                <span>Student Number</span>
                                                {getSortIcon('studentNumber')}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort('name')}
                                                className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                            >
                                                <span>Full Name</span>
                                                {getSortIcon('name')}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort('schoolYear')}
                                                className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                            >
                                                <span>School Year</span>
                                                {getSortIcon('schoolYear')}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort('gradeLevel')}
                                                className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                            >
                                                <span>Grade Level</span>
                                                {getSortIcon('gradeLevel')}
                                            </button>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {student.applicationNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.firstName} {student.middleName || ''} {student.familyName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.academicYear?.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.yearLevel?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewStudent(student.applicationNumber)}
                                                        className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="View Student"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>View</span>
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleEditStudent(student.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Edit Student"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleArchiveStudent(student.applicationNumber)}
                                                        className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Archive Student"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                        <span>Archive</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredAndSortedStudents.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                {/* Mobile pagination info */}
                                <div className="text-sm text-gray-600 sm:hidden">
                                    Page {currentPage} of {totalPages}
                                </div>

                                {/* Pagination buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </button>

                                    {/* Page numbers */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <button
                                                    key={index}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-blue-500 text-white'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ) : (
                                                <span key={index} className="px-2 text-gray-500">
                                                    {page}
                                                </span>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {/* Desktop pagination info */}
                                <div className="hidden sm:block text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}