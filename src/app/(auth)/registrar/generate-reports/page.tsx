'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Printer } from 'lucide-react';

const sampleRequests = [
    {
        id: 'REQ-001',
        studentName: 'olala',
        requestedDocument: 'Transcript of Records',
        reason: 'For scholarship application',
        date: '2025-03-28',
    },
    // Add more sample data as needed
];

const PrintPreview: React.FC<{ request: typeof sampleRequests[0], onClose: () => void }> = ({ request, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white w-full max-w-lg p-8 rounded shadow-lg print:shadow-none print:p-0 print:max-w-full">
            <div className="border-b pb-4 mb-4 text-center">
                <h1 className="text-2xl font-bold">SJSFI-SIS Official Document</h1>
                <p className="text-sm text-gray-600">Generated Report</p>
            </div>
            <div className="mb-4 text-black">
                <div className="mb-2"><span className="font-semibold">Student Name:</span> {request.studentName}</div>
                <div className="mb-2"><span className="font-semibold">Requested Document:</span> {request.requestedDocument}</div>
                <div className="mb-2"><span className="font-semibold">Reason of Request:</span> {request.reason}</div>
                <div className="mb-2"><span className="font-semibold">Date:</span> {request.date}</div>
            </div>
            <div className="mt-8 flex flex-col items-end">
                <div className="mb-12 w-1/2 border-b border-gray-400"></div>
                <div className="text-right text-sm text-gray-700">Registrar&apos;s Signature</div>
            </div>
            <div className="mt-8 flex justify-end print:hidden">
                <button onClick={onClose} className="bg-gray-500 cursor-pointer text-white px-4 py-2 rounded mr-2">Close</button>
                <button onClick={() => window.print()} className="bg-red-800 cursor-pointer text-white px-4 py-2 rounded">Print</button>
            </div>
        </div>
    </div>
);

const GenerateReportsPage: React.FC = () => {
    const [requests] = useState(sampleRequests);
    const [printRequest, setPrintRequest] = useState<typeof sampleRequests[0] | null>(null);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {printRequest && <PrintPreview request={printRequest} onClose={() => setPrintRequest(null)} />}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Sidebar placeholder for symmetry, can be replaced with actual sidebar if needed */}
                <aside className="w-full md:w-56 space-y-4 flex-shrink-0 order-1 md:order-2">
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col space-y-3">
                        <label className="block text-sm font-medium text-black px-3">
                            Quick Access Buttons
                        </label>
                        <button className="bg-red-800 cursor-pointer text-white py-2 rounded text-sm hover:bg-red-900">
                            Generate Report
                        </button>
                        <button className="bg-red-800 cursor-pointer text-white py-2 rounded text-sm hover:bg-red-900">
                            Export All
                        </button>
                    </div>
                </aside>
                {/* Main Content */}
                <div className="flex-1 space-y-6 order-2 md:order-1">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4 text-black">Generate Documents</h2>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-300 text-black">
                                    <th className="py-2 font-semibold">Student Name</th>
                                    <th className="py-2 font-semibold">Requested Document</th>
                                    <th className="py-2 font-semibold">Reason of Request</th>
                                    <th className="py-2 font-semibold">Date</th>
                                    <th className="py-2 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">
                                            No requests found
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req, ) => (
                                        <tr key={req.id} className="border-b border-gray-200 text-black hover:bg-gray-50">
                                            <td className="py-2">{req.studentName}</td>
                                            <td className="py-2">{req.requestedDocument}</td>
                                            <td className="py-2">{req.reason}</td>
                                            <td className="py-2">{req.date}</td>
                                            <td className="py-2 cursor-pointer flex space-x-4">
                                                <button title="Accept" className="text-green-600 hover:text-green-800">
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button title="Reject" className="text-red-600 hover:text-red-800">
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                                <button title="Print" className="text-gray-600 hover:text-gray-800" onClick={() => setPrintRequest(req)}>
                                                    <Printer className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateReportsPage;