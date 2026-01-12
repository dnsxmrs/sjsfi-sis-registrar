"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    getSubjectsForYearLevel,
    getAvailableSubjects,
    attachSubjectsToYearLevel,
    updateSubjectRequirement,
    removeSubjectFromYearLevel,
} from "@/app/_actions/termSubjectActions";

interface Subject {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    units: number;
}

interface AttachedSubject {
    id: number;
    subjectId: number;
    isRequired: boolean;
    subject: Subject;
}

interface ConfigureSubjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
    termYearLevelId: number;
    onRefresh: () => void;
}

export default function ConfigureSubjectsModal({
    isOpen,
    onClose,
    termYearLevelId,
    onRefresh,
}: ConfigureSubjectsModalProps) {
    const [attachedSubjects, setAttachedSubjects] = useState<AttachedSubject[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setSearchTerm("");
            setSelectedSubjectIds([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, termYearLevelId]);

    async function fetchData() {
        setLoading(true);
        try {
            const [attachedResult, availableResult] = await Promise.all([
                getSubjectsForYearLevel(termYearLevelId),
                getAvailableSubjects(termYearLevelId),
            ]);

            if (attachedResult.success) {
                setAttachedSubjects(attachedResult.data as AttachedSubject[]);
            }

            if (availableResult.success) {
                setAvailableSubjects(availableResult.data as Subject[]);
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    const handleToggleRequired = async (termSubjectId: number, currentStatus: boolean) => {
        const result = await updateSubjectRequirement(termSubjectId, !currentStatus);
        if (result.success) {
            await fetchData();
            toast.success(`Subject marked as ${!currentStatus ? "required" : "optional"}`);
        } else {
            toast.error(result.error || "Failed to update subject");
        }
    };

    const handleRemove = async (termSubjectId: number) => {
        const result = await removeSubjectFromYearLevel(termSubjectId);
        if (result.success) {
            await fetchData();
            onRefresh();
            toast.success("Subject removed successfully");
        } else {
            toast.error(result.error || "Failed to remove subject");
        }
    };

    const handleToggleSubject = (subjectId: number) => {
        setSelectedSubjectIds((prev) =>
            prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
        );
    };

    const handleAttachSubjects = async () => {
        if (selectedSubjectIds.length === 0) {
            toast.error("Please select at least one subject");
            return;
        }

        setIsSubmitting(true);
        const result = await attachSubjectsToYearLevel(termYearLevelId, selectedSubjectIds);

        if (result.success) {
            await fetchData();
            onRefresh();
            setSelectedSubjectIds([]);
            setSearchTerm("");
            toast.success("Subjects attached successfully");
        } else {
            toast.error(result.error || "Failed to attach subjects");
        }
        setIsSubmitting(false);
    };

    const filteredAvailableSubjects = availableSubjects.filter(
        (subject) =>
            subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-black">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Configure Subjects</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage subjects for this year level</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-red-800" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* Currently Attached Subjects */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Attached Subjects ({attachedSubjects.length})
                                </h3>
                                {attachedSubjects.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        No subjects attached yet
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {attachedSubjects.map((ts) => (
                                            <div
                                                key={ts.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">
                                                        {ts.subject.code} - {ts.subject.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{ts.subject.units} units</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={ts.isRequired}
                                                            onChange={() => handleToggleRequired(ts.id, ts.isRequired)}
                                                            className="w-4 h-4 text-red-800 focus:ring-red-800"
                                                        />
                                                        <span className="text-sm text-gray-700">Required</span>
                                                    </label>
                                                    <button
                                                        onClick={() => handleRemove(ts.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add New Subjects */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Available Subjects ({availableSubjects.length})
                                </h3>

                                {/* Search */}
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search subjects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                        />
                                    </div>
                                </div>

                                {/* Available Subjects List */}
                                {availableSubjects.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                        All subjects have been attached
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                                            {filteredAvailableSubjects.map((subject) => (
                                                <label
                                                    key={subject.id}
                                                    className="flex items-center p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubjectIds.includes(subject.id)}
                                                        onChange={() => handleToggleSubject(subject.id)}
                                                        className="w-4 h-4 text-red-800 focus:ring-red-800 mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {subject.code} - {subject.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{subject.units} units</div>
                                                        {subject.description && (
                                                            <div className="text-xs text-gray-500 mt-1">{subject.description}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {selectedSubjectIds.length > 0 && (
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <span className="text-sm text-blue-800">
                                                    {selectedSubjectIds.length} subject(s) selected
                                                </span>
                                                <button
                                                    onClick={handleAttachSubjects}
                                                    disabled={isSubmitting}
                                                    className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900 transition-colors disabled:bg-gray-400 text-sm"
                                                >
                                                    {isSubmitting ? "Attaching..." : "Attach Selected"}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isSubmitting}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
