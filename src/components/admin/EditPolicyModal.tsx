'use client';

import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

interface EditPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyText: string;
  onSave: (updatedText: string) => void;
}

export default function EditPolicyModal({ isOpen, onClose, policyText, onSave }: EditPolicyModalProps) {
  const [text, setText] = useState(policyText);
  const [isLoading, setIsLoading] = useState(false);

  // Update text when policyText prop changes or when modal opens
  useEffect(() => {
    if (isOpen) {
      setText(policyText);
    }
  }, [isOpen, policyText]);

  const handleClose = () => {
    setText(policyText); // Reset to original text
    onClose();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(text);
      onClose();
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-center text-black mb-2">Edit General Policy</h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Edit the policy details below. These changes will apply across the system.
        </p>

        <div className="flex-1 overflow-hidden">
          <RichTextEditor
            value={text}
            onChange={setText}
            placeholder="Enter your general policy content here..."
            className="h-full text-black"
          />
        </div>

        <div className="mt-6 flex justify-center gap-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
