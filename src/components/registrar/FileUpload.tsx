'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
    label: string;
    requirementType: string;
    studentId: string;
    onFileSelect: (file: File | null) => void;
    existingFileUrl?: string;
    disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    requirementType,
    onFileSelect,
    existingFileUrl,
    disabled = false,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(existingFileUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only PDF, images, and Word documents are allowed.');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File size exceeds 10MB limit');
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setFileUrl(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleView = () => {
        if (selectedFile) {
            // Create a temporary URL for the file
            const fileURL = URL.createObjectURL(selectedFile);
            window.open(fileURL, '_blank');
        } else if (fileUrl) {
            // If it's already uploaded, use the stored URL
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-black">{label}</label>

            {selectedFile || fileUrl ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-800 truncate">
                                {selectedFile?.name || 'File uploaded'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                        <button
                            onClick={handleView}
                            disabled={disabled}
                            className="cursor-pointer p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                            title="View file"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={disabled}
                            className="cursor-pointer p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                            title="Remove file"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        disabled={disabled}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                        id={`file-${requirementType}`}
                    />
                    <label
                        htmlFor={`file-${requirementType}`}
                        className={`flex items-center justify-center space-x-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            disabled
                                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                    >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Click to select file</span>
                    </label>
                </div>
            )}
        </div>
    );
};
