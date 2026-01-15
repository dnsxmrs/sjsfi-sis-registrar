"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

interface YearLevel {
    id: number;
    name: string;
}

interface AddYearLevelToTermModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableYearLevels: YearLevel[];
    termName: string;
    onSubmit: (yearLevelIds: number[]) => Promise<{ success: boolean; error?: string }>;
}

export default function AddYearLevelToTermModal({
    isOpen,
    onClose,
    availableYearLevels,
    termName,
    onSubmit,
}: AddYearLevelToTermModalProps) {
    const [selectedYearLevelIds, setSelectedYearLevelIds] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    if (!isOpen) return null;

    const handleToggleYearLevel = (yearLevelId: number) => {
        const newSelected = new Set(selectedYearLevelIds);
        if (newSelected.has(yearLevelId)) {
            newSelected.delete(yearLevelId);
            setSelectAll(false);
        } else {
            newSelected.add(yearLevelId);
            if (newSelected.size === availableYearLevels.length) {
                setSelectAll(true);
            }
        }
        setSelectedYearLevelIds(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedYearLevelIds(new Set(availableYearLevels.map(yl => yl.id)));
        } else {
            setSelectedYearLevelIds(new Set());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (selectedYearLevelIds.size === 0) {
            setError("Please select at least one year level");
            return;
        }

        setIsSubmitting(true);
        const selectedIds = Array.from(selectedYearLevelIds);
        
        // Pass all selected IDs at once for batch processing
        const result = await onSubmit(selectedIds);
        
        if (!result.success) {
            setError(result.error || "Failed to add year levels");
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-black">Add Year Level to {termName}</h2>
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

                    {availableYearLevels.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-2">No available year levels to add</p>
                            <p className="text-sm text-gray-500">All year levels have been added to this term</p>
                        </div>
                    ) : (
                        <>
                            {/* Select All Checkbox */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={isSubmitting}
                                        className="w-4 h-4 text-red-800 border-gray-300 rounded focus:ring-red-800 focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        Add all year levels ({availableYearLevels.length})
                                    </span>
                                </label>
                            </div>

                            {/* Individual Year Level Checkboxes */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Select Year Level(s) *
                                </label>
                                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                                    {availableYearLevels.map((yearLevel) => (
                                        <label
                                            key={yearLevel.id}
                                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedYearLevelIds.has(yearLevel.id)}
                                                onChange={() => handleToggleYearLevel(yearLevel.id)}
                                                disabled={isSubmitting}
                                                className="w-4 h-4 text-red-800 border-gray-300 rounded focus:ring-red-800 focus:ring-2"
                                            />
                                            <span className="ml-3 text-sm text-gray-900">{yearLevel.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {selectedYearLevelIds.size} of {availableYearLevels.length} selected
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
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
                                    disabled={isSubmitting || selectedYearLevelIds.size === 0}
                                    className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting 
                                        ? `Adding ${selectedYearLevelIds.size} year level(s)...` 
                                        : `Add ${selectedYearLevelIds.size} Year Level${selectedYearLevelIds.size !== 1 ? 's' : ''}`
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
