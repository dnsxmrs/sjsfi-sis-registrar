"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Section {
  id: number;
  name: string;
  capacity: number;
  currentStudents: number;
  status: string;
}

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  onEdit: (id: number, name: string, capacity: number, status: string) => Promise<{ success: boolean; error?: string }>;
}

export default function EditSectionModal({ isOpen, onClose, section, onEdit }: EditSectionModalProps) {
  const [name, setName] = useState(section?.name || "");
  const [capacity, setCapacity] = useState(section?.capacity.toString() || "");
  const [status, setStatus] = useState(section?.status || "ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !section) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Section name is required");
      return;
    }

    const capacityNum = parseInt(capacity);
    if (!capacity || capacityNum < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    if (capacityNum < section.currentStudents) {
      setError(`Capacity cannot be lower than current student count (${section.currentStudents})`);
      return;
    }

    setIsSubmitting(true);
    const result = await onEdit(section.id, name.trim(), capacityNum, status);

    if (!result.success) {
      setError(result.error || "Failed to update section");
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Section</h2>
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
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              placeholder="e.g., Section A, Section 1"
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min={section.currentStudents}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              placeholder="e.g., 40"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Current students: {section.currentStudents} (minimum capacity)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              disabled={isSubmitting}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
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
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? "Updating..." : "Update Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
