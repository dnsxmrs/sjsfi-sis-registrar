'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Settings, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import SchedulePageModals from '@/components/registrar/SchedulePageModals';
import ManageStudentsModal from '@/components/registrar/ManageStudentsModal';
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule, getSchedulesByTerm, getSchedulesByTermYearLevel } from '@/app/_actions/scheduleActions';
import { getSchoolAllYears } from '@/app/_actions/getSchoolYears';
import { getYearLevels } from '@/app/_actions/getYearLevels';
import { addYearLevel, updateYearLevel, deleteYearLevel } from '@/app/_actions/yearLevelActions';
import { addAcademicTerm, updateAcademicTerm, deleteAcademicTerm } from '@/app/_actions/academicTermActions';
import { getYearLevelsForTerm, addYearLevelToTerm, removeYearLevelFromTerm } from '@/app/_actions/termYearLevelActions';
import { getSubjectsForYearLevel } from '@/app/_actions/termSubjectActions';
import { getSectionsForYearLevel, createSection, updateSection, deleteSection, fetchAndSyncAdvisers, syncSectionAdvisers } from '@/app/_actions/sectionActions';
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from '@/app/_actions/subjectActions';

interface Term {
    id: number;
    year: string;
    startDate: Date;
    endDate: Date;
    status: string;
}

