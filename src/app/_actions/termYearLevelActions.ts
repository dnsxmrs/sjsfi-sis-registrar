"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

/**
 * Add a year level to an academic term
 */
export async function addYearLevelToTerm(termId: number, yearLevelId: number) {
    try {
        // Check if the term exists and is active
        const term = await prisma.academicTerm.findFirst({
            where: {
                id: termId,
                deletedAt: null,
                status: "ACTIVE",
            },
        });

        if (!term) {
            return { success: false, error: "Academic term not found or inactive" };
        }

        // Check if the year level exists and is active
        const yearLevel = await prisma.yearLevel.findFirst({
            where: {
                id: yearLevelId,
                deletedAt: null,
                status: "ACTIVE",
            },
        });

        if (!yearLevel) {
            return { success: false, error: "Year level not found or inactive" };
        }

        // Check if this combination already exists (not deleted)
        const existing = await prisma.termYearLevel.findFirst({
            where: {
                academicTermId: termId,
                yearLevelId: yearLevelId,
                deletedAt: null,
            },
        });

        if (existing) {
            return {
                success: false,
                error: "This year level is already added to this academic term",
            };
        }

        // Create the term-year level link
        const termYearLevel = await prisma.termYearLevel.create({
            data: {
                academicTermId: termId,
                yearLevelId: yearLevelId,
            },
            include: {
                academicTerm: true,
                yearLevel: true,
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "CREATE",
            actionDescription: `Added year level "${yearLevel.name}" to academic term "${term.year}"`,
            targetType: "TermYearLevel",
            targetId: termYearLevel.id.toString(),
            targetName: `${term.year} - ${yearLevel.name}`,
            newValues: termYearLevel,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: termYearLevel };
    } catch (error) {
        console.error("Error adding year level to term:", error);
        return { success: false, error: "Failed to add year level to term" };
    }
}

/**
 * Get all year levels for a specific academic term
 */
export async function getYearLevelsForTerm(termId: number) {
    try {
        const termYearLevels = await prisma.termYearLevel.findMany({
            where: {
                academicTermId: termId,
                deletedAt: null,
            },
            include: {
                yearLevel: true,
                academicTerm: true,
                _count: {
                    select: {
                        termSubjects: {
                            where: {
                                deletedAt: null,
                            },
                        },
                        sections: {
                            where: {
                                deletedAt: null,
                            },
                        },
                    },
                },
                termSubjects: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        subject: true,
                    },
                },
                sections: {
                    where: {
                        deletedAt: null,
                    },
                },
            },
            orderBy: {
                yearLevel: {
                    name: "asc",
                },
            },
        });

        return { success: true, data: termYearLevels };
    } catch (error) {
        console.error("Error getting year levels for term:", error);
        return { success: false, error: "Failed to get year levels" };
    }
}

/**
 * Remove a year level from an academic term (soft delete)
 */
export async function removeYearLevelFromTerm(termYearLevelId: number) {
    try {
        // Get the term year level before deleting
        const termYearLevel = await prisma.termYearLevel.findUnique({
            where: { id: termYearLevelId },
            include: {
                academicTerm: true,
                yearLevel: true,
                termSubjects: {
                    where: { deletedAt: null },
                },
                sections: {
                    where: { deletedAt: null },
                },
            },
        });

        if (!termYearLevel) {
            return { success: false, error: "Term-year level not found" };
        }

        // Check if there are active subjects or sections
        if (termYearLevel.termSubjects.length > 0) {
            return {
                success: false,
                error: "Cannot remove year level with attached subjects. Please remove subjects first.",
            };
        }

        if (termYearLevel.sections.length > 0) {
            return {
                success: false,
                error: "Cannot remove year level with existing sections. Please remove sections first.",
            };
        }

        // Soft delete
        const deleted = await prisma.termYearLevel.update({
            where: { id: termYearLevelId },
            data: { deletedAt: new Date() },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "DELETE",
            actionDescription: `Removed year level "${termYearLevel.yearLevel.name}" from academic term "${termYearLevel.academicTerm.year}"`,
            targetType: "TermYearLevel",
            targetId: termYearLevelId.toString(),
            targetName: `${termYearLevel.academicTerm.year} - ${termYearLevel.yearLevel.name}`,
            oldValues: termYearLevel,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: deleted };
    } catch (error) {
        console.error("Error removing year level from term:", error);
        return { success: false, error: "Failed to remove year level from term" };
    }
}

/**
 * Get all available year levels that can be added to a term
 */
export async function getAvailableYearLevels(termId: number) {
    try {
        // Get year levels already in this term
        const existingTermYearLevels = await prisma.termYearLevel.findMany({
            where: {
                academicTermId: termId,
                deletedAt: null,
            },
            select: {
                yearLevelId: true,
            },
        });

        const existingYearLevelIds = existingTermYearLevels.map(
            (tyl) => tyl.yearLevelId
        );

        // Get all active year levels not in this term
        const availableYearLevels = await prisma.yearLevel.findMany({
            where: {
                deletedAt: null,
                status: "ACTIVE",
                id: {
                    notIn: existingYearLevelIds,
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return { success: true, data: availableYearLevels };
    } catch (error) {
        console.error("Error getting available year levels:", error);
        return { success: false, error: "Failed to get available year levels" };
    }
}
