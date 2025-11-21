'use client';

import { useEffect, useState } from 'react';
import { getRegistrationCodes } from '@/app/_actions/getRegistrationCodes';

interface RegistrationCode {
    id: number;
    registrationCode: string;
    status: string;
    expirationDate: Date | null;
    createdAt: Date;
}

interface CodeData {
    available: RegistrationCode[];
    inactive: RegistrationCode[];
    expired: RegistrationCode[];
}

export default function CodeManagement() {
    const [codes, setCodes] = useState<CodeData>({
        available: [],
        inactive: [],
        expired: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCodes = async () => {
            setIsLoading(true);
            try {
                const result = await getRegistrationCodes();
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

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const CodeColumn = ({ title, codes, bgColor }: { title: string; codes: RegistrationCode[]; bgColor: string }) => (
        <div className="bg-white rounded-lg shadow flex-1 min-w-[300px]">
            <div className={`${bgColor} text-white p-4 rounded-t-lg`}>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-2xl font-bold mt-1">{codes.length}</p>
            </div>
            <div className="p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                {codes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No codes found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {codes.map((code) => (
                            <div key={code.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-mono text-sm font-semibold text-gray-800">
                                        {code.registrationCode}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(code.createdAt)}
                                    </div>
                                </div>
                                {code.expirationDate && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Expires: {formatDate(code.expirationDate)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className=" bg-gray-100 py-6 pt-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-900">Code Management</h1>
                    <p className="text-gray-600 mt-1">View and manage registration codes</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center space-y-4">
                            <div className="animate-spin h-12 w-12 border-4 border-red-800 border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-gray-600">Loading codes...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <CodeColumn
                            title="Available Codes"
                            codes={codes.available}
                            bgColor="bg-green-600"
                        />
                        <CodeColumn
                            title="Inactive Codes"
                            codes={codes.inactive}
                            bgColor="bg-gray-600"
                        />
                        <CodeColumn
                            title="Expired Codes"
                            codes={codes.expired}
                            bgColor="bg-red-600"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}