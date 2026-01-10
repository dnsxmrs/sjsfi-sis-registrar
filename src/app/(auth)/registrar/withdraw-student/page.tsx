'use client';

import React from 'react';
import { CheckCircle, XCircle, Eye, FileText, Upload } from 'lucide-react';

const sampleRequests = [
    {
        id: 'REQ-001',
        studentName: 'Juan Dela Cruz',
        studentId: '2024-0001',
        course: 'BS Computer Science',
        type: 'Transfer Out',
        reason: 'Family is moving to another city.',
        date: '2024-06-25',
        status: 'Pending',
        document: 'transfer_form.pdf',
    },
    {
        id: 'REQ-002',
        studentName: 'Maria Santos',
        studentId: '2024-0002',
        course: 'BS Accountancy',
        type: 'Graduating',
        reason: 'Completed all academic requirements.',
        date: '2024-06-20',
        status: 'Approved',
        document: 'grad_clearance.pdf',
    },
    {
        id: 'REQ-003',
        studentName: 'Pedro Reyes',
        studentId: '2024-0003',
        course: 'BS Information Technology',
        type: 'Drop',
        reason: 'Personal reasons.',
        date: '2024-06-18',
        status: 'Rejected',
        document: '',
    },
];

const statusBadge = (status: string) => {
    if (status === 'Pending')
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Pending</span>;
    if (status === 'Approved')
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Approved</span>;
    if (status === 'Rejected')
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Rejected</span>;
    return null;
};

export default function RegistrarStatusRequestsPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-black mb-6">Student Status Requests</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Form */}
                    <div className="w-full lg:w-1/3 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow p-6 mb-8 lg:mb-0">
                            <h2 className="text-xl font-semibold mb-4 text-black">Submit New Request</h2>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Request Type*</label>
                                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none">
                                        <option>Transfer Out</option>
                                        <option>Transfer In</option>
                                        <option>Drop</option>
                                        <option>Stop</option>
                                        <option>Graduating</option>
                                        <option>Moving Up</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Reason*</label>
                                    <textarea className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" rows={3}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Target School*</label>
                                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" type="text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Effective Date</label>
                                    <div className="relative">
                                        <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none pr-10" type="text" placeholder="dd/mm/yyyy" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75zM8.25 11.25h.008v.008H8.25v-.008zm3.75 0h.008v.008h-.008v-.008zm3.75 0h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Supporting Documents</label>
                                    <div className="border border-dashed border-gray-300 rounded px-3 py-4 flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer">
                                        <Upload className="h-5 w-5 mb-1" />
                                        Upload files
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-black">Additional Notes</label>
                                    <textarea className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" rows={2}></textarea>
                                </div>
                                <button type="button" className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2 hover:bg-blue-700">Submit Request</button>
                            </form>
                        </div>
                    </div>
                    {/* Table Section */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300 text-black">
                                        <th className="py-2 font-semibold">Student Name</th>
                                        <th className="py-2 font-semibold">Student ID</th>
                                        <th className="py-2 font-semibold">Type of Request</th>
                                        <th className="py-2 font-semibold">Date Submitted</th>
                                        <th className="py-2 font-semibold">Status</th>
                                        <th className="py-2 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleRequests.map((req) => (
                                        <tr key={req.id} className="border-b border-gray-200 text-black hover:bg-gray-50">
                                            <td className="py-2">{req.studentName}</td>
                                            <td className="py-2">{req.studentId}</td>
                                            <td className="py-2">{req.type}</td>
                                            <td className="py-2">{req.date}</td>
                                            <td className="py-2">{statusBadge(req.status)}</td>
                                            <td className="py-2 cursor-pointer flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800" title="View Details">
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-800" title="Approve">
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800" title="Reject">
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Static Modal Example (UI only, always visible for demo) */}
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white w-full max-w-lg p-8 rounded shadow-lg">
                        <div className="border-b pb-4 mb-4 text-center">
                            <h2 className="text-xl font-bold">Request Details</h2>
                        </div>
                        <div className="mb-4">
                            <div className="mb-2"><span className="font-semibold">Full Name:</span> Juan Dela Cruz</div>
                            <div className="mb-2"><span className="font-semibold">Student ID:</span> 2024-0001</div>
                            <div className="mb-2"><span className="font-semibold">Course/Program:</span> BS Computer Science</div>
                            <div className="mb-2"><span className="font-semibold">Type of Request:</span> Transfer Out</div>
                            <div className="mb-2"><span className="font-semibold">Reason/Notes:</span>
                                <div className="bg-gray-50 border rounded p-2 mt-1 text-sm text-black">Family is moving to another city.</div>
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Uploaded Document:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                    <FileText className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm text-blue-700 underline cursor-pointer">transfer_form.pdf</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-8">
                            <button className="bg-green-600 text-white cursor-pointer px-4 py-2 rounded flex items-center space-x-2 hover:bg-green-700">
                                <CheckCircle className="h-5 w-5" /> <span>Approve</span>
                            </button>
                            <button className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-700">
                                <XCircle className="h-5 w-5" /> <span>Reject</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* End Modal Example */}
            </div>
        </div>
    );
} 