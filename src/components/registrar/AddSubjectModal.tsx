'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: {
        code: string;
        name: string;
        description: string | null;
        units: number;
    }) => Promise<{ success: boolean; error?: string }>;
}

export default function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [units, setUnits] = useState('3');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const codeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setCode('');
            setName('');
            setDescription('');
            setUnits('3');
            setError('');
            setTimeout(() => codeRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!code.trim() || !name.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const unitsNum = parseInt(units);
        if (isNaN(unitsNum) || unitsNum < 1) {
            setError('Units must be a positive number');
            return;
        }

        setIsSubmitting(true);
        const result = await onAdd({
            code: code.trim().toUpperCase(),
            name: name.trim(),
            description: description.trim() || null,
            units: unitsNum,
        });

        if (!result.success) {
            setError(result.error || 'Failed to add subject');
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Subject</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject Code *
                            </label>
                            <input
                                ref={codeRef}
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-gray-900"
                                placeholder="e.g., MATH101"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-gray-900"
                                placeholder="e.g., Mathematics 1"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-gray-900"
                                placeholder="Brief description of the subject"
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-2">
                                Units *
                            </label>
                            <input
                                id="units"
                                type="number"
                                min="1"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-gray-900"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
