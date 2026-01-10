import React, { useState } from "react";

type AddYearLevelModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => Promise<{ success: boolean; error?: string; message?: string }>;
};

export default function AddYearLevelModal({ isOpen, onClose, onAdd }: AddYearLevelModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Year level name is required");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const result = await onAdd(name.trim());
            if (result.success) {
                setName("");
                // Modal will be closed by parent component
            } else {
                setError(result.error || "Failed to add year level");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-600/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-sm">
                <h2 className="text-gray-700 text-xl font-bold text-center mb-4">Add Year Level</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Level Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="e.g., Kinder 1, Grade 1, Grade 7"
                        className="text-gray-700 w-full border border-red-800 px-3 py-2 rounded-md focus:outline-none"
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-green-500 cursor-pointer hover:bg-green-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                    >
                        {isLoading ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}
