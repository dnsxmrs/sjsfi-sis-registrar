'use client';

import StatsCards from '@/components/registrar/StatsCards';
import GradePieChart from '@/components/admin/PieChart';
import QuickActions from '@/components/registrar/QuickActions';
import { CheckCircle, BarChart3, PieChart, Table, Activity, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { getRequirementsStatusCount, getRecentFeedbacks, getRecentApplications, getAcademicYears, getAllEnrollmentData } from '@/app/_actions/registrarHome';

interface Application {
    id: number;
    applicationNumber: string | null;
    firstName: string;
    middleName: string | null;
    familyName: string;
    status: string;
    createdAt: Date;
    yearLevel: {
        name: string;
    } | null;
}

interface Feedback {
    id: number;
    type: string;
    message: string;
    suggestion: string | null;
    status: string;
    createdAt: Date;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'under review':
            return 'bg-blue-100 text-blue-800';
        case 'approved':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Predefined distinct colors - carefully selected to be visually different
const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Emerald Green
    '#F97316', // Orange
    '#8B5CF6', // Violet
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F59E0B', // Amber
    '#A855F7', // Purple
    '#84CC16', // Lime Green
    '#F43F5E', // Rose
];

// Simple hash function to convert string to number
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};

// Function to get consistent colors for bars based on year level names
const getConsistentColors = (data: Array<{ yearLevel: string; students: number }>) => {
    const usedColors = new Set<string>();
    const colorMap: Record<string, string> = {};

    // Sort data to ensure consistent ordering
    const sortedData = [...data].sort((a, b) => a.yearLevel.localeCompare(b.yearLevel));

    sortedData.forEach((item) => {
        const yearLevel = item.yearLevel;

        // Generate a deterministic index based on year level name
        const hash = hashString(yearLevel);
        let colorIndex = hash % colorPalette.length;
        let selectedColor = colorPalette[colorIndex];

        // If color is already used, find the next available color
        let attempts = 0;
        while (usedColors.has(selectedColor) && attempts < colorPalette.length) {
            colorIndex = (colorIndex + 1) % colorPalette.length;
            selectedColor = colorPalette[colorIndex];
            attempts++;
        }

        colorMap[yearLevel] = selectedColor;
        usedColors.add(selectedColor);
    });

    // Return colors in the original data order
    return data.map(item => colorMap[item.yearLevel]);
};

