'use server';

import { prisma } from '@/lib/prisma';
import { logSystemAction } from '@/lib/systemLogger';

/**
 * Get all subjects (including soft-deleted)
 */
export async function getAllSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: [
                { code: 'asc' },
            ],
        });

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'VIEW',
            status: 'SUCCESS',
            severityLevel: 'LOW',
            actionDescription: `Retrieved ${subjects.length} subjects`,
            targetType: 'SUBJECT',
            targetId: 'ALL',
        });

        return { success: true, data: subjects };
    } catch (error) {
        console.error('Error fetching subjects:', error);
        
        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'VIEW',
            status: 'FAILED',
            severityLevel: 'MEDIUM',
            actionDescription: `Failed to retrieve subjects: ${error}`,
            targetType: 'SUBJECT',
            targetId: 'ALL',
        });

        return { success: false, error: 'Failed to fetch subjects' };
    }
}

/**
 * Get active subjects only
 */
export async function getActiveSubjects() {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            orderBy: [
                { code: 'asc' },
            ],
        });

        return { success: true, data: subjects };
    } catch (error) {
        console.error('Error fetching active subjects:', error);
        return { success: false, error: 'Failed to fetch active subjects' };
    }
}

/**
 * Create a new subject
 */
export async function createSubject(data: {
    code: string;
    name: string;
    description: string | null;
    units: number;
}) {
    try {
        // Check if subject code already exists
        const existing = await prisma.subject.findUnique({
            where: { code: data.code },
        });

        if (existing) {
            return { success: false, error: 'Subject code already exists' };
        }

        const subject = await prisma.subject.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description,
                units: data.units,
                isActive: true,
            },
        });

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'CREATE',
            status: 'SUCCESS',
            severityLevel: 'MEDIUM',
            actionDescription: `Created subject: ${data.code} - ${data.name}`,
            targetType: 'SUBJECT',
            targetId: String(subject.id),
        });

        return { success: true, data: subject };
    } catch (error) {
        console.error('Error creating subject:', error);
        
        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'CREATE',
            status: 'FAILED',
            severityLevel: 'HIGH',
            actionDescription: `Failed to create subject: ${error instanceof Error ? error.message : 'Unknown error'}`,
            targetType: 'SUBJECT',
            targetId: 'N/A',
        });

        return { success: false, error: 'Failed to create subject' };
    }
}

/**
 * Update an existing subject
 */
export async function updateSubject(
    id: number,
    data: {
        code?: string;
        name?: string;
        description?: string | null;
        units?: number;
        isActive?: boolean;
    }
) {
    try {
        // If updating code, check if new code already exists
        if (data.code) {
            const existing = await prisma.subject.findUnique({
                where: { code: data.code },
            });

            if (existing && existing.id !== id) {
                return { success: false, error: 'Subject code already exists' };
            }
        }

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'UPDATE',
            status: 'SUCCESS',
            severityLevel: 'MEDIUM',
            actionDescription: `Updated subject ID: ${id}`,
            targetType: 'SUBJECT',
            targetId: String(id),
        });

        return { success: true, data: subject };
    } catch (error) {
        console.error('Error updating subject:', error);
        
        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'UPDATE',
            status: 'FAILED',
            severityLevel: 'HIGH',
            actionDescription: `Failed to update subject ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            targetType: 'SUBJECT',
            targetId: String(id),
        });

        return { success: false, error: 'Failed to update subject' };
    }
}

/**
 * Soft delete a subject
 */
export async function deleteSubject(id: number) {
    try {
        // Check if subject is used in any term subjects
        const termSubjectCount = await prisma.termSubject.count({
            where: { subjectId: id },
        });

        if (termSubjectCount > 0) {
            return {
                success: false,
                error: `Cannot delete subject. It is used in ${termSubjectCount} term(s). Please remove it from all terms first.`,
            };
        }

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'DELETE',
            status: 'SUCCESS',
            severityLevel: 'HIGH',
            actionDescription: `Deleted subject: ${subject.code} - ${subject.name}`,
            targetType: 'SUBJECT',
            targetId: String(id),
        });

        return { success: true, data: subject };
    } catch (error) {
        console.error('Error deleting subject:', error);
        
        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'DELETE',
            status: 'FAILED',
            severityLevel: 'HIGH',
            actionDescription: `Failed to delete subject ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            targetType: 'SUBJECT',
            targetId: String(id),
        });

        return { success: false, error: 'Failed to delete subject' };
    }
}

/**
 * Toggle subject active status
 */
export async function toggleSubjectStatus(id: number, isActive: boolean) {
    try {
        const subject = await prisma.subject.update({
            where: { id },
            data: {
                isActive,
                updatedAt: new Date(),
            },
        });

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'UPDATE',
            status: 'SUCCESS',
            severityLevel: 'LOW',
            actionDescription: `${isActive ? 'Activated' : 'Deactivated'} subject: ${subject.code}`,
            targetType: 'SUBJECT',
            targetId: String(id),
        });

        return { success: true, data: subject };
    } catch (error) {
        console.error('Error toggling subject status:', error);
        return { success: false, error: 'Failed to update subject status' };
    }
}
