'use client';

import { useState } from 'react';

interface Schedule {
    id: number;
    subject: {
        id: number;
        code: string;
        name: string;
        yearLevel: string;
    };
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    instructor: string;
    maxSlots: number;
    term: {
        id: number;
        year: string;
    };
}

interface ScheduleClientProps {
    initialSchedules: Schedule[];
    terms: { id: number; year: string; }[];
    yearLevels: { id: number; name: string; }[];
}

export default function ScheduleClient({ initialSchedules, terms, yearLevels }: ScheduleClientProps) {
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredSchedules = initialSchedules.filter(schedule => {
        const matchesSearch = 
            schedule.subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTerm = !selectedTerm || schedule.term.year === selectedTerm;
        const matchesYear = !selectedYearLevel || schedule.subject.yearLevel === selectedYearLevel;
        return matchesSearch && matchesTerm && matchesYear;
    });

    // Calculate statistics
    const totalSchedules = initialSchedules.length;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 p-6">
                {/* Main Content */}
                <main className="flex-1 space-y-6 order-2 md:order-1">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Class Schedule Management</h1>
                        <p className="text-gray-600">Manage and view class schedules for all year levels</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by subject, code, or instructor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Term
                                </label>
                                <select
                                    value={selectedTerm}
                                    onChange={(e) => setSelectedTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                >
                                    <option value="">All Terms</option>
                                    {terms.map((term) => (
                                        <option key={term.id} value={term.year}>
                                            {term.year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year Level
                                </label>
                                <select
                                    value={selectedYearLevel}
                                    onChange={(e) => setSelectedYearLevel(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                >
                                    <option value="">All Year Levels</option>
                                    {yearLevels.map((level) => (
                                        <option key={level.id} value={level.name}>
                                            {level.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Schedules ({filteredSchedules.length})
                                </h2>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors"
                                >
                                    + Add Schedule
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Schedule
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Year Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSchedules.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No schedules found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSchedules.map((schedule) => (
                                            <tr key={schedule.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {schedule.subject.code}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {schedule.subject.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {schedule.instructor}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div>{schedule.day}</div>
                                                    <div className="text-gray-500">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {schedule.room}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {schedule.subject.yearLevel}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        View
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-900">
                                                        Edit
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-4 flex-shrink-0 order-1 md:order-2">
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col space-y-3">
                        <label className="block text-sm font-medium text-gray-800 px-3">
                            Quick Access
                        </label>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-red-800 cursor-pointer text-white py-2 rounded text-sm hover:bg-red-900 transition-colors"
                        >
                            + Add Schedule
                        </button>
                        <button className="bg-gray-200 cursor-pointer text-gray-800 py-2 rounded text-sm hover:bg-gray-300 transition-colors">
                            Import Schedule
                        </button>
                        <button className="bg-gray-200 cursor-pointer text-gray-800 py-2 rounded text-sm hover:bg-gray-300 transition-colors">
                            Export to PDF
                        </button>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-800 mb-4">Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Schedules</span>
                                <span className="text-lg font-bold text-gray-900">{totalSchedules}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Add Schedule Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Add New Schedule</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800">
                                        <option value="">Select Subject</option>
                                        {/* Add subjects from props */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructor
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                        placeholder="e.g., Prof. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Day
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800">
                                        <option value="">Select Day</option>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Monday/Wednesday">Monday/Wednesday</option>
                                        <option value="Tuesday/Thursday">Tuesday/Thursday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                        placeholder="e.g., 9:00 AM - 10:30 AM"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800"
                                        placeholder="e.g., Room 201"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 transition-colors"
                            >
                                Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
