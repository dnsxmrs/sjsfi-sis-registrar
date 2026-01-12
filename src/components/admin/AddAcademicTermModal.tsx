import React, { useEffect, useRef, useState } from "react";

type AddAcademicTermModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    year: string;
    startDate: Date;
    endDate: Date;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  }) => Promise<{ success: boolean; error?: string }>;
};

export default function AddAcademicTermModal({ isOpen, onClose, onAdd }: AddAcademicTermModalProps) {
  const [formData, setFormData] = useState({
    year: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE" as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.year || !formData.startDate || !formData.endDate) {
      setError("All fields are required");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    try {
      const result = await onAdd({
        year: formData.year,
        startDate,
        endDate,
        status: formData.status
      });

      if (result.success) {
        // Reset form and close modal
        setFormData({
          year: "",
          startDate: "",
          endDate: "",
          status: "ACTIVE"
        });
        setError("");
        onClose();
      } else {
        setError(result.error || "Failed to add academic term");
      }
    } catch {
      setError("An error occurred while adding the academic term");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      year: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE"
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-gray-700 text-xl font-bold text-center mb-4">Add Academic Term</h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Term:</label>
            <input
              ref={inputRef}
              type="text"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              placeholder="2024–2025"
              className="text-gray-700 w-full border border-red-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="text-gray-700 cursor-pointer w-full border border-red-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="text-gray-700 cursor-pointer w-full border border-red-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED' }))}
              className="text-gray-700 cursor-pointer w-full border border-red-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 cursor-pointer hover:bg-green-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
