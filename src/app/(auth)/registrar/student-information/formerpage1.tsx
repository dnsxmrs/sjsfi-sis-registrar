'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Archive, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for approved students
const mockStudents = [
    {
        id: '1',
        studentNumber: 'SY2024-001',
        firstName: 'Juan',
        middleName: 'Santos',
        lastName: 'Dela Cruz',
        schoolYear: '2024-2025',
        gradeLevel: 'Grade 7',
    },
    {
        id: '2',
        studentNumber: 'SY2024-002',
        firstName: 'Maria',
        middleName: 'Garcia',
        lastName: 'Reyes',
        schoolYear: '2024-2025',
        gradeLevel: 'Grade 8',
    },
    {
        id: '3',
        studentNumber: 'SY2024-003',
        firstName: 'Pedro',
        middleName: 'Lopez',
        lastName: 'Mendoza',
        schoolYear: '2024-2025',
        gradeLevel: 'Grade 9',
    },
    {
        id: '4',
        studentNumber: 'SY2024-004',
        firstName: 'Ana',
        middleName: 'Cruz',
        lastName: 'Torres',
        schoolYear: '2023-2024',
        gradeLevel: 'Grade 10',
    },
    {
        id: '5',
        studentNumber: 'SY2024-005',
        firstName: 'Carlos',
        middleName: 'Rivera',
        lastName: 'Santos',
        schoolYear: '2023-2024',
        gradeLevel: 'Grade 11',
    },
    {
        id: '6',
        studentNumber: 'SY2024-006',
        firstName: 'Isabel',
        middleName: 'Morales',
        lastName: 'Bautista',
        schoolYear: '2025-2026',
        gradeLevel: 'Grade 12',
    },
];

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

    // Get unique grade levels and school years from data
    const uniqueGradeLevels = useMemo(() => {
        return Array.from(new Set(mockStudents.map(s => s.gradeLevel))).sort();
    }, []);

    const uniqueSchoolYears = useMemo(() => {
        return Array.from(new Set(mockStudents.map(s => s.schoolYear))).sort();
    }, []);

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
        const result = mockStudents.filter(student => {
            const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
            const matchesSearch =
                student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fullName.includes(searchQuery.toLowerCase());

            const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(student.gradeLevel);
            const matchesSchoolYear = selectedSchoolYears.length === 0 || selectedSchoolYears.includes(student.schoolYear);

            return matchesSearch && matchesGrade && matchesSchoolYear;
        });

        // Apply sorting
        if (sortField && sortOrder) {
            result.sort((a, b) => {
                let aValue: string;
                let bValue: string;

                if (sortField === 'name') {
                    aValue = `${a.lastName} ${a.firstName} ${a.middleName}`;
                    bValue = `${b.lastName} ${b.firstName} ${b.middleName}`;
                } else if (sortField === 'gradeLevel') {
                    // Extract numeric part for proper sorting
                    const aNum = parseInt(a.gradeLevel.replace('Grade ', ''));
                    const bNum = parseInt(b.gradeLevel.replace('Grade ', ''));
                    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
                } else {
                    aValue = a[sortField];
                    bValue = b[sortField];
                }

                const comparison = aValue.localeCompare(bValue);
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [searchQuery, selectedGrades, selectedSchoolYears, sortField, sortOrder]);

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

    const handleViewStudent = (studentNumber: string) => {
        router.push(`/registrar/student-information/${encodeURIComponent(studentNumber)}`);
    };

    const handleEditStudent = (studentId: string) => {
        console.log('Edit student:', studentId);
        // TODO: Implement edit student functionality
    };

    const handleArchiveStudent = (studentId: string) => {
        console.log('Archive student:', studentId);
        // TODO: Implement archive student functionality
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
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedGrades.includes(grade)
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
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
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
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedSchoolYears.includes(year)
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
                                        className="mt-2 text-sm text-green-600 hover:text-green-800"
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
                                    className="text-black px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {filteredAndSortedStudents.length === 0 ? (
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
                                                        {student.firstName} {student.middleName} {student.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{student.studentNumber}</p>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.gradeLevel}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{student.schoolYear}</p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleViewStudent(student.studentNumber)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>View</span>
                                                </button>
                                                <button
                                                    onClick={() => handleEditStudent(student.id)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleArchiveStudent(student.id)}
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
                        {filteredAndSortedStudents.length === 0 ? (
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
                                                {student.studentNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.firstName} {student.middleName} {student.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {student.schoolYear}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {student.gradeLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewStudent(student.studentNumber)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="View Student"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>View</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStudent(student.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Edit Student"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleArchiveStudent(student.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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