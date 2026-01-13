'use client';

import StatsCards from '@/components/registrar/StatsCards';
import GradePieChart from '@/components/admin/PieChart';
import QuickActions from '@/components/registrar/QuickActions';
import { CheckCircle, BarChart3, PieChart, Table, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { getEnrollmentByYearLevel, getRequirementsStatusCount, getRecentFeedbacks, getRecentApplications } from '@/app/_actions/registrarHome';

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

// Predefined aesthetically pleasing colors
const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#A855F7', // Purple
];

// Function to get unique colors for bars
const getUniqueColors = (count: number) => {
    // Shuffle the color palette
    const shuffled = [...colorPalette].sort(() => Math.random() - 0.5);
    // Return the first 'count' colors, or repeat the palette if needed
    if (count <= shuffled.length) {
        return shuffled.slice(0, count);
    }
    // If we need more colors than available, repeat the palette
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(shuffled[i % shuffled.length]);
    }
    return result;
};

export default function RegistrarHomePage() {
    const [enrollmentData, setEnrollmentData] = useState<Array<{ yearLevel: string; students: number }>>([]);
    const [barColors, setBarColors] = useState<string[]>([]);
    const [requirementsData, setRequirementsData] = useState<Array<{ requirementType: string; approved: number; total: number; percentage: number }>>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchEnrollmentData = async () => {
            const result = await getEnrollmentByYearLevel();
            if (result.success && result.data) {
                setEnrollmentData(result.data);
                // Generate unique colors for each bar
                setBarColors(getUniqueColors(result.data.length));
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

        fetchEnrollmentData();
        fetchRequirementsData();
        fetchFeedbacks();
        fetchApplications();
    }, []);

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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Enrollment by Year Level</h3>
                            <p className="text-sm text-gray-600">Student distribution across grade levels</p>
                        </div>
                    </div>
                    <div className="flex-1">
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
                                            <div className={`${barColor} h-2 rounded-full transition-all duration-300`} style={{width: `${req.percentage}%`}}></div>
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
