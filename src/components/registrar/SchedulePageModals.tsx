'use client';

import AddAcademicTermModal from '@/components/admin/AddAcademicTermModal';
import AddYearLevelModal from '@/components/admin/AddYearLevelModal';
import EditYearLevelModal from '@/components/admin/EditYearLevelModal';
import DeleteYearLevelModal from '@/components/admin/DeleteYearLevelModal';
import AddYearLevelToTermModal from '@/components/registrar/AddYearLevelToTermModal';
import ConfigureSubjectsModal from '@/components/registrar/ConfigureSubjectsModal';
import AddSectionModal from '@/components/registrar/AddSectionModal';
import EditSectionModal from '@/components/registrar/EditSectionModal';
import ScheduleModal from '@/components/registrar/ScheduleModal';
import DeleteConfirmationModal from '@/components/registrar/DeleteConfirmationModal';
import AddSubjectModal from '@/components/registrar/AddSubjectModal';
import EditSubjectModal from '@/components/registrar/EditSubjectModal';

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
    _count?: {
        schedules: number;
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

interface ModalStates {
    showAddTermModal: boolean;
    showAddYearLevelModal: boolean;
    showEditYearLevelModal: boolean;
    showDeleteYearLevelModal: boolean;
    showAddYearLevelToTermModal: boolean;
    showConfigureSubjectsModal: boolean;
    showAddSectionModal: boolean;
    showEditSectionModal: boolean;
    showScheduleModal: boolean;
    showDeleteModal: boolean;
    showAddSubjectModal: boolean;
    showEditSubjectModal: boolean;
}

interface ModalHandlers {
    setShowAddTermModal: (show: boolean) => void;
    setShowAddYearLevelModal: (show: boolean) => void;
    setShowEditYearLevelModal: (show: boolean) => void;
    setShowDeleteYearLevelModal: (show: boolean) => void;
    setShowAddYearLevelToTermModal: (show: boolean) => void;
    setShowConfigureSubjectsModal: (show: boolean) => void;
    setShowAddSectionModal: (show: boolean) => void;
    setShowEditSectionModal: (show: boolean) => void;
    setShowScheduleModal: (show: boolean) => void;
    setShowDeleteModal: (show: boolean) => void;
    setShowAddSubjectModal: (show: boolean) => void;
    setShowEditSubjectModal: (show: boolean) => void;
    handleAddAcademicTerm: (data: {
        year: string;
        startDate: Date;
        endDate: Date;
        status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
    }) => Promise<{ success: boolean; error?: string }>;
    handleAddYearLevel: (name: string) => Promise<{ success: boolean; error?: string }>;
    handleEditYearLevel: (id: number, name: string) => Promise<{ success: boolean; error?: string }>;
    handleDeleteYearLevel: (id: number) => Promise<{ success: boolean; error?: string }>;
    handleAddYearLevelToTerm: (yearLevelIds: number[]) => Promise<{ success: boolean; error?: string }>;
    handleAddSection: (data: { name: string; capacity: number }) => Promise<{ success: boolean; error?: string }>;
    handleEditSection: (id: number, name: string, capacity: number, status: string) => Promise<{ success: boolean; error?: string }>;
    handleScheduleSubmit: (data: {
        id?: number;
        termSubjectId: number;
        sectionId?: number | null;
        day: string;
        startTime: string;
        endTime: string;
        room: string;
    }) => Promise<{ success: boolean; error?: string }>;
    handleDelete: () => Promise<{ success: boolean; error?: string }>;
    handleAddSubject: (data: {
        code: string;
        name: string;
        description: string | null;
        units: number;
    }) => Promise<{ success: boolean; error?: string }>;
    handleEditSubject: (id: number, data: {
        code: string;
        name: string;
        description: string | null;
        units: number;
    }) => Promise<{ success: boolean; error?: string }>;
}

interface SchedulePageModalsProps {
    modalStates: ModalStates;
    modalHandlers: ModalHandlers;
    selectedYearLevel: YearLevel | null;
    setSelectedYearLevel: (yearLevel: YearLevel | null) => void;
    yearLevels: YearLevel[];
    termYearLevels: { id: number; yearLevelId: number; yearLevel: { name: string } }[];
    terms: Term[];
    selectedTerm: number | null;
    selectedTermYearLevel: number | null;
    selectedTermYearLevelForConfig: number | null;
    setSelectedTermYearLevelForConfig: (id: number | null) => void;
    fetchTermYearLevels: (termId: number) => Promise<void>;
    selectedSectionForEdit: Section | null;
    setSelectedSectionForEdit: (section: Section | null) => void;
    selectedSubject: Subject | null;
    setSelectedSubject: (subject: Subject | null) => void;
    termSubjects: TermSubject[];
    sections: Section[];
    selectedScheduleForEdit: Schedule | null;
    setSelectedSchedule: (schedule: Schedule | null) => void;
    deleteTarget: { type: string; id: number; name: string } | null;
    setDeleteTarget: (target: { type: string; id: number; name: string } | null) => void;
}

export default function SchedulePageModals({
    modalStates,
    modalHandlers,
    selectedYearLevel,
    setSelectedYearLevel,
    yearLevels,
    termYearLevels,
    terms,
    selectedTerm,
    selectedTermYearLevel,
    selectedTermYearLevelForConfig,
    setSelectedTermYearLevelForConfig,
    fetchTermYearLevels,
    selectedSectionForEdit,
    setSelectedSectionForEdit,
    selectedSubject,
    setSelectedSubject,
    termSubjects,
    sections,
    selectedScheduleForEdit,
    setSelectedSchedule,
    deleteTarget,
    setDeleteTarget,
}: SchedulePageModalsProps) {
    return (
        <>
            <AddAcademicTermModal
                isOpen={modalStates.showAddTermModal}
                onClose={() => modalHandlers.setShowAddTermModal(false)}
                onAdd={modalHandlers.handleAddAcademicTerm}
            />

            <AddYearLevelModal
                isOpen={modalStates.showAddYearLevelModal}
                onClose={() => modalHandlers.setShowAddYearLevelModal(false)}
                onAdd={modalHandlers.handleAddYearLevel}
            />

            <EditYearLevelModal
                isOpen={modalStates.showEditYearLevelModal}
                onClose={() => {
                    modalHandlers.setShowEditYearLevelModal(false);
                    setSelectedYearLevel(null);
                }}
                yearLevel={selectedYearLevel}
                onEdit={modalHandlers.handleEditYearLevel}
            />

            <DeleteYearLevelModal
                isOpen={modalStates.showDeleteYearLevelModal}
                onClose={() => {
                    modalHandlers.setShowDeleteYearLevelModal(false);
                    setSelectedYearLevel(null);
                }}
                yearLevel={selectedYearLevel}
                onDelete={modalHandlers.handleDeleteYearLevel}
            />

            <AddYearLevelToTermModal
                isOpen={modalStates.showAddYearLevelToTermModal}
                onClose={() => modalHandlers.setShowAddYearLevelToTermModal(false)}
                availableYearLevels={yearLevels.filter(yl =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    !termYearLevels.some((tyl: any) => tyl?.yearLevelId === yl.id)
                )}
                termName={terms.find(t => t.id === selectedTerm)?.year || ''}
                onSubmit={modalHandlers.handleAddYearLevelToTerm}
            />

            {selectedTermYearLevelForConfig && (
                <ConfigureSubjectsModal
                    isOpen={modalStates.showConfigureSubjectsModal}
                    onClose={() => {
                        modalHandlers.setShowConfigureSubjectsModal(false);
                        setSelectedTermYearLevelForConfig(null);
                    }}
                    termYearLevelId={selectedTermYearLevelForConfig}
                    onRefresh={() => selectedTerm && fetchTermYearLevels(selectedTerm)}
                />
            )}

            <AddSectionModal
                isOpen={modalStates.showAddSectionModal}
                onClose={() => modalHandlers.setShowAddSectionModal(false)}
                onAdd={(name: string, capacity: number) => modalHandlers.handleAddSection({ name, capacity })}
            />

            {selectedSectionForEdit && (
                <EditSectionModal
                    isOpen={modalStates.showEditSectionModal}
                    onClose={() => {
                        modalHandlers.setShowEditSectionModal(false);
                        setSelectedSectionForEdit(null);
                    }}
                    section={selectedSectionForEdit}
                    onEdit={modalHandlers.handleEditSection}
                />
            )}

            {selectedTermYearLevel && (
                <ScheduleModal
                    isOpen={modalStates.showScheduleModal}
                    onClose={() => {
                        modalHandlers.setShowScheduleModal(false);
                        setSelectedSchedule(null);
                    }}
                    mode={selectedScheduleForEdit ? 'edit' : 'add'}
                    termSubjects={termSubjects}
                    sections={sections}
                    initialData={selectedScheduleForEdit ? {
                        id: selectedScheduleForEdit.id,
                        termSubjectId: selectedScheduleForEdit.termSubject.id,
                        sectionId: selectedScheduleForEdit.section?.id || null,
                        day: selectedScheduleForEdit.day,
                        startTime: selectedScheduleForEdit.startTime,
                        endTime: selectedScheduleForEdit.endTime,
                        room: selectedScheduleForEdit.room,
                    } : undefined}
                    onSubmit={modalHandlers.handleScheduleSubmit}
                />
            )}

            <AddSubjectModal
                isOpen={modalStates.showAddSubjectModal}
                onClose={() => modalHandlers.setShowAddSubjectModal(false)}
                onAdd={modalHandlers.handleAddSubject}
            />

            {selectedSubject && (
                <EditSubjectModal
                    isOpen={modalStates.showEditSubjectModal}
                    onClose={() => {
                        modalHandlers.setShowEditSubjectModal(false);
                        setSelectedSubject(null);
                    }}
                    subject={selectedSubject}
                    onEdit={modalHandlers.handleEditSubject}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmationModal
                    isOpen={modalStates.showDeleteModal}
                    onClose={() => {
                        modalHandlers.setShowDeleteModal(false);
                        setDeleteTarget(null);
                    }}
                    title={`Delete ${deleteTarget.type === 'termYearLevel' ? 'Year Level from Term' :
                        deleteTarget.type === 'section' ? 'Section' : 'Schedule'}`}
                    message={`Are you sure you want to delete this ${deleteTarget.type === 'termYearLevel' ? 'year level from the term' : deleteTarget.type}? This action cannot be undone.`}
                    itemName={deleteTarget.name}
                    onConfirm={modalHandlers.handleDelete}
                />
            )}
        </>
    );
}
