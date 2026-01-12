"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

/**
 * Attach multiple subjects to a term-year level
 */
export async function attachSubjectsToYearLevel(
    termYearLevelId: number,
    subjectIds: number[]
) {
    try {
        // Verify term-year level exists
        const termYearLevel = await prisma.termYearLevel.findFirst({
            where: {
                id: termYearLevelId,
                deletedAt: null,
            },
            include: {
                academicTerm: true,
                yearLevel: true,
            },
        });

        if (!termYearLevel) {
            return { success: false, error: "Term-year level not found" };
        }

        // Verify all subjects exist
        const subjects = await prisma.subject.findMany({
            where: {
                id: { in: subjectIds },
                deletedAt: null,
                isActive: true,
            },
        });

        if (subjects.length !== subjectIds.length) {
            return { success: false, error: "One or more subjects not found or inactive" };
        }

        // Check for existing attachments
        const existing = await prisma.termSubject.findMany({
            where: {
                termYearLevelId: termYearLevelId,
                subjectId: { in: subjectIds },
                deletedAt: null,
            },
        });

        const existingSubjectIds = existing.map((ts) => ts.subjectId);
        const newSubjectIds = subjectIds.filter(
            (id) => !existingSubjectIds.includes(id)
        );

        if (newSubjectIds.length === 0) {
            return {
                success: false,
                error: "All selected subjects are already attached",
            };
        }

        // Create term-subject links
        await prisma.termSubject.createMany({
            data: newSubjectIds.map((subjectId) => ({
                termYearLevelId: termYearLevelId,
                subjectId: subjectId,
                isRequired: true,
            })),
        });

        // Get created records for logging
        const created = await prisma.termSubject.findMany({
            where: {
                termYearLevelId: termYearLevelId,
                subjectId: { in: newSubjectIds },
                deletedAt: null,
            },
            include: {
                subject: true,
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "CREATE",
            actionDescription: `Attached ${newSubjectIds.length} subject(s) to ${termYearLevel.academicTerm.year} - ${termYearLevel.yearLevel.name}`,
            targetType: "TermSubject",
            targetId: termYearLevelId.toString(),
            targetName: `${termYearLevel.academicTerm.year} - ${termYearLevel.yearLevel.name}`,
            newValues: {
                count: created.length,
                subjects: created.map(ts => ({ id: ts.id, subjectName: ts.subject.name, isRequired: ts.isRequired }))
            },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: created };
    } catch (error) {
        console.error("Error attaching subjects:", error);
        return { success: false, error: "Failed to attach subjects" };
    }
}

/**
 * Get all subjects attached to a term-year level
 */
export async function getSubjectsForYearLevel(termYearLevelId: number) {
    try {
        const termSubjects = await prisma.termSubject.findMany({
            where: {
                termYearLevelId: termYearLevelId,
                deletedAt: null,
            },
            include: {
                subject: true,
                schedules: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        section: true,
                    },
                },
            },
            orderBy: {
                subject: {
                    name: "asc",
                },
            },
        });

        return { success: true, data: termSubjects };
    } catch (error) {
        console.error("Error getting subjects for year level:", error);
        return { success: false, error: "Failed to get subjects" };
    }
}

/**
 * Update whether a subject is required or optional
 */
export async function updateSubjectRequirement(
    termSubjectId: number,
    isRequired: boolean
) {
    try {
        const termSubject = await prisma.termSubject.findUnique({
            where: { id: termSubjectId },
            include: {
                subject: true,
                termYearLevel: {
                    include: {
                        academicTerm: true,
                        yearLevel: true,
                    },
                },
            },
        });

        if (!termSubject || termSubject.deletedAt) {
            return { success: false, error: "Term-subject not found" };
        }

        const updated = await prisma.termSubject.update({
            where: { id: termSubjectId },
            data: { isRequired },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionDescription: `Updated subject "${termSubject.subject.name}" requirement to ${isRequired ? "Required" : "Optional"}`,
            targetType: "TermSubject",
            targetId: termSubjectId.toString(),
            targetName: `${termSubject.subject.name} - ${termSubject.termYearLevel.academicTerm.year}`,
            oldValues: { isRequired: termSubject.isRequired },
            newValues: { isRequired },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating subject requirement:", error);
        return { success: false, error: "Failed to update subject requirement" };
    }
}

/**
 * Remove a subject from a term-year level (soft delete)
 */
export async function removeSubjectFromYearLevel(termSubjectId: number) {
    try {
        const termSubject = await prisma.termSubject.findUnique({
            where: { id: termSubjectId },
            include: {
                subject: true,
                termYearLevel: {
                    include: {
                        academicTerm: true,
                        yearLevel: true,
                    },
                },
                schedules: {
                    where: { deletedAt: null },
                },
            },
        });

        if (!termSubject || termSubject.deletedAt) {
            return { success: false, error: "Term-subject not found" };
        }

        // Check if there are active schedules
        if (termSubject.schedules.length > 0) {
            return {
                success: false,
                error: "Cannot remove subject with existing schedules. Please delete schedules first.",
            };
        }

        // Soft delete
        const deleted = await prisma.termSubject.update({
            where: { id: termSubjectId },
            data: { deletedAt: new Date() },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "DELETE",
            actionDescription: `Removed subject "${termSubject.subject.name}" from ${termSubject.termYearLevel.academicTerm.year} - ${termSubject.termYearLevel.yearLevel.name}`,
            targetType: "TermSubject",
            targetId: termSubjectId.toString(),
            targetName: `${termSubject.subject.name}`,
            oldValues: termSubject,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: deleted };
    } catch (error) {
        console.error("Error removing subject:", error);
        return { success: false, error: "Failed to remove subject" };
    }
}

/**
 * Get available subjects that can be attached to a term-year level
 */
export async function getAvailableSubjects(termYearLevelId: number) {
    try {
        // Get subjects already attached
        const existingTermSubjects = await prisma.termSubject.findMany({
            where: {
                termYearLevelId: termYearLevelId,
                deletedAt: null,
            },
            select: {
                subjectId: true,
            },
        });

        const existingSubjectIds = existingTermSubjects.map((ts) => ts.subjectId);

        // Get all active subjects not yet attached
        const availableSubjects = await prisma.subject.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                id: {
                    notIn: existingSubjectIds,
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return { success: true, data: availableSubjects };
    } catch (error) {
        console.error("Error getting available subjects:", error);
        return { success: false, error: "Failed to get available subjects" };
    }
}
