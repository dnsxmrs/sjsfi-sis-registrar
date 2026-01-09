'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
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

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-gray-600 mt-1">View and manage registration codes</p>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="bg-white relative w-full md:w-1/3">
                        <Search className="absolute top-2.5 left-3 text-black" size={18} />
                        <input
                            type="text"
                            placeholder="Search registration codes..."
                            className="text-gray-700 w-full pl-10 pr-4 py-2 border border-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="bg-[#800000] flex items-center gap-2 rounded-md px-4 py-2">
                        <label className="text-sm text-white whitespace-nowrap">Filter by Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white overflow-x-auto rounded-md border border-red-700 text-gray-700">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="text-gray-500">Loading registration codes...</div>
                    </div>
                ) : sortedCodes.length === 0 ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="text-gray-500">
                            {search || statusFilter !== 'all' ? 'No codes found matching your filters.' : 'No registration codes available.'}
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr>
                                <th
                                    className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('registrationCode')}
                                >
                                    <div className="flex items-center gap-2">
                                        Registration Code
                                        <SortIcon field="registrationCode" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status
                                        <SortIcon field="status" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center gap-2">
                                        Created At
                                        <SortIcon field="createdAt" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('expirationDate')}
                                >
                                    <div className="flex items-center gap-2">
                                        Expiration Date
                                        <SortIcon field="expirationDate" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 border-b cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        Actions
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCodes.map((code) => (
                                <tr key={code.id} className="hover:bg-red-50">
                                    <td className="px-4 py-4 border-t font-mono text-sm">{code.registrationCode}</td>
                                    <td className="px-4 py-4 border-t">
                                        <span
                                            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${code.status === 'Available'
                                                    ? 'bg-green-500'
                                                    : code.status === 'Expired'
                                                        ? 'bg-red-500'
                                                        : 'bg-gray-500'
                                                }`}
                                        >
                                            {code.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 border-t">{formatDate(code.createdAt)}</td>
                                    <td className="px-4 py-4 border-t">{formatDate(code.expirationDate)}</td>
                                    <td className="px-4 py-4 border-t">
                                        <div className="flex gap-2">
                                            {isCodeExpired(code) ? (
                                                <button
                                                    onClick={() => handleMarkAsExpired(code.id)}
                                                    disabled={markingAsExpired === code.id}
                                                    className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

            {/* Pagination */}
            {!isLoading && sortedCodes.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>entries per page</span>
                    </div>

                    {/* Pagination info and controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, sortedCodes.length)} of {sortedCodes.length} entries
                        </span>

                        <div className="flex items-center gap-2">
                            {/* Previous button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden sm:inline">Previous</span>
                            </button>

                            {/* Page numbers */}
                            <div className="flex items-center gap-1">
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
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-red-800 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}