export default function RegistrarHomePage() {
    const [enrollmentData, setEnrollmentData] = useState<Array<{ yearLevel: string; students: number }>>([]);
    const [allEnrollmentData, setAllEnrollmentData] = useState<{
        byYear: Record<string, Array<{ yearLevel: string; students: number }>>;
        all: Array<{ yearLevel: string; students: number }>;
    }>({ byYear: {}, all: [] });
    const [barColors, setBarColors] = useState<string[]>([]);
    const [requirementsData, setRequirementsData] = useState<Array<{ requirementType: string; approved: number; total: number; percentage: number }>>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [academicYears, setAcademicYears] = useState<Array<{ id: number; year: string }>>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | 'all'>('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            const result = await getAcademicYears();
            if (result.success && result.data) {
                setAcademicYears(result.data);
                // Set the current academic year as default
                if (result.currentAcademicYearId) {
                    setSelectedAcademicYear(result.currentAcademicYearId);
                }
            }
        };

        const fetchAllEnrollmentData = async () => {
            const result = await getAllEnrollmentData();
            if (result.success && result.data) {
                setAllEnrollmentData(result.data);
            }
        };

        const fetchRequirementsData = async () => {
            const result = await getRequirementsStatusCount();
            if (result.success && result.data) {
                setRequirementsData(result.data);
            }
        };

        const fetchFeedbacks = async () => {
            const result = await getRecentFeedbacks(5);
            if (result.success && result.data) {
                setFeedbacks(result.data);
            }
        };

        const fetchApplications = async () => {
            const result = await getRecentApplications();
            if (result.success && result.data) {
                setApplications(result.data);
            }
        };

        fetchAcademicYears();
        fetchAllEnrollmentData();
        fetchRequirementsData();
        fetchFeedbacks();
        fetchApplications();
    }, []);

    // Filter enrollment data client-side for instant updates
    useEffect(() => {
        if (selectedAcademicYear === 'all') {
            const data = allEnrollmentData.all;
            setEnrollmentData(data);
            setBarColors(getConsistentColors(data));
        } else {
            const data = allEnrollmentData.byYear[String(selectedAcademicYear)] || [];
            setEnrollmentData(data);
            setBarColors(getConsistentColors(data));
        }
    }, [selectedAcademicYear, allEnrollmentData]);

    const getFeedbackTypeColor = (type: string) => {
        switch (type) {
            case 'COMPLAINT':
                return 'bg-red-100 text-red-800';
            case 'SUGGESTION':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLIMENT':
                return 'bg-green-100 text-green-800';
            case 'BUG_REPORT':
                return 'bg-orange-100 text-orange-800';
            case 'FEATURE_REQUEST':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFeedbackType = (type: string) => {
        return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Welcome back! Here&apos;s what&apos;s happening today.</h1>
            </div>

            {/* Top Summary Cards */}
            <StatsCards />

            {/* Main Content Layout (Two Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Left column (wider): "Enrollment by Year Level" bar chart */}
                <div className="text-black lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Enrollment by Year Level</h3>
                                <p className="text-sm text-gray-600">Student distribution across grade levels</p>
                            </div>
                        </div>
                        {/* Academic Year Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm font-medium text-gray-700"
                            >
                                <span>
                                    {selectedAcademicYear === 'all'
                                        ? 'All Academic Years'
                                        : academicYears.find(y => y.id === selectedAcademicYear)?.year || 'Select Year'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setSelectedAcademicYear('all');
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedAcademicYear === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            All Academic Years
                                        </button>
                                        {academicYears.map((year) => (
                                            <button
                                                key={year.id}
                                                onClick={() => {
                                                    setSelectedAcademicYear(year.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedAcademicYear === year.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                                    }`}
                                            >
                                                {year.year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        {enrollmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={enrollmentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="yearLevel" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip formatter={(value) => [value, '']} />
                                    <Bar dataKey="students">
                                        {enrollmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={barColors[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-gray-500 text-lg font-medium">No data found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        No enrollment data available for {
                                            selectedAcademicYear === 'all' 
                                                ? 'all academic years' 
                                                : academicYears.find(y => y.id === selectedAcademicYear)?.year || 'the selected period'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column (narrower): "Registration Types" donut/pie chart and QuickActions */}
                <div className="space-y-6">

                    <QuickActions />

                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <PieChart className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Registration Types</h3>
                                <p className="text-sm text-gray-600">Breakdown of student types</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <GradePieChart />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Student Applications */}
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md text-black transition-shadow">
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Table className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Recent Student Applications</h3>
                                <p className="text-sm text-gray-600">Latest application submissions</p>
                            </div>
                        </div>
                    </div>
                    {/* Mobile View - Cards */}
                    <div className="block lg:hidden">
                        <div className="divide-y divide-gray-200">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <div key={app.id} className="p-4 hover:bg-gray-50">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {app.applicationNumber}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{`${app.firstName} ${app.middleName ? app.middleName + ' ' : ''}${app.familyName}`}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {app.yearLevel?.name || 'N/A'} • Submitted: {formatDate(app.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No recent applications</p>
                            )}
                        </div>
                    </div>

                    {/* Desktop View - Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2">Application #</th>
                                    <th className="text-left py-2">Name</th>
                                    <th className="text-left py-2">Year Level</th>
                                    <th className="text-left py-2">Submitted Date</th>
                                    <th className="text-left py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length > 0 ? (
                                    applications.map((app) => (
                                        <tr key={app.id} className="border-b border-gray-100">
                                            <td className="py-2">{app.applicationNumber}</td>
                                            <td className="py-2">{`${app.firstName} ${app.middleName ? app.middleName + ' ' : ''}${app.familyName}`}</td>
                                            <td className="py-2">{app.yearLevel?.name || 'N/A'}</td>
                                            <td className="py-2">{formatDate(app.createdAt)}</td>
                                            <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>{app.status}</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">No recent applications</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Requirements Status */}
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4 text-black">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Requirements Status</h3>
                            <p className="text-sm text-gray-600">Document submission progress</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {requirementsData.length > 0 ? (
                            requirementsData.map((req, index) => {
                                // Cycle through colors
                                const colors = ['bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-purple-600', 'bg-red-600'];
                                const textColors = ['text-blue-900', 'text-green-900', 'text-orange-600', 'text-purple-900', 'text-red-900'];
                                const barColor = colors[index % colors.length];
                                const textColor = req.percentage < 50 ? textColors[index % textColors.length] : 'text-black';

                                return (
                                    <div key={req.requirementType}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-sm font-medium ${textColor}`}>{req.requirementType}</span>
                                            <span className="text-sm text-gray-600">{req.percentage}% ({req.approved}/{req.total})</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className={`${barColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${req.percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No requirements data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: "System Feedback" table */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent System Feedbacks</h3>
                        <p className="text-sm text-gray-600">Latest user feedback and reports</p>
                    </div>
                </div>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => (
                                <div key={feedback.id} className="p-4 hover:bg-gray-50">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getFeedbackTypeColor(feedback.type)}`}>
                                                        {formatFeedbackType(feedback.type)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">{feedback.message}</p>
                                                {feedback.suggestion && (
                                                    <p className="text-xs text-gray-500 mt-1">Suggestion: {feedback.suggestion}</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 text-right ml-2">{formatDate(feedback.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No feedbacks available</p>
                        )}
                    </div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-black">
                                <th className="text-left py-2">Type</th>
                                <th className="text-left py-2">Message</th>
                                <th className="text-left py-2">Suggestion</th>
                                <th className="text-left py-2">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => (
                                    <tr key={feedback.id} className="border-b border-gray-100 text-black">
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getFeedbackTypeColor(feedback.type)}`}>
                                                {formatFeedbackType(feedback.type)}
                                            </span>
                                        </td>
                                        <td className="py-2 max-w-xs truncate">{feedback.message}</td>
                                        <td className="py-2 max-w-xs truncate">{feedback.suggestion || '-'}</td>
                                        <td className="py-2 text-gray-600">{formatDate(feedback.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500">No feedbacks available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
