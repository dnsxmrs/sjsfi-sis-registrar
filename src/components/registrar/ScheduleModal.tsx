"use client";

import { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";

interface TermSubject {
    id: number;
    subjectId: number;
    subject: {
        id: number;
        code: string;
        name: string;
    };
}

interface Section {
    id: number;
    name: string;
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "add" | "edit";
    termSubjects: TermSubject[];
    sections: Section[];
    initialData?: {
        id: number;
        termSubjectId: number;
        sectionId?: number | null;
        day: string;
        startTime: string;
        endTime: string;
        room: string;
    };
    onSubmit: (data: {
        id?: number;
        termSubjectId: number;
        sectionId?: number | null;
        day: string;
        startTime: string;
        endTime: string;
        room: string;
    }) => Promise<{ success: boolean; error?: string }>;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleModal({
    isOpen,
    onClose,
    mode,
    termSubjects,
    sections,
    initialData,
    onSubmit,
}: ScheduleModalProps) {
    const [termSubjectId, setTermSubjectId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [day, setDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [room, setRoom] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [conflictWarning, setConflictWarning] = useState("");
    const termSubjectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && initialData) {
                setTermSubjectId(initialData.termSubjectId.toString());
                setSectionId(initialData.sectionId?.toString() || "");
                setDay(initialData.day);
                setStartTime(initialData.startTime);
                setEndTime(initialData.endTime);
                setRoom(initialData.room);
            } else {
                setTermSubjectId("");
                setSectionId("");
                setDay("");
                setStartTime("");
                setEndTime("");
                setRoom("");
            }
            setError("");
            setConflictWarning("");
            setTimeout(() => termSubjectRef.current?.focus(), 100);
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const validateTimeRange = () => {
        if (startTime && endTime && startTime >= endTime) {
            setError("End time must be after start time");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setConflictWarning("");

        if (!termSubjectId) {
            setError("Please select a subject");
            return;
        }

        if (!day) {
            setError("Please select a day");
            return;
        }

        if (!startTime || !endTime) {
            setError("Please provide start and end times");
            return;
        }

        if (!validateTimeRange()) {
            return;
        }

        if (!room.trim()) {
            setError("Room is required");
            return;
        }

        setIsSubmitting(true);
        const result = await onSubmit({
            ...(mode === "edit" && initialData && { id: initialData.id }),
            termSubjectId: parseInt(termSubjectId),
            sectionId: sectionId ? parseInt(sectionId) : null,
            day,
            startTime,
            endTime,
            room: room.trim(),
        });

        if (!result.success) {
            if (result.error?.includes("conflict")) {
                setConflictWarning(result.error);
            } else {
                setError(result.error || "Failed to save schedule");
            }
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-black">
                        {mode === "add" ? "Add Schedule" : "Edit Schedule"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-black hover:text-gray-700 transition-colors"
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

                    {conflictWarning && (
                        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{conflictWarning}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                        {/* Subject */}
                        <div className="md:col-span-2">
                            <label htmlFor="termSubject" className="block text-sm font-medium text-black mb-2">
                                Subject *
                            </label>
                            <select
                                ref={termSubjectRef}
                                id="termSubject"
                                value={termSubjectId}
                                onChange={(e) => setTermSubjectId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                disabled={isSubmitting || mode === "edit"}
                            >
                                <option value="">Select a subject</option>
                                {termSubjects.map((ts) => (
                                    <option key={ts.id} value={ts.id}>
                                        {ts.subject.code} - {ts.subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section (Optional) */}
                        <div className="md:col-span-2">
                            <label htmlFor="section" className="block text-sm font-medium text-black mb-2">
                                Section (Optional)
                            </label>
                            <select
                                id="section"
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                disabled={isSubmitting}
                            >
                                <option value="">No specific section</option>
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Leave empty if not section-specific</p>
                        </div>

                        {/* Day */}
                        <div>
                            <label htmlFor="day" className="block text-sm font-medium text-black mb-2">
                                Day *
                            </label>
                            <select
                                id="day"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                disabled={isSubmitting}
                            >
                                <option value="">Select day</option>
                                {DAYS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Room */}
                        <div>
                            <label htmlFor="room" className="block text-sm font-medium text-black mb-2">
                                Room *
                            </label>
                            <input
                                type="text"
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                placeholder="e.g., Room 201, Lab 3"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-black mb-2">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    setError("");
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-black mb-2">
                                End Time *
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                    setError("");
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Saving..." : mode === "add" ? "Create Schedule" : "Update Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