interface YearLevel {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

// Commented out - interface defined but never used
// interface TermYearLevel {
//     id: number;
//     termId: number;
//     yearLevelId: number;
//     yearLevel: YearLevel;
//     _count: {
//         termSubjects: number;
//         sections: number;
//     };
// }

interface Subject {
    id: number;
    code: string;
    name: string;
    description: string | null;
    units: number;
    isActive: boolean;
}

interface TermSubject {
    id: number;
    subjectId: number;
    isRequired: boolean;
    subject: Subject;
}

interface Section {
    id: number;
    name: string;
    capacity: number;
    currentStudents: number;
    status: string;
    advisorFacultyId?: number | null;
    advisorEmployeeId?: string | null;
    advisorFirstName?: string | null;
    advisorLastName?: string | null;
    advisorEmail?: string | null;
    termYearLevel?: {
        academicTermId: number;
        yearLevelId: number;
        academicTerm: {
            year: string;
        };
        yearLevel: {
            name: string;
        };
    };
    _count?: {
        schedules: number;
        studentApplications: number;
    };
}

interface Schedule {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    teacherId: string | null;
    teacherName: string | null;
    teacherEmail: string | null;
    termSubject: {
        id: number;
        subject: Subject;
    };
    section: {
        id: number;
        name: string;
    } | null;
}

export default function SchedulePage() {
    // Data states
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [termYearLevels, setTermYearLevels] = useState<any[]>([]);
    const [termSubjects, setTermSubjects] = useState<TermSubject[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [schedulesLoading, setSchedulesLoading] = useState(true);
    const [termYearLevelsLoading, setTermYearLevelsLoading] = useState(false);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
    const [selectedTermYearLevel, setSelectedTermYearLevel] = useState<number | null>(null);
    const [selectedSection, setSelectedSection] = useState<number | null>(null);

    // Modal states for Terms & Year Levels (existing)
    const [showAddTermModal, setShowAddTermModal] = useState(false);
    const [showAddYearLevelModal, setShowAddYearLevelModal] = useState(false);
    const [showEditYearLevelModal, setShowEditYearLevelModal] = useState(false);
    const [showDeleteYearLevelModal, setShowDeleteYearLevelModal] = useState(false);
    const [selectedYearLevel, setSelectedYearLevel] = useState<YearLevel | null>(null);

    // Modal states for new functionality
    const [showAddYearLevelToTermModal, setShowAddYearLevelToTermModal] = useState(false);
    const [showConfigureSubjectsModal, setShowConfigureSubjectsModal] = useState(false);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [showEditSectionModal, setShowEditSectionModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
    const [showManageStudentsModal, setShowManageStudentsModal] = useState(false);

    // Selected items for modals
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTermYearLevelForConfig, setSelectedTermYearLevelForConfig] = useState<number | null>(null);
    const [selectedSectionForEdit, setSelectedSectionForEdit] = useState<Section | null>(null);
    const [selectedSectionForManage, setSelectedSectionForManage] = useState<Section | null>(null);
    const [selectedScheduleForEdit, setSelectedSchedule] = useState<Schedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name: string } | null>(null);

    const [selectedTab, setSelectedTab] = useState<'schedules' | 'terms' | 'yearLevels' | 'subjects' | 'sections'>('schedules');

    // Initial load: only fetch terms
    useEffect(() => {
        fetchTerms();
    }, []);

    // Tab-based data fetching: load data only when tab is active
    useEffect(() => {
        switch (selectedTab) {
            case 'schedules':
                if (selectedTerm) {
                    fetchSchedulesByTerm(selectedTerm);
                }
                break;
            case 'terms':
                // Terms already loaded on mount
                break;
            case 'yearLevels':
                if (yearLevels.length === 0) {
                    fetchYearLevels();
                }
                break;
            case 'sections':
                if (yearLevels.length === 0) {
                    fetchYearLevels();
                }
                break;
            case 'subjects':
                if (subjects.length === 0) {
                    fetchSubjects();
                }
                break;
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab]);

    useEffect(() => {
        if (selectedTerm) {
            fetchTermYearLevels(selectedTerm);
            // Only fetch schedules if no year level is selected
            if (!selectedTermYearLevel) {
                fetchSchedulesByTerm(selectedTerm);
            }
        }
    }, [selectedTerm, selectedTermYearLevel]);

    useEffect(() => {
        if (selectedTermYearLevel) {
            fetchSections(selectedTermYearLevel);
            fetchTermSubjects(selectedTermYearLevel);
            // Fetch schedules filtered by term year level
            fetchSchedulesByTermYearLevel(selectedTermYearLevel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTermYearLevel]);

    async function fetchSchedules() {
        try {
            setSchedulesLoading(true);
            const result = await getAllSchedules();
            if (result.success) {
                setSchedules(result.data as Schedule[]);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setSchedulesLoading(false);
        }
    }

    async function fetchSchedulesByTerm(termId: number) {
        try {
            setSchedulesLoading(true);
            const result = await getSchedulesByTerm(termId);
            if (result.success) {
                setSchedules(result.data as Schedule[]);
            }
        } catch (error) {
            console.error('Error fetching schedules by term:', error);
        } finally {
            setSchedulesLoading(false);
        }
    }

    async function fetchSchedulesByTermYearLevel(termYearLevelId: number) {
        try {
            setSchedulesLoading(true);
            const result = await getSchedulesByTermYearLevel(termYearLevelId);
            if (result.success) {
                setSchedules(result.data as Schedule[]);
            }
        } catch (error) {
            console.error('Error fetching schedules by term year level:', error);
        } finally {
            setSchedulesLoading(false);
        }
    }

    async function fetchTerms() {
        try {
            setLoading(true);
            const result = await getSchoolAllYears();
            if (result.success) {
                setTerms(result.schoolYears || []);
                // Auto-select first active term
                const activeTerm = (result.schoolYears || []).find((t: Term) => t.status === 'ACTIVE');
                if (activeTerm) {
                    setSelectedTerm(activeTerm.id);
                }
            }
        } catch (error) {
            console.error('Error fetching terms:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchYearLevels() {
        try {
            const result = await getYearLevels();
            if (result.success) {
                setYearLevels(result.yearLevels || []);
            }
        } catch (error) {
            console.error('Error fetching year levels:', error);
        }
    }

    async function fetchTermYearLevels(termId: number) {
        try {
            setTermYearLevelsLoading(true);
            const result = await getYearLevelsForTerm(termId);
            if (result.success) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setTermYearLevels((result.data || []) as any[]);
            }
        } catch (error) {
            console.error('Error fetching term year levels:', error);
        } finally {
            setTermYearLevelsLoading(false);
        }
    }

    async function fetchSections(termYearLevelId: number) {
        try {
            setSectionsLoading(true);

            // First, get the sections
            const result = await getSectionsForYearLevel(termYearLevelId);
            if (result.success) {
                setSections(result.data as Section[]);

                // Find the term and year level info for the API call
                const termYearLevel = termYearLevels.find(tyl => tyl.id === termYearLevelId);
                const term = terms.find(t => t.id === selectedTerm);

                if (termYearLevel && term) {
                    // Pass full grade level name (e.g., "Grade 7") and school year (e.g., "2024-2025")
                    const gradeLevel = termYearLevel.yearLevel.name; // e.g., "Grade 7"
                    const schoolYear = term.year; // e.g., "2024-2025"

                    // Fetch adviser data from HRMS
                    const adviserResult = await fetchAndSyncAdvisers(gradeLevel, schoolYear);

                    if (adviserResult.success && adviserResult.data) {
                        // Sync the adviser data with sections
                        const syncResult = await syncSectionAdvisers(termYearLevelId, adviserResult.data);

                        if (syncResult.success && syncResult.updatedCount && syncResult.updatedCount > 0) {
                            toast.success(`Synced ${syncResult.updatedCount} section adviser(s)`);

                            // Refresh sections to show updated data
                            const refreshResult = await getSectionsForYearLevel(termYearLevelId);
                            if (refreshResult.success) {
                                setSections(refreshResult.data as Section[]);
                            }
                        }
                    } else if (!adviserResult.success && adviserResult.error) {
                        // Don't show error toast for now as this is a background sync
                        console.warn('Could not sync advisers:', adviserResult.error);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setSectionsLoading(false);
        }
    }

    async function fetchTermSubjects(termYearLevelId: number) {
        try {
            const result = await getSubjectsForYearLevel(termYearLevelId);
            if (result.success) {
                setTermSubjects(result.data as TermSubject[]);
            }
        } catch (error) {
            console.error('Error fetching term subjects:', error);
        }
    }

    async function fetchSubjects() {
        try {
            setSubjectsLoading(true);
            const result = await getAllSubjects();
            if (result.success) {
                setSubjects(result.data as Subject[]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setSubjectsLoading(false);
        }
    }

    const handleAddAcademicTerm = async (data: {
        year: string;
        startDate: Date;
        endDate: Date;
        status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
    }) => {
        const result = await addAcademicTerm(data);
        if (result.success) {
            await fetchTerms();
            setShowAddTermModal(false);
            toast.success('Academic term added successfully!');
        } else {
            toast.error(result.error || 'Failed to add academic term');
        }
        return result;
    };

    const handleAcademicTermAction = async (action: string, termId: number) => {
        try {
            switch (action) {
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
                case 'delete':
                    if (confirm('Are you sure you want to delete this academic term?')) {
                        await deleteAcademicTermHandler(termId);
                    }
                    break;
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
                await fetchTerms();
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
                await fetchTerms();
                toast.success('Academic term deleted successfully!');
            } else {
                toast.error(result.error || 'Failed to delete academic term');
            }
        } catch (error) {
            console.error('Error deleting academic term:', error);
            toast.error('An error occurred while deleting the academic term');
        }
    };

    const handleAddYearLevel = async (name: string) => {
        const result = await addYearLevel(name);
        if (result.success) {
            await fetchYearLevels();
            setShowAddYearLevelModal(false);
            toast.success('Year level added successfully!');
        }
        return result;
    };

    const handleEditYearLevel = async (id: number, name: string) => {
        const result = await updateYearLevel(id, name);
        if (result.success) {
            await fetchYearLevels();
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
                await fetchYearLevels();
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

    // New handlers for term-year level management
    const handleAddYearLevelToTerm = async (yearLevelIds: number[]) => {
        if (!selectedTerm) return { success: false, error: 'No term selected' };

        let successCount = 0;
        let failedCount = 0;
        let lastError = "";

        // Process all year levels
        for (const yearLevelId of yearLevelIds) {
            const result = await addYearLevelToTerm(selectedTerm, yearLevelId);
            if (result.success) {
                successCount++;
            } else {
                failedCount++;
                lastError = result.error || 'Failed to add year level';
            }
        }

        // Refresh data once after all additions
        await fetchTermYearLevels(selectedTerm);
        setShowAddYearLevelToTermModal(false);

        // Show single toast notification
        if (failedCount === 0) {
            toast.success(
                yearLevelIds.length === 1
                    ? 'Year level added to term successfully!'
                    : `${successCount} year levels added to term successfully!`
            );
            return { success: true };
        } else if (successCount === 0) {
            toast.error(lastError);
            return { success: false, error: lastError };
        } else {
            toast.error(`Partial success: Added ${successCount} year level(s), but ${failedCount} failed. ${lastError}`);
            return { success: true, error: `${failedCount} failed` };
        }
    };

    const handleRemoveYearLevelFromTerm = async (termYearLevelId: number) => {
        const result = await removeYearLevelFromTerm(termYearLevelId);
        if (result.success) {
            if (selectedTerm) {
                await fetchTermYearLevels(selectedTerm);
            }
            toast.success('Year level removed from term successfully!');
        } else {
            toast.error(result.error || 'Failed to remove year level');
        }
        return result;
    };

    const openConfigureSubjectsModal = (termYearLevelId: number) => {
        setSelectedTermYearLevelForConfig(termYearLevelId);
        setShowConfigureSubjectsModal(true);
    };

    // Section handlers
    const handleAddSection = async (data: { name: string; capacity: number }) => {
        if (!selectedTermYearLevel) return { success: false, error: 'No year level selected' };

        const result = await createSection(selectedTermYearLevel, data.name, data.capacity);
        if (result.success) {
            await fetchSections(selectedTermYearLevel);
            setShowAddSectionModal(false);
            toast.success('Section created successfully!');
        } else {
            toast.error(result.error || 'Failed to create section');
        }
        return result;
    };

    const handleEditSection = async (id: number, name: string, capacity: number, status: string) => {
        const result = await updateSection(id, { name, capacity, status });
        if (result.success) {
            if (selectedTermYearLevel) {
                await fetchSections(selectedTermYearLevel);
            }
            setShowEditSectionModal(false);
            setSelectedSectionForEdit(null);
            toast.success('Section updated successfully!');
        } else {
            toast.error(result.error || 'Failed to update section');
        }
        return result;
    };

    const handleDeleteSection = async (sectionId: number) => {
        const result = await deleteSection(sectionId);
        if (result.success) {
            if (selectedTermYearLevel) {
                await fetchSections(selectedTermYearLevel);
            }
            toast.success('Section deleted successfully!');
        } else {
            toast.error(result.error || 'Failed to delete section');
        }
        return result;
    };

    const openEditSectionModal = (section: Section) => {
        setSelectedSectionForEdit(section);
        setShowEditSectionModal(true);
    };

    const openManageStudentsModal = (section: Section) => {
        setSelectedSectionForManage(section);
        setShowManageStudentsModal(true);
    };

    // Schedule handlers
    const handleScheduleSubmit = async (data: {
        id?: number;
        termSubjectId: number;
        sectionId?: number | null;
        day: string;
        startTime: string;
        endTime: string;
        room: string;
    }) => {
        let result;
        if (data.id) {
            // Edit existing schedule
            result = await updateSchedule(data.id, {
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
                sectionId: data.sectionId,
            });
        } else {
            // Create new schedule
            result = await createSchedule({
                termSubjectId: data.termSubjectId,
                sectionId: data.sectionId,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
            });
        }

        if (result.success) {
            if (selectedTerm) {
                await fetchSchedulesByTerm(selectedTerm);
            } else {
                await fetchSchedules();
            }
            setShowScheduleModal(false);
            setSelectedSchedule(null);
            toast.success(data.id ? 'Schedule updated successfully!' : 'Schedule created successfully!');
        } else {
            toast.error(result.error || 'Failed to save schedule');
        }
        return result;
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        const result = await deleteSchedule(scheduleId);
        if (result.success) {
            if (selectedTerm) {
                await fetchSchedulesByTerm(selectedTerm);
            } else {
                await fetchSchedules();
            }
            toast.success('Schedule deleted successfully!');
        } else {
            toast.error(result.error || 'Failed to delete schedule');
        }
        return result;
    };

    const openEditScheduleModal = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setShowScheduleModal(true);
    };

    // Subject handlers
    const handleAddSubject = async (data: {
        code: string;
        name: string;
        description: string | null;
        units: number;
    }) => {
        const result = await createSubject(data);
        if (result.success) {
            await fetchSubjects();
            setShowAddSubjectModal(false);
            toast.success('Subject created successfully!');
        } else {
            toast.error(result.error || 'Failed to create subject');
        }
        return result;
    };

    const handleEditSubject = async (
        id: number,
        data: {
            code: string;
            name: string;
            description: string | null;
            units: number;
        }
    ) => {
        const result = await updateSubject(id, data);
        if (result.success) {
            await fetchSubjects();
            setShowEditSubjectModal(false);
            setSelectedSubject(null);
            toast.success('Subject updated successfully!');
        } else {
            toast.error(result.error || 'Failed to update subject');
        }
        return result;
    };

    const handleDeleteSubject = async (subjectId: number) => {
        const result = await deleteSubject(subjectId);
        if (result.success) {
            await fetchSubjects();
            toast.success('Subject deleted successfully!');
        } else {
            toast.error(result.error || 'Failed to delete subject');
        }
        return result;
    };

    const openEditSubjectModal = (subject: Subject) => {
        setSelectedSubject(subject);
        setShowEditSubjectModal(true);
    };

    // Generic delete handler
    const handleDelete = async () => {
        if (!deleteTarget) return { success: false, error: 'No target' };

        let result;
        switch (deleteTarget.type) {
            case 'termYearLevel':
                result = await handleRemoveYearLevelFromTerm(deleteTarget.id);
                break;
            case 'section':
                result = await handleDeleteSection(deleteTarget.id);
                break;
            case 'schedule':
                result = await handleDeleteSchedule(deleteTarget.id);
                break;
            case 'subject':
                result = await handleDeleteSubject(deleteTarget.id);
                break;
            default:
                result = { success: false, error: 'Unknown type' };
        }

        if (result.success) {
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
        return result;
    };

    const openDeleteModal = (type: string, id: number, name: string) => {
        setDeleteTarget({ type, id, name });
        setShowDeleteModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-4 lg:mb-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Schedule Management</h1>
                    <p className="text-sm lg:text-base text-gray-600">Manage academic terms, year levels, subjects, sections, and schedules</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-4 lg:mb-6">
                    <div className="border-b border-gray-200">
                        {/* Mobile Tab Selector */}
                        <div className="block md:hidden p-4">
                            <label htmlFor="mobile-tab-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Section
                            </label>
                            <select
                                id="mobile-tab-select"
                                value={selectedTab}
                                onChange={(e) => setSelectedTab(e.target.value as typeof selectedTab)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 text-black"
                            >
                                <option value="schedules">Schedules</option>
                                <option value="terms">Academic Terms</option>
                                <option value="yearLevels">Year Levels</option>
                                <option value="subjects">Subjects</option>
                                <option value="sections">Sections</option>
                            </select>
                        </div>

                        {/* Desktop Tabs */}
                        <nav className="hidden md:flex overflow-x-auto -mb-px scrollbar-hide" role="tablist" aria-label="Schedule management tabs">
                            {[
                                { id: 'schedules', label: 'Schedules' },
                                { id: 'terms', label: 'Academic Terms' },
                                { id: 'yearLevels', label: 'Year Levels' },
                                { id: 'subjects', label: 'Subjects' },
                                { id: 'sections', label: 'Sections' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                                    className={`px-4 lg:px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${selectedTab === tab.id
                                        ? 'border-b-2 border-red-800 text-red-800'
                                        : 'text-black hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    role="tab"
                                    aria-selected={selectedTab === tab.id}
                                    aria-controls={`${tab.id}-panel`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {selectedTab === 'schedules' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Class Schedules</h2>
                            <button
                                onClick={() => {
                                    setSelectedSchedule(null);
                                    setShowScheduleModal(true);
                                }}
                                className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors flex items-center gap-2"
                                disabled={!selectedTermYearLevel}
                                title={!selectedTermYearLevel ? "Select a term and year level first" : ""}
                            >
                                <Plus size={16} /> Add Schedule
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Academic Term
                                </label>
                                <select
                                    value={selectedTerm || ''}
                                    onChange={(e) => {
                                        setSelectedTerm(e.target.value ? Number(e.target.value) : null);
                                        setSelectedTermYearLevel(null);
                                        setSelectedSection(null);
                                    }}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                >
                                    <option value="">All Terms</option>
                                    {terms.map((term) => (
                                        <option key={term.id} value={term.id}>
                                            {term.year} {term.status === 'ACTIVE' ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Year Level
                                </label>
                                <select
                                    value={selectedTermYearLevel || ''}
                                    onChange={(e) => {
                                        setSelectedTermYearLevel(e.target.value ? Number(e.target.value) : null);
                                        setSelectedSection(null);
                                    }}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                    disabled={!selectedTerm}
                                >
                                    <option value="">All Year Levels</option>
                                    {termYearLevels.map((tyl) => (
                                        <option key={tyl.id} value={tyl.id}>
                                            {tyl.yearLevel.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Section (Optional)
                                </label>
                                <select
                                    value={selectedSection || ''}
                                    onChange={(e) => setSelectedSection(e.target.value ? Number(e.target.value) : null)}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                    disabled={!selectedTermYearLevel}
                                >
                                    <option value="">All Sections</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Mobile View - Cards */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {schedulesLoading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Loading schedules...
                                    </div>
                                ) : schedules.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No schedules found
                                    </div>
                                ) : (
                                    schedules
                                        .filter((s) => !selectedSection || s.section?.id === selectedSection)
                                        .map((schedule) => (
                                            <div key={schedule.id} className="p-4 hover:bg-gray-50">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-900">
                                                                {schedule.termSubject.subject.code}
                                                            </div>
                                                            <div className="text-sm text-gray-600">{schedule.termSubject.subject.name}</div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditScheduleModal(schedule)}
                                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal('schedule', schedule.id, `${schedule.termSubject.subject.code} - ${schedule.day}`)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Section:</span>
                                                            <div className="font-medium text-gray-900">
                                                                {schedule.section?.name || <span className="text-gray-400 italic">No section</span>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Day:</span>
                                                            <div className="font-medium text-gray-900">{schedule.day}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Time:</span>
                                                            <div className="font-medium text-gray-900">
                                                                {schedule.startTime} - {schedule.endTime}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Room:</span>
                                                            <div className="font-medium text-gray-900">{schedule.room}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-sm">Teacher:</span>
                                                        <div className="mt-1">
                                                            {schedule.teacherName ? (
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{schedule.teacherName}</div>
                                                                    <div className="text-xs text-gray-500">{schedule.teacherEmail}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Unassigned
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {schedulesLoading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                Loading schedules...
                                            </td>
                                        </tr>
                                    ) : schedules.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                No schedules found
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules
                                            .filter((s) => !selectedSection || s.section?.id === selectedSection)
                                            .map((schedule) => (
                                                <tr key={schedule.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="font-medium text-gray-900">{schedule.termSubject.subject.code}</div>
                                                        <div className="text-xs text-gray-500">{schedule.termSubject.subject.name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {schedule.section?.name || <span className="text-gray-400 italic">No section</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{schedule.day}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{schedule.room}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {schedule.teacherName ? (
                                                            <div>
                                                                <div className="font-medium text-gray-900">{schedule.teacherName}</div>
                                                                <div className="text-xs text-gray-500">{schedule.teacherEmail}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm space-x-2">
                                                        <button
                                                            onClick={() => openEditScheduleModal(schedule)}
                                                            className="text-blue-600 hover:text-blue-900 hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal('schedule', schedule.id, `${schedule.termSubject.subject.code} - ${schedule.day}`)}
                                                            className="text-red-600 hover:text-red-900 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'terms' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Academic Terms</h2>
                            <button
                                onClick={() => setShowAddTermModal(true)}
                                className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Term
                            </button>
                        </div>

                        {/* Mobile View - Cards */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Loading academic terms...
                                    </div>
                                ) : terms.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No academic terms found
                                    </div>
                                ) : (
                                    terms.map((term) => {
                                        const startDate = new Date(term.startDate);
                                        const endDate = new Date(term.endDate);
                                        const currentDate = new Date();

                                        let statusDisplay = '';
                                        let statusColor = '';
                                        let actionButtons = null;

                                        if (term.status === 'ACTIVE') {
                                            if (currentDate < startDate) {
                                                statusDisplay = 'Upcoming';
                                                statusColor = 'bg-blue-100 text-blue-800';
                                                actionButtons = (
                                                    <button
                                                        onClick={() => handleAcademicTermAction('cancel', term.id)}
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                );
                                            } else if (currentDate >= startDate && currentDate <= endDate) {
                                                statusDisplay = 'Ongoing';
                                                statusColor = 'bg-green-100 text-green-800';
                                                actionButtons = (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleAcademicTermAction('complete', term.id)}
                                                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Finish Early
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcademicTermAction('suspend', term.id)}
                                                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Suspend
                                                        </button>
                                                    </div>
                                                );
                                            } else {
                                                statusDisplay = 'Overdue';
                                                statusColor = 'bg-orange-100 text-orange-800';
                                                actionButtons = (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleAcademicTermAction('complete', term.id)}
                                                            className="text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcademicTermAction('delete', term.id)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        } else if (term.status === 'INACTIVE') {
                                            statusDisplay = 'Completed';
                                            statusColor = 'bg-gray-100 text-gray-800';
                                            actionButtons = <span className="text-sm text-gray-500">No actions</span>;
                                        } else if (term.status === 'SUSPENDED') {
                                            statusDisplay = 'Suspended';
                                            statusColor = 'bg-red-100 text-red-800';
                                            actionButtons = (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleAcademicTermAction('reactivate', term.id)}
                                                        className="text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded text-sm"
                                                    >
                                                        Reactivate
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcademicTermAction('delete', term.id)}
                                                        className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            );
                                        } else {
                                            statusDisplay = term.status;
                                            statusColor = 'bg-gray-100 text-gray-800';
                                            actionButtons = <span className="text-sm text-gray-500">N/A</span>;
                                        }

                                        return (
                                            <div key={term.id} className="p-4 hover:bg-gray-50">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-900 text-lg">
                                                                {term.year}
                                                            </div>
                                                            <div className="mt-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                                    {statusDisplay}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Duration:</span>
                                                            <div className="font-medium text-gray-900">
                                                                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                {actionButtons}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Term</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                Loading academic terms...
                                            </td>
                                        </tr>
                                    ) : terms.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                No academic terms found
                                            </td>
                                        </tr>
                                    ) : (
                                        terms.map((term) => {
                                            const startDate = new Date(term.startDate);
                                            const endDate = new Date(term.endDate);
                                            const currentDate = new Date();

                                            let statusDisplay = '';
                                            let statusColor = '';
                                            let actionButtons = null;

                                            if (term.status === 'ACTIVE') {
                                                if (currentDate < startDate) {
                                                    statusDisplay = 'Upcoming';
                                                    statusColor = 'bg-blue-100 text-blue-800';
                                                    actionButtons = (
                                                        <button
                                                            onClick={() => handleAcademicTermAction('cancel', term.id)}
                                                            className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    );
                                                } else if (currentDate >= startDate && currentDate <= endDate) {
                                                    statusDisplay = 'Ongoing';
                                                    statusColor = 'bg-green-100 text-green-800';
                                                    actionButtons = (
                                                        <>
                                                            <button
                                                                onClick={() => handleAcademicTermAction('complete', term.id)}
                                                                className="mr-2 cursor-pointer text-yellow-600 hover:text-yellow-800 hover:underline text-xs"
                                                            >
                                                                Finish Early
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcademicTermAction('suspend', term.id)}
                                                                className="text-orange-600 cursor-pointer hover:text-orange-800 hover:underline text-xs"
                                                            >
                                                                Suspend
                                                            </button>
                                                        </>
                                                    );
                                                } else {
                                                    statusDisplay = 'Overdue';
                                                    statusColor = 'bg-orange-100 text-orange-800';
                                                    actionButtons = (
                                                        <>
                                                            <button
                                                                onClick={() => handleAcademicTermAction('complete', term.id)}
                                                                className="mr-2 cursor-pointer text-green-600 hover:text-green-800 hover:underline text-xs"
                                                            >
                                                                Mark Complete
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcademicTermAction('delete', term.id)}
                                                                className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    );
                                                }
                                            } else if (term.status === 'INACTIVE') {
                                                statusDisplay = 'Completed';
                                                statusColor = 'bg-gray-100 text-gray-800';
                                                actionButtons = <span className="text-xs text-gray-500">No actions</span>;
                                            } else if (term.status === 'SUSPENDED') {
                                                statusDisplay = 'Suspended';
                                                statusColor = 'bg-red-100 text-red-800';
                                                actionButtons = (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcademicTermAction('reactivate', term.id)}
                                                            className="mr-2 cursor-pointer text-green-600 hover:text-green-800 hover:underline text-xs"
                                                        >
                                                            Reactivate
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcademicTermAction('delete', term.id)}
                                                            className="text-red-600 cursor-pointer hover:text-red-800 hover:underline text-xs"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                );
                                            } else {
                                                statusDisplay = term.status;
                                                statusColor = 'bg-gray-100 text-gray-800';
                                                actionButtons = <span className="text-xs text-gray-500">N/A</span>;
                                            }

                                            return (
                                                <tr key={term.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900">{term.year}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div className="text-xs">
                                                            <div>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</div>
                                                            <div className="text-gray-500">
                                                                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                                                            {statusDisplay}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {actionButtons}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'yearLevels' && (
                    <div className="bg-white rounded-lg shadow p-6 text-black">
                        <div className="mb-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <h2 className="text-xl font-semibold text-black">Year Levels by Term</h2>
                                <div className="flex gap-2 mt-4 sm:mt-0">
                                    <button
                                        onClick={() => setShowAddYearLevelModal(true)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Create Year Level
                                    </button>
                                    {selectedTerm && (
                                        <button
                                            onClick={() => setShowAddYearLevelToTermModal(true)}
                                            className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add to Term
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Term Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Academic Term
                            </label>
                            <select
                                value={selectedTerm || ''}
                                onChange={(e) => setSelectedTerm(e.target.value ? Number(e.target.value) : null)}
                                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                            >
                                <option value="">All Terms</option>
                                {terms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.year} {term.status === 'ACTIVE' ? '(Active)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!selectedTerm ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg mb-2">Select an academic term to view year levels</p>
                                <p className="text-sm">Year levels are organized by academic term</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="block lg:hidden">
                                    <div className="divide-y divide-gray-200">
                                        {termYearLevelsLoading ? (
                                            <div className="p-8 text-center text-gray-500">
                                                Loading year levels...
                                            </div>
                                        ) : termYearLevels.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <p className="mb-2">No year levels added to this term</p>
                                                <button
                                                    onClick={() => setShowAddYearLevelToTermModal(true)}
                                                    className="text-red-800 hover:underline"
                                                >
                                                    Add year level to this term
                                                </button>
                                            </div>
                                        ) : (
                                            termYearLevels.filter(tyl => tyl && tyl.yearLevel).map((tyl) => (
                                                <div key={tyl.id} className="p-4 hover:bg-gray-50">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-gray-900 text-lg">
                                                                    {tyl.yearLevel.name}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => openDeleteModal('termYearLevel', tyl.id, tyl.yearLevel.name)}
                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Subjects:</span>
                                                                <div className="font-medium text-gray-900">{tyl._count?.termSubjects || 0}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Sections:</span>
                                                                <div className="font-medium text-gray-900">{tyl._count?.sections || 0}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => openConfigureSubjectsModal(tyl.id)}
                                                            className="w-full bg-red-800 text-white px-3 py-2 rounded hover:bg-red-900 transition-colors flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Settings size={14} /> Configure Subjects
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Desktop View - Grid */}
                                <div className="hidden lg:block">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {termYearLevelsLoading ? (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                Loading year levels...
                                            </div>
                                        ) : termYearLevels.length === 0 ? (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                <p className="mb-2">No year levels added to this term</p>
                                                <button
                                                    onClick={() => setShowAddYearLevelToTermModal(true)}
                                                    className="text-red-800 hover:underline"
                                                >
                                                    Add year level to this term
                                                </button>
                                            </div>
                                        ) : (
                                            termYearLevels.filter(tyl => tyl && tyl.yearLevel).map((tyl) => (
                                                <div key={tyl.id} className="bg-gray-50 border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">{tyl.yearLevel.name}</h3>
                                                        <button
                                                            onClick={() => openDeleteModal('termYearLevel', tyl.id, tyl.yearLevel.name)}
                                                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                                            title="Remove from term"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Subjects:</span>
                                                            <span className="font-medium text-gray-900">{tyl._count?.termSubjects || 0}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Sections:</span>
                                                            <span className="font-medium text-gray-900">{tyl._count?.sections || 0}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openConfigureSubjectsModal(tyl.id)}
                                                        className="w-full bg-white border border-red-800 text-red-800 px-3 py-2 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Settings size={14} /> Configure Subjects
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {selectedTab === 'subjects' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Subjects</h2>
                            <button
                                onClick={() => setShowAddSubjectModal(true)}
                                className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Subject
                            </button>
                        </div>

                        {/* Mobile View - Cards */}
                        <div className="block lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {subjectsLoading ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Loading subjects...
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No subjects found. Create one to get started.
                                    </div>
                                ) : (
                                    subjects.map((subject) => (
                                        <div key={subject.id} className="p-4 hover:bg-gray-50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{subject.code}</div>
                                                        <div className="text-sm text-gray-600">{subject.name}</div>
                                                        {subject.description && (
                                                            <div className="text-xs text-gray-500">{subject.description}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditSubjectModal(subject)}
                                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal('subject', subject.id, subject.code)}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Units:</span>
                                                        <div className="font-medium text-gray-900">{subject.units}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Status:</span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {subject.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {subjectsLoading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                <Loader2 className="animate-spin inline-block mr-2" size={16} />
                                                Loading subjects...
                                            </td>
                                        </tr>
                                    ) : subjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                No subjects found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        subjects.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.code}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="text-gray-900">{subject.name}</div>
                                                    {subject.description && (
                                                        <div className="text-xs text-gray-500 mt-1">{subject.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{subject.units}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {subject.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm space-x-2">
                                                    <button
                                                        onClick={() => openEditSubjectModal(subject)}
                                                        className="text-blue-600 hover:text-blue-900 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal('subject', subject.id, subject.code)}
                                                        className="text-red-600 hover:text-red-900 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'sections' && (
                    <div className="bg-white rounded-lg shadow p-6 text-black">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-black">Sections</h2>
                            {selectedTermYearLevel && (
                                <button
                                    onClick={() => setShowAddSectionModal(true)}
                                    className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add Section
                                </button>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Term
                                </label>
                                <select
                                    value={selectedTerm || ''}
                                    onChange={(e) => {
                                        setSelectedTerm(e.target.value ? Number(e.target.value) : null);
                                        setSelectedTermYearLevel(null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                >
                                    <option value="">Select Term</option>
                                    {terms.map((term) => (
                                        <option key={term.id} value={term.id}>
                                            {term.year} {term.status === 'ACTIVE' ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year Level
                                </label>
                                <select
                                    value={selectedTermYearLevel || ''}
                                    onChange={(e) => setSelectedTermYearLevel(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                                    disabled={!selectedTerm}
                                >
                                    <option value="">Select Year Level</option>
                                    {termYearLevels.map((tyl) => (
                                        <option key={tyl.id} value={tyl.id}>
                                            {tyl.yearLevel.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {!selectedTerm ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg mb-2">Select an academic term to view sections</p>
                                <p className="text-sm">Sections are organized by term and year level</p>
                            </div>
                        ) : !selectedTermYearLevel ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg mb-2">Select a year level to view sections</p>
                                <p className="text-sm">Each year level can have multiple sections</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sectionsLoading ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        Loading sections...
                                    </div>
                                ) : sections.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        <p className="mb-2">No sections found for this year level</p>
                                        <button
                                            onClick={() => setShowAddSectionModal(true)}
                                            className="text-red-800 hover:underline"
                                        >
                                            Create a section
                                        </button>
                                    </div>
                                ) : (
                                    sections.map((section) => (
                                        <div key={section.id} className="bg-gray-50 border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${section.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                        section.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {section.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => openEditSectionModal(section)}
                                                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal('section', section.id, section.name)}
                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 flex items-center gap-1">
                                                        <Users size={14} /> Capacity:
                                                    </span>
                                                    <span className="font-medium text-gray-900">{section.capacity}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Students:</span>
                                                    <span className="font-medium text-gray-900">{section.currentStudents}/{section.capacity}</span>
                                                </div>
                                                {section._count && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Schedules:</span>
                                                        <span className="font-medium text-gray-900">{section._count.schedules}</span>
                                                    </div>
                                                )}
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">Adviser:</span>
                                                        {section.advisorFirstName && section.advisorLastName ? (
                                                            <div className="mt-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {section.advisorFirstName} {section.advisorLastName}
                                                                </div>
                                                                {section.advisorEmail && (
                                                                    <div className="text-xs text-gray-500">{section.advisorEmail}</div>
                                                                )}
                                                                {section.advisorEmployeeId && (
                                                                    <div className="text-xs text-gray-500">ID: {section.advisorEmployeeId}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    No advisor assigned
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="border-t pt-3 mt-3">
                                                    <button
                                                        onClick={() => openManageStudentsModal(section)}
                                                        className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                                    >
                                                        <Users size={16} />
                                                        Manage Students
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Manage Students Modal */}
            <ManageStudentsModal
                show={showManageStudentsModal}
                onClose={() => {
                    setShowManageStudentsModal(false);
                    setSelectedSectionForManage(null);
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                section={selectedSectionForManage as any}
                onSuccess={() => {
                    if (selectedTermYearLevel) {
                        fetchSections(selectedTermYearLevel);
                    }
                }}
            />

            {/* All Modals */}
            <SchedulePageModals
                modalStates={{
                    showAddTermModal,
                    showAddYearLevelModal,
                    showEditYearLevelModal,
                    showDeleteYearLevelModal,
                    showAddYearLevelToTermModal,
                    showConfigureSubjectsModal,
                    showAddSectionModal,
                    showEditSectionModal,
                    showScheduleModal,
                    showDeleteModal,
                    showAddSubjectModal,
                    showEditSubjectModal,
                }}
                modalHandlers={{
                    setShowAddTermModal,
                    setShowAddYearLevelModal,
                    setShowEditYearLevelModal,
                    setShowDeleteYearLevelModal,
                    setShowAddYearLevelToTermModal,
                    setShowConfigureSubjectsModal,
                    setShowAddSectionModal,
                    setShowEditSectionModal,
                    setShowScheduleModal,
                    setShowDeleteModal,
                    setShowAddSubjectModal,
                    setShowEditSubjectModal,
                    handleAddAcademicTerm,
                    handleAddYearLevel,
                    handleEditYearLevel,
                    handleDeleteYearLevel,
                    handleAddYearLevelToTerm,
                    handleAddSection,
                    handleEditSection,
                    handleScheduleSubmit,
                    handleDelete,
                    handleAddSubject,
                    handleEditSubject,
                }}
                selectedYearLevel={selectedYearLevel}
                setSelectedYearLevel={setSelectedYearLevel}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                yearLevels={yearLevels}
                termYearLevels={termYearLevels}
                terms={terms}
                selectedTerm={selectedTerm}
                selectedTermYearLevel={selectedTermYearLevel}
                selectedTermYearLevelForConfig={selectedTermYearLevelForConfig}
                setSelectedTermYearLevelForConfig={setSelectedTermYearLevelForConfig}
                fetchTermYearLevels={fetchTermYearLevels}
                selectedSectionForEdit={selectedSectionForEdit}
                setSelectedSectionForEdit={setSelectedSectionForEdit}
                termSubjects={termSubjects}
                sections={sections}
                selectedScheduleForEdit={selectedScheduleForEdit}
                setSelectedSchedule={setSelectedSchedule}
                deleteTarget={deleteTarget}
                setDeleteTarget={setDeleteTarget}
            />
        </div>
    );
}