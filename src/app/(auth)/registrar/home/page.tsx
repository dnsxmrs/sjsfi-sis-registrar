'use client';

import StatsCards from '@/components/registrar/StatsCards';
import GradePieChart from '@/components/admin/PieChart';
import QuickActions from '@/components/registrar/QuickActions';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, BarChart3, PieChart, Table, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const enrollmentData = [
    { yearLevel: 'Grade 7', students: 150 },
    { yearLevel: 'Grade 8', students: 140 },
    { yearLevel: 'Grade 9', students: 130 },
    { yearLevel: 'Grade 10', students: 120 },
    { yearLevel: 'Grade 11', students: 110 },
    { yearLevel: 'Grade 12', students: 100 },
];

const applications = [
    { id: 'APP-001', name: 'John Doe', yearLevel: 'Grade 10', submittedDate: '2023-10-01', status: 'Pending' },
    { id: 'APP-002', name: 'Jane Smith', yearLevel: 'Grade 11', submittedDate: '2023-10-02', status: 'Under Review' },
    { id: 'APP-003', name: 'Bob Johnson', yearLevel: 'Grade 9', submittedDate: '2023-10-03', status: 'Approved' },
];

const activities = [
    { user: 'admin@example.com', action: 'Approved student application APP-001', timestamp: '2023-10-05 14:30' },
    { user: 'registrar@example.com', action: 'Updated student records for Grade 10', timestamp: '2023-10-05 13:45' },
    { user: 'teacher@example.com', action: 'Submitted grade report', timestamp: '2023-10-05 12:20' },
];

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

// Function to get random color from palette
const getRandomColorFromPalette = () => {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
};

// Generate random colors for each bar from the palette
const barColors = enrollmentData.map(() => getRandomColorFromPalette());

export default function RegistrarHomePage() {
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
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
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
                                <YAxis />
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
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="text" placeholder="Search..." className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1" />
                            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 whitespace-nowrap">Filter</button>
                        </div>
                    </div>
                    {/* Mobile View - Cards */}
                    <div className="block lg:hidden">
                        <div className="divide-y divide-gray-200">
                            {applications.map((app) => (
                                <div key={app.id} className="p-4 hover:bg-gray-50">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {app.id}
                                                </p>
                                                <p className="text-sm text-gray-600">{app.name}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {app.yearLevel} • Submitted: {app.submittedDate}
                                        </p>
                                    </div>
                                </div>
                            ))}
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
                                {applications.map((app) => (
                                    <tr key={app.id} className="border-b border-gray-100">
                                        <td className="py-2">{app.id}</td>
                                        <td className="py-2">{app.name}</td>
                                        <td className="py-2">{app.yearLevel}</td>
                                        <td className="py-2">{app.submittedDate}</td>
                                        <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>{app.status}</span></td>
                                    </tr>
                                ))}
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
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-black">Birth Certificate</span>
                                <span className="text-sm text-gray-600">85% (17/20)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-black">Report Card</span>
                                <span className="text-sm text-gray-600">92% (23/25)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-orange-600">Medical Certificate</span>
                                <span className="text-sm text-gray-600">45% (9/20)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-black">Good Moral</span>
                                <span className="text-sm text-gray-600">78% (14/18)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: "System Activity" log table */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Activity className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
                        <p className="text-sm text-gray-600">Recent system events and user actions</p>
                    </div>
                </div>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {activities.map((activity, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {activity.user}
                                            </p>
                                            <p className="text-sm text-gray-600">{activity.action}</p>
                                        </div>
                                        <span className="text-sm text-red-500 text-right">{activity.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-black">
                                <th className="text-left py-2">User</th>
                                <th className="text-left py-2">Action</th>
                                <th className="text-left py-2">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => (
                                <tr key={index} className="border-b border-gray-100 text-black">
                                    <td className="py-2">{activity.user}</td>
                                    <td className="py-2">{activity.action}</td>
                                    <td className="py-2 text-red-500">{activity.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
