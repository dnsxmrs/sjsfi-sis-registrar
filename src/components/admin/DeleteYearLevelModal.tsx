'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface YearLevel {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface DeleteYearLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    yearLevel: YearLevel | null;
    onDelete: (id: number) => Promise<{ success: boolean; error?: string }>;
}

const DeleteYearLevelModal: React.FC<DeleteYearLevelModalProps> = ({
    isOpen,
    onClose,
    yearLevel,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !yearLevel) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await onDelete(yearLevel.id);
            if (result.success) {
                onClose();
            }
        } catch (error) {
            console.error('Error deleting year level:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900">Delete Year Level</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                            disabled={isDeleting}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Warning Section */}
                    <div className="mb-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-red-800">Warning</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        You are about to permanently delete the year level <strong>&ldquo;{yearLevel.name}&rdquo;</strong>.
                                        This action cannot be undone and may affect existing registrations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Year Level Details */}
                    <div className="mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="col-span-1">
                                    <span className="font-medium text-gray-700">Year Level:</span>
                                    <div className="text-gray-900 font-semibold">{yearLevel.name}</div>
                                </div>
                                {/* <div>
                                    <span className="font-medium text-gray-700">ID:</span>
                                    <div className="text-gray-900">{yearLevel.id}</div>
                                </div> */}
                                <div className="col-span-1">
                                    <span className="font-medium text-gray-700">Created:</span>
                                    <div className="text-gray-900">{new Date(yearLevel.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Year Level</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteYearLevelModal;
