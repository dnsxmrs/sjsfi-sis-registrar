'use client';

import { Edit } from "lucide-react";
import dynamic from 'next/dynamic';

const EditPolicyModal = dynamic(() => import('@/components/admin/EditPolicyModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

import { useState, useEffect } from "react";
import { getGeneralPolicy, saveGeneralPolicy } from '@/app/_actions/generalPolicyActions';
import toast from "react-hot-toast";


export default function AcademicSettingsPage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyText, setPolicyText] = useState('');

  // Fetch general policy on component mount
  useEffect(() => {
    fetchGeneralPolicy();
  }, []);

  const fetchGeneralPolicy = async () => {
    try {
      setPolicyLoading(true);
      const result = await getGeneralPolicy();
      if (result.success && result.policy) {
        setPolicyText(result.policy.content || '');
      } else {
        setPolicyText('<p>No general policy has been set yet. Click "Edit" to add one.</p>');
      }
    } catch (error) {
      console.error('Error fetching general policy:', error);
      setPolicyText('<p>Error loading policy. Please try again.</p>');
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleSavePolicy = async (updatedText: string) => {
    try {
      const result = await saveGeneralPolicy(updatedText);
      if (result.success) {
        setPolicyText(updatedText);
        toast.success('Policy saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save policy');
      }
    } catch {
      toast.error('Error saving policy. Please try again.');
    }
  };

  return (
    <div className="p-6 md:p-10 h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-2/3 flex flex-col gap-6 h-full">
          {/* General Policy Section */}
          <div className="bg-white border border-red-800 rounded-md p-4 flex flex-col h-1/2">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">General Policy and Guidelines</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-red-800 cursor-pointer hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Edit size={16} /> Edit
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {policyLoading ? (
                <div className="text-sm text-gray-500 text-center pt-6">Loading policy...</div>
              ) : (
                <div
                  className="text-gray-700 text-sm leading-relaxed border border-red-300 rounded-md p-3 rich-content"
                  dangerouslySetInnerHTML={{ __html: policyText }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <EditPolicyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        policyText={policyText}
        onSave={handleSavePolicy}
      />
    </div>
  );
}
