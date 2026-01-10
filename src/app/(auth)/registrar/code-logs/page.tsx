'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getAllCodes } from '@/app/_actions/getRegistrationCodes';
import { markCodeAsExpired } from '@/app/_actions/markCodeAsExpired';
import toast from 'react-hot-toast';

interface RegistrationCode {
    id: number;
    registrationCode: string;
    status: string;
    expirationDate: string | null;
    createdAt: string;
}

interface CodeData {
    available: RegistrationCode[];
    inactive: RegistrationCode[];
    expired: RegistrationCode[];
}

type SortField = 'registrationCode' | 'status' | 'createdAt' | 'expirationDate';
type SortOrder = 'asc' | 'desc';

export default function CodeManagement() {
    const [codes, setCodes] = useState<CodeData>({
        available: [],
        inactive: [],
        expired: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [markingAsExpired, setMarkingAsExpired] = useState<number | null>(null);

    useEffect(() => {
        const fetchCodes = async () => {
            setIsLoading(true);
            try {
                const result = await getAllCodes();
                if (result.success) {
                    setCodes(result.codes);
                }
            } catch (error) {
                console.error('Error fetching codes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCodes();
    }, []);

    // Combine all codes into one array
    const allCodes: RegistrationCode[] = [
        ...codes.available.map(code => ({ ...code, status: 'Available' })),
        ...codes.inactive.map(code => ({ ...code, status: 'Inactive' })),
        ...codes.expired.map(code => ({ ...code, status: 'Expired' }))
    ];

    // Filter codes
    const filteredCodes = allCodes.filter((code) => {
        const matchesSearch = code.registrationCode.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || code.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Sort codes
    const sortedCodes = [...filteredCodes].sort((a, b) => {
        let compareA: string | number | Date;
        let compareB: string | number | Date;

        switch (sortField) {
            case 'registrationCode':
                compareA = a.registrationCode;
                compareB = b.registrationCode;
                break;
            case 'status':
                compareA = a.status;
                compareB = b.status;
                break;
            case 'createdAt':
                compareA = new Date(a.createdAt).getTime();
                compareB = new Date(b.createdAt).getTime();
                break;
            case 'expirationDate':
                compareA = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
                compareB = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
                break;
            default:
                return 0;
        }

        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedCodes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCodes = sortedCodes.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isCodeExpired = (code: RegistrationCode) => {
        if (!code.expirationDate) return false;
        return code.status === 'Available' && new Date(code.expirationDate) < new Date();
    };

    const handleMarkAsExpired = async (codeId: number) => {
        setMarkingAsExpired(codeId);
        try {
            const result = await markCodeAsExpired(codeId);
            if (result.success && result.code) {
                // Update the local state
                setCodes(prevCodes => {
                    const updatedAvailable = prevCodes.available.filter(c => c.id !== codeId);
                    const updatedExpired = [...prevCodes.expired, result.code];
                    return {
                        ...prevCodes,
                        available: updatedAvailable,
                        expired: updatedExpired
                    };
                });
            } else {
                console.error('Failed to mark code as expired');
                toast.error('Failed to mark code as expired. Please try again.');
            }
        } catch (error) {
            console.error('Error marking code as expired:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setMarkingAsExpired(null);
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

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-600">View and manage registration codes</p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="bg-white flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search registration codes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="placeholder-gray text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Filter Section */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 whitespace-nowrap">Filter by Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 cursor-pointer rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available</option>
                                <option value="inactive">Inactive</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count and Items Per Page */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-sm text-gray-600">
                            Showing {filteredCodes.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredCodes.length)} of {filteredCodes.length} codes
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
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Codes Table/List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Mobile View - Cards */}
                <div className="block lg:hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="text-gray-500">Loading registration codes...</div>
                        </div>
                    ) : sortedCodes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {search || statusFilter !== 'all' ? 'No codes found matching your filters.' : 'No registration codes available.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {paginatedCodes.map((code) => (
                                <div key={code.id} className="p-4 hover:bg-gray-50">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {code.registrationCode}
                                                </p>
                                                <p className="text-sm text-gray-600">{formatDate(code.createdAt)}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {code.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Expires: {formatDate(code.expirationDate)}
                                        </p>

                                        {/* Action Button */}
                                        <div className="flex gap-2 pt-2">
                                            {isCodeExpired(code) ? (
                                                <button
                                                    onClick={() => handleMarkAsExpired(code.id)}
                                                    disabled={markingAsExpired === code.id}
                                                    className="flex-1 cursor-pointer flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    {markingAsExpired === code.id ? 'Marking...' : 'Mark as Expired'}
                                                </button>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg">
                                                    No action needed
                                                </div>
                                            )}
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
                            <div className="text-gray-500">Loading registration codes...</div>
                        </div>
                    ) : sortedCodes.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {search || statusFilter !== 'all' ? 'No codes found matching your filters.' : 'No registration codes available.'}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('registrationCode')}
                                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                        >
                                            <span>Registration Code</span>
                                            {getSortIcon('registrationCode')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                        >
                                            <span>Status</span>
                                            {getSortIcon('status')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('createdAt')}
                                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                        >
                                            <span>Created At</span>
                                            {getSortIcon('createdAt')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('expirationDate')}
                                            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                                        >
                                            <span>Expiration Date</span>
                                            {getSortIcon('expirationDate')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCodes.map((code) => (
                                    <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {code.registrationCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {code.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(code.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(code.expirationDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {isCodeExpired(code) ? (
                                                    <button
                                                        onClick={() => handleMarkAsExpired(code.id)}
                                                        disabled={markingAsExpired === code.id}
                                                        className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        {markingAsExpired === code.id ? 'Marking...' : 'Mark as Expired'}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No action</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {sortedCodes.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            {/* Mobile pagination info */}
                            <div className="text-sm text-gray-600 sm:hidden">
                                Page {currentPage} of {totalPages}
                            </div>

                            {/* Pagination buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </button>

                                {/* Page numbers */}
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;

                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-2 text-gray-500">...</span>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                    currentPage === totalPages
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
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
    );
}