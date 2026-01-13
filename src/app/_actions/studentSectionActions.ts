"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

/**
 * Assign a student to a section
 */
export async function assignStudentToSection(
    studentApplicationId: number,
    sectionId: number
) {
    try {
        // Get student application
        const student = await prisma.studentApplication.findUnique({
            where: { id: studentApplicationId },
            include: {
                academicYear: true,
                yearLevel: true,
            },
        });

        if (!student || student.deletedAt) {
            return { success: false, error: "Student application not found" };
        }

        // Get section with its term year level
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                termYearLevel: {
                    include: {
                        academicTerm: true,
                        yearLevel: true,
                    },
                },
                _count: {
                    select: { studentApplications: true },
                },
            },
        });

        if (!section || section.deletedAt) {
            return { success: false, error: "Section not found" };
        }

        // Check if section is full
        if (section._count.studentApplications >= section.capacity) {
            return {
                success: false,
                error: `Section is full (${section.capacity}/${section.capacity})`,
            };
        }

        // Verify that student's academic year and year level match the section
        if (student.academicYearId !== section.termYearLevel.academicTermId) {
            return {
                success: false,
                error: `Student academic year (${student.academicYear.year}) doesn't match section term (${section.termYearLevel.academicTerm.year})`,
            };
        }

        if (student.yearLevelId !== section.termYearLevel.yearLevelId) {
            return {
                success: false,
                error: `Student year level (${student.yearLevel.name}) doesn't match section year level (${section.termYearLevel.yearLevel.name})`,
            };
        }

        // Assign student to section
        const updated = await prisma.studentApplication.update({
            where: { id: studentApplicationId },
            data: { sectionId: sectionId },
            select: {
                id: true,
                applicationNumber: true,
                familyName: true,
                firstName: true,
                middleName: true,
                gender: true,
                status: true,
                emailAddress: true,
                mobileNumber: true,
                sectionId: true,
            },
        });

        // Update section's current students count
        await prisma.section.update({
            where: { id: sectionId },
            data: {
                currentStudents: {
                    increment: 1,
                },
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionDescription: `Assigned student "${student.firstName} ${student.familyName}" to section "${section.name}"`,
            targetType: "StudentApplication",
            targetId: studentApplicationId.toString(),
            targetName: `${student.firstName} ${student.familyName}`,
            oldValues: { sectionId: student.sectionId },
            newValues: { sectionId: sectionId },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error assigning student to section:", error);
        return { success: false, error: "Failed to assign student to section" };
    }
}

/**
 * Remove a student from a section
 */
export async function removeStudentFromSection(studentApplicationId: number) {
    try {
        const student = await prisma.studentApplication.findUnique({
            where: { id: studentApplicationId },
            include: {
                section: true,
            },
        });

        if (!student || student.deletedAt) {
            return { success: false, error: "Student application not found" };
        }

        if (!student.sectionId) {
            return { success: false, error: "Student is not assigned to any section" };
        }

        const oldSectionId = student.sectionId;
        const oldSectionName = student.section?.name;

        // Remove student from section
        const updated = await prisma.studentApplication.update({
            where: { id: studentApplicationId },
            data: { sectionId: null },
            select: {
                id: true,
                applicationNumber: true,
                familyName: true,
                firstName: true,
                middleName: true,
                gender: true,
                status: true,
                emailAddress: true,
                mobileNumber: true,
                sectionId: true,
            },
        });

        // Update section's current students count
        await prisma.section.update({
            where: { id: oldSectionId },
            data: {
                currentStudents: {
                    decrement: 1,
                },
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionDescription: `Removed student "${student.firstName} ${student.familyName}" from section "${oldSectionName}"`,
            targetType: "StudentApplication",
            targetId: studentApplicationId.toString(),
            targetName: `${student.firstName} ${student.familyName}`,
            oldValues: { sectionId: oldSectionId },
            newValues: { sectionId: null },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error removing student from section:", error);
        return { success: false, error: "Failed to remove student from section" };
    }
}

/**
 * Get all students in a section
 */
export async function getStudentsInSection(sectionId: number) {
    try {
        const students = await prisma.studentApplication.findMany({
            where: {
                sectionId: sectionId,
                deletedAt: null,
            },
            select: {
                id: true,
                applicationNumber: true,
                familyName: true,
                firstName: true,
                middleName: true,
                gender: true,
                status: true,
                emailAddress: true,
                mobileNumber: true,
            },
            orderBy: [{ familyName: "asc" }, { firstName: "asc" }],
        });

        return { success: true, data: students };
    } catch (error) {
        console.error("Error getting students in section:", error);
        return { success: false, error: "Failed to get students" };
    }
}

/**
 * Get unassigned students for a term and year level
 */
export async function getUnassignedStudents(
    academicYearId: number,
    yearLevelId: number
) {
    try {
        const students = await prisma.studentApplication.findMany({
            where: {
                academicYearId: academicYearId,
                yearLevelId: yearLevelId,
                sectionId: null,
                deletedAt: null,
                status: "APPROVED", // Only approved students can be assigned
            },
            select: {
                id: true,
                applicationNumber: true,
                familyName: true,
                firstName: true,
                middleName: true,
                gender: true,
                emailAddress: true,
                mobileNumber: true,
            },
            orderBy: [{ familyName: "asc" }, { firstName: "asc" }],
        });

        return { success: true, data: students };
    } catch (error) {
        console.error("Error getting unassigned students:", error);
        return { success: false, error: "Failed to get unassigned students" };
    }
}

/**
 * Bulk assign students to a section
 */
export async function bulkAssignStudentsToSection(
    studentApplicationIds: number[],
    sectionId: number
) {
    try {
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const studentId of studentApplicationIds) {
            const result = await assignStudentToSection(studentId, sectionId);
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push(result.error || "Unknown error");
            }
        }

        return {
            success: true,
            data: results,
            message: `Assigned ${results.success} student(s), ${results.failed} failed`,
        };
    } catch (error) {
        console.error("Error bulk assigning students:", error);
        return { success: false, error: "Failed to bulk assign students" };
    }
}
