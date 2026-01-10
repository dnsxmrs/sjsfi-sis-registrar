'use client';

import { Plus, Edit, Trash2 } from "lucide-react";
import AddAcademicTermModal from '@/components/admin/AddAcademicTermModal';
import AddYearLevelModal from '@/components/admin/AddYearLevelModal';
import EditYearLevelModal from '@/components/admin/EditYearLevelModal';
import DeleteYearLevelModal from '@/components/admin/DeleteYearLevelModal';
import dynamic from 'next/dynamic';

const EditPolicyModal = dynamic(() => import('@/components/admin/EditPolicyModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
import { useState, useEffect } from "react";
import { getSchoolAllYears } from '@/app/_actions/getSchoolYears';
import { getYearLevels } from '@/app/_actions/getYearLevels';
import { addYearLevel, updateYearLevel, deleteYearLevel } from '@/app/_actions/yearLevelActions';
import { getGeneralPolicy, saveGeneralPolicy } from '@/app/_actions/generalPolicyActions';
import { addAcademicTerm, updateAcademicTerm, deleteAcademicTerm } from '@/app/_actions/academicTermActions';
import toast from "react-hot-toast";

interface SchoolYear {
  id: number;
  year: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface YearLevel {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export default function AcademicSettingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAddYearLevelModal, setShowAddYearLevelModal] = useState(false);
  const [showEditYearLevelModal, setShowEditYearLevelModal] = useState(false);
  const [showDeleteYearLevelModal, setShowDeleteYearLevelModal] = useState(false);

  const [selectedYearLevel, setSelectedYearLevel] = useState<YearLevel | null>(null);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearLevelsLoading, setYearLevelsLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyText, setPolicyText] = useState('');

  // Fetch school years on component mount
  useEffect(() => {
    fetchSchoolYears();
  }, []);

  async function fetchSchoolYears() {
    try {
      setLoading(true);
      const result = await getSchoolAllYears();
      if (result.success) {
        setSchoolYears(result.schoolYears || []);
      }
    } catch (error) {
      console.error('Error fetching school years:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch year levels on component mount
  useEffect(() => {
    fetchYearLevels();
  }, []);

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

  const fetchYearLevels = async () => {
    try {
      setYearLevelsLoading(true);
      const result = await getYearLevels();
      if (result.success) {
        setYearLevels(result.yearLevels || []);
      }
    } catch (error) {
      console.error('Error fetching year levels:', error);
    } finally {
      setYearLevelsLoading(false);
    }
  };

  const handleAddYearLevel = async (name: string) => {
    const result = await addYearLevel(name);
    if (result.success) {
      await fetchYearLevels(); // Refresh the list
      setShowAddYearLevelModal(false);
      toast.success('Year level added successfully!');
    }
    return result;
  };

  const handleEditYearLevel = async (id: number, name: string) => {
    const result = await updateYearLevel(id, name);
    if (result.success) {
      await fetchYearLevels(); // Refresh the list
      setShowEditYearLevelModal(false);
      setSelectedYearLevel(null);
      toast.success('Year level updated successfully!');
    }
    return result;
  };

  const handleDeleteYearLevel = async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await deleteYearLevel(id);
      if (result.success) {
        await fetchYearLevels(); // Refresh the list
        setShowDeleteYearLevelModal(false);
        setSelectedYearLevel(null);
        toast.success('Year level deleted successfully!');
        return { success: true };
      } else {
        toast.error(result.error || 'Failed to delete year level');
        return { success: false, error: result.error || 'Failed to delete year level' };
      }
    } catch (error) {
      console.error('Error deleting year level:', error);
      const errorMessage = 'An error occurred while deleting the year level';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Academic Term action handlers
  const handleAcademicTermAction = async (action: string, termId: number) => {
    try {
      switch (action) {
        case 'edit':
          // TODO: Implement edit modal/form for academic term
          console.log('Edit academic term:', termId);
          break;
        case 'cancel':
        case 'suspend':
          await updateAcademicTermStatus(termId, 'SUSPENDED');
          break;
        case 'reactivate':
          await updateAcademicTermStatus(termId, 'ACTIVE');
          break;
        case 'complete':
          await updateAcademicTermStatus(termId, 'INACTIVE');
          break;
        case 'archive':
          await updateAcademicTermStatus(termId, 'ARCHIVED');
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this academic term? This action cannot be undone.')) {
            await deleteAcademicTermHandler(termId);
          }
          break;
        case 'view':
          // TODO: Implement view details modal
          console.log('View academic term details:', termId);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Academic term action failed:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  const updateAcademicTermStatus = async (termId: number, newStatus: string) => {
    try {
      const result = await updateAcademicTerm(termId, {
        status: newStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED'
      });

      if (result.success) {
        await fetchSchoolYears(); // Refresh the data
        toast.success('Academic term status updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update academic term status');
      }
    } catch (error) {
      console.error('Error updating academic term status:', error);
      toast.error('An error occurred while updating the academic term status');
    }
  };

  const deleteAcademicTermHandler = async (termId: number) => {
    try {
      const result = await deleteAcademicTerm(termId);

      if (result.success) {
        await fetchSchoolYears(); // Refresh the data
        toast.success('Academic term deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete academic term');
      }
    } catch (error) {
      console.error('Error deleting academic term:', error);
      toast.error('An error occurred while deleting the academic term');
    }
  };

  const openEditYearLevelModal = (yearLevel: YearLevel) => {
    setSelectedYearLevel(yearLevel);
    setShowEditYearLevelModal(true);
  };

  const openDeleteYearLevelModal = (yearLevel: YearLevel) => {
    setSelectedYearLevel(yearLevel);
    setShowDeleteYearLevelModal(true);
  };

  const handleAddAcademicTerm = async (data: {
    year: string;
    startDate: Date;
    endDate: Date;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  }) => {
    const result = await addAcademicTerm(data);
    if (result.success) {
      await fetchSchoolYears(); // Refresh the list
      setShowAddModal(false);
      toast.success('Academic term added successfully!');
    } else {
      toast.error(result.error || 'Failed to add academic term');
    }
    return result;
  };

  return (
    <div className="p-6 md:p-10 h-screen overflow-hidden">
      <AddAcademicTermModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAcademicTerm}
      />

      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-2/3 flex flex-col gap-6 h-full">
          {/* Academic Term Section */}
          <div className="bg-white border border-red-800 rounded-md p-4 flex flex-col h-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Academic Term</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-800 cursor-pointer hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-white border-b">
                  <tr className="text-gray-700">
                    <th className="px-3 py-2">Academic Term</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 items-center justify-start">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="text-gray-700">
                      <td colSpan={4} className="px-3 py-8 text-center border-t">
                        Loading academic terms...
                      </td>
                    </tr>
                  ) : schoolYears.length === 0 ? (
                    <tr className="text-gray-700">
                      <td colSpan={4} className="px-3 py-8 text-center border-t text-gray-500">
                        No academic terms found
                      </td>
                    </tr>
                  ) : (
                    schoolYears.map((schoolYear) => {
                      const startDate = new Date(schoolYear.startDate);
                      const endDate = new Date(schoolYear.endDate);
                      const currentDate = new Date();

                      // Determine actual status based on dates and stored status
                      let statusDisplay = '';
                      let statusColor = '';
                      let actionButtons = null;

                      if (schoolYear.status === 'ACTIVE') {
                        if (currentDate < startDate) {
                          statusDisplay = 'Upcoming';
                          statusColor = 'bg-blue-100 text-blue-800';
                          actionButtons = (
                            <>
                              {/* <button
                                onClick={() => handleAcademicTermAction('edit', schoolYear.id)}
                                className="mr-2 text-blue-600 hover:text-blue-800 hover:underline text-xs"
                              >
                                Edit
                              </button> */}
                              <button
                                onClick={() => handleAcademicTermAction('cancel', schoolYear.id)}
                                className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          );
                        } else if (currentDate >= startDate && currentDate <= endDate) {
                          statusDisplay = 'Ongoing';
                          statusColor = 'bg-green-100 text-green-800';
                          actionButtons = (
                            <>
                              <button
                                onClick={() => handleAcademicTermAction('complete', schoolYear.id)}
                                className="mr-2 cursor-pointer text-yellow-600 hover:text-yellow-800 hover:underline text-xs"
                              >
                                Finish Early
                              </button>
                              <button
                                onClick={() => handleAcademicTermAction('suspend', schoolYear.id)}
                                className="text-orange-600 cursor-pointer hover:text-orange-800 hover:underline text-xs"
                              >
                                Suspend
                              </button>
                            </>
                          );
                        } else {
                          // Past end date but still marked as active
                          statusDisplay = 'Overdue';
                          statusColor = 'bg-orange-100 text-orange-800';
                          actionButtons = (
                            <>
                              <button
                                onClick={() => handleAcademicTermAction('complete', schoolYear.id)}
                                className="mr-2 cursor-pointer text-green-600 hover:text-green-800 hover:underline text-xs"
                              >
                                Mark Complete
                              </button>
                              <button
                                onClick={() => handleAcademicTermAction('delete', schoolYear.id)}
                                className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                              >
                                Delete
                              </button>
                            </>
                          );
                        }
                      } else if (schoolYear.status === 'INACTIVE') {
                        statusDisplay = 'Completed';
                        statusColor = 'bg-gray-100 text-gray-800';
                        actionButtons = (
                          <span className="text-xs text-gray-500">No actions available</span>
                        );
                      } else if (schoolYear.status === 'SUSPENDED') {
                        statusDisplay = 'Suspended';
                        statusColor = 'bg-red-100 text-red-800';
                        actionButtons = (
                          <>
                            <button
                              onClick={() => handleAcademicTermAction('reactivate', schoolYear.id)}
                              className="mr-2 cursor-pointer text-green-600 hover:text-green-800 hover:underline text-xs"
                            >
                              Reactivate
                            </button>
                            <button
                              onClick={() => handleAcademicTermAction('delete', schoolYear.id)}
                              className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                            >
                              Delete
                            </button>
                          </>
                        );
                      } else if (schoolYear.status === 'ARCHIVED') {
                        statusDisplay = 'Archived';
                        statusColor = 'bg-gray-100 text-gray-600';
                        actionButtons = (
                          <span className="text-xs text-gray-500">No actions available</span>
                        );
                      } else {
                        // Default fallback
                        statusDisplay = schoolYear.status;
                        statusColor = 'bg-gray-100 text-gray-800';
                        actionButtons = (
                          <span className="text-xs text-gray-500">N/A</span>
                        );
                      }

                      return (
                        <tr key={schoolYear.id} className="text-gray-700 hover:bg-gray-50">
                          <td className="px-3 py-2 border-t">
                            <div>
                              <div className="font-medium">{schoolYear.year}</div>
                              {/* <div className="text-xs text-gray-500">
                                ID: {schoolYear.id}
                              </div> */}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-t">
                            <div className="text-xs">
                              <div className="font-medium">
                                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 border-t">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                              {statusDisplay}
                            </span>
                            {currentDate >= startDate && currentDate <= endDate && schoolYear.status === 'ACTIVE' && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} days left
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm border-t">
                            <div className="flex flex-col gap-1 justify-start items-start">
                              {actionButtons}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

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

        <div className="md:w-1/3 flex flex-col gap-6 h-full">
          {/* Right Column: Year Level Management */}
          <div className="w-full h-1/2">
            <div className="bg-white border border-red-800 rounded-md p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Year Level</h2>
                <button
                  onClick={() => setShowAddYearLevelModal(true)}
                  className="bg-red-800 cursor-pointer hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {yearLevelsLoading ? (
                  <div className="text-sm text-gray-500 text-center pt-6">Loading year levels...</div>
                ) : yearLevels.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center pt-6">No year levels found</div>
                ) : (
                  <div className="space-y-2">
                    {yearLevels.map((yearLevel) => (
                      <div key={yearLevel.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm text-gray-700 font-medium">{yearLevel.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditYearLevelModal(yearLevel)}
                            className="p-1 cursor-pointer text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => openDeleteYearLevelModal(yearLevel)}
                            className="p-1 cursor-pointer text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

      <AddYearLevelModal
        isOpen={showAddYearLevelModal}
        onClose={() => setShowAddYearLevelModal(false)}
        onAdd={handleAddYearLevel}
      />

      <EditYearLevelModal
        isOpen={showEditYearLevelModal}
        onClose={() => {
          setShowEditYearLevelModal(false);
          setSelectedYearLevel(null);
        }}
        yearLevel={selectedYearLevel}
        onEdit={handleEditYearLevel}
      />

      <DeleteYearLevelModal
        isOpen={showDeleteYearLevelModal}
        onClose={() => {
          setShowDeleteYearLevelModal(false);
          setSelectedYearLevel(null);
        }}
        yearLevel={selectedYearLevel}
        onDelete={handleDeleteYearLevel}
      />

    </div>
  );
}
