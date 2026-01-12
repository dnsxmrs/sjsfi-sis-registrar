"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

/**
 * Assign a teacher to a schedule
 */
export async function assignTeacherToSchedule(
    scheduleId: number,
    teacherData: {
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
    },
    apiKey?: string
) {
    try {
        // Validate API key if provided (for HRMS integration)
        if (apiKey) {
            const isValidKey = await validateApiKey(apiKey);
            if (!isValidKey) {
                return { success: false, error: "Invalid API key" };
            }
        }

        // Verify schedule exists
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                        termYearLevel: {
                            include: {
                                academicTerm: true,
                                yearLevel: true,
                            },
                        },
                    },
                },
                section: true,
            },
        });

        if (!schedule || schedule.deletedAt) {
            return { success: false, error: "Schedule not found" };
        }

        // Check if schedule already has a teacher assigned
        if (schedule.teacherId) {
            return {
                success: false,
                error: `This schedule is already assigned to ${schedule.teacherName}`,
            };
        }

        // Assign the teacher
        const updated = await prisma.schedule.update({
            where: { id: scheduleId },
            data: {
                teacherId: teacherData.teacherId,
                teacherName: teacherData.teacherName,
                teacherEmail: teacherData.teacherEmail,
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                    },
                },
                section: true,
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionSubType: "TEACHER_ASSIGNMENT",
            actionDescription: `Assigned teacher ${teacherData.teacherName} to ${schedule.termSubject.subject.name} schedule`,
            targetType: "Schedule",
            targetId: scheduleId.toString(),
            targetName: `${schedule.termSubject.subject.name} - ${schedule.day} ${schedule.startTime}`,
            oldValues: {
                teacherId: schedule.teacherId,
                teacherName: schedule.teacherName,
                teacherEmail: schedule.teacherEmail,
            },
            newValues: {
                teacherId: teacherData.teacherId,
                teacherName: teacherData.teacherName,
                teacherEmail: teacherData.teacherEmail,
            },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error assigning teacher:", error);
        return { success: false, error: "Failed to assign teacher to schedule" };
    }
}

/**
 * Bulk assign teachers to multiple schedules
 */
export async function bulkAssignTeachers(
    assignments: Array<{
        scheduleId: number;
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
    }>,
    apiKey?: string
) {
    try {
        // Validate API key if provided (for HRMS integration)
        if (apiKey) {
            const isValidKey = await validateApiKey(apiKey);
            if (!isValidKey) {
                return { success: false, error: "Invalid API key" };
            }
        }

        const results: {
            successful: Array<{ scheduleId: number; teacherId: string }>;
            failed: Array<{ scheduleId: number; teacherId: string; error?: string }>;
        } = {
            successful: [],
            failed: [],
        };

        // Process each assignment
        for (const assignment of assignments) {
            const result = await assignTeacherToSchedule(
                assignment.scheduleId,
                {
                    teacherId: assignment.teacherId,
                    teacherName: assignment.teacherName,
                    teacherEmail: assignment.teacherEmail,
                }
            );

            if (result.success) {
                results.successful.push({
                    scheduleId: assignment.scheduleId,
                    teacherId: assignment.teacherId,
                });
            } else {
                results.failed.push({
                    scheduleId: assignment.scheduleId,
                    teacherId: assignment.teacherId,
                    error: result.error,
                });
            }
        }

        // Log the bulk action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionSubType: "BULK_TEACHER_ASSIGNMENT",
            actionDescription: `Bulk assigned teachers: ${results.successful.length} successful, ${results.failed.length} failed`,
            targetType: "Schedule",
            targetId: "bulk",
            targetName: "Bulk Teacher Assignment",
            newValues: results,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return {
            success: true,
            data: results,
            message: `Assigned ${results.successful.length} teachers successfully, ${results.failed.length} failed`,
        };
    } catch (error) {
        console.error("Error in bulk teacher assignment:", error);
        return { success: false, error: "Failed to process bulk assignment" };
    }
}

/**
 * Remove teacher assignment from a schedule
 */
export async function removeTeacherFromSchedule(
    scheduleId: number,
    apiKey?: string
) {
    try {
        // Validate API key if provided (for HRMS integration)
        if (apiKey) {
            const isValidKey = await validateApiKey(apiKey);
            if (!isValidKey) {
                return { success: false, error: "Invalid API key" };
            }
        }

        // Verify schedule exists
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        if (!schedule || schedule.deletedAt) {
            return { success: false, error: "Schedule not found" };
        }

        if (!schedule.teacherId) {
            return { success: false, error: "No teacher assigned to this schedule" };
        }

        // Remove the teacher
        const updated = await prisma.schedule.update({
            where: { id: scheduleId },
            data: {
                teacherId: null,
                teacherName: null,
                teacherEmail: null,
            },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionSubType: "TEACHER_UNASSIGNMENT",
            actionDescription: `Removed teacher ${schedule.teacherName} from ${schedule.termSubject.subject.name} schedule`,
            targetType: "Schedule",
            targetId: scheduleId.toString(),
            targetName: `${schedule.termSubject.subject.name} - ${schedule.day} ${schedule.startTime}`,
            oldValues: {
                teacherId: schedule.teacherId,
                teacherName: schedule.teacherName,
                teacherEmail: schedule.teacherEmail,
            },
            newValues: {
                teacherId: null,
                teacherName: null,
                teacherEmail: null,
            },
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error removing teacher:", error);
        return { success: false, error: "Failed to remove teacher from schedule" };
    }
}

/**
 * Get available schedules for HRMS to retrieve
 */
export async function getAvailableSchedules(
    termId: number,
    filters?: {
        yearLevelId?: number;
        unassignedOnly?: boolean;
    },
    apiKey?: string
) {
    try {
        // Validate API key if provided (for HRMS integration)
        if (apiKey) {
            const isValidKey = await validateApiKey(apiKey);
            if (!isValidKey) {
                return { success: false, error: "Invalid API key" };
            }
        }

        type WhereClause = {
            termSubject: {
                termYearLevel: {
                    academicTermId: number;
                    yearLevelId?: number;
                };
            };
            deletedAt: null;
            teacherId?: null;
        };

        const whereClause: WhereClause = {
            termSubject: {
                termYearLevel: {
                    academicTermId: termId,
                    ...(filters?.yearLevelId && {
                        yearLevelId: filters.yearLevelId,
                    }),
                },
            },
            deletedAt: null,
        };

        // Filter for unassigned schedules only
        if (filters?.unassignedOnly) {
            whereClause.teacherId = null;
        }

        const schedules = await prisma.schedule.findMany({
            where: whereClause,
            include: {
                termSubject: {
                    include: {
                        subject: true,
                        termYearLevel: {
                            include: {
                                academicTerm: true,
                                yearLevel: true,
                            },
                        },
                    },
                },
                section: true,
            },
            orderBy: [
                { day: "asc" },
                { startTime: "asc" },
            ],
        });

        // Format for HRMS consumption
        const formattedSchedules = schedules.map((schedule) => ({
            scheduleId: schedule.id,
            subject: {
                id: schedule.termSubject.subject.id,
                code: schedule.termSubject.subject.code,
                name: schedule.termSubject.subject.name,
                units: schedule.termSubject.subject.units,
            },
            yearLevel: {
                id: schedule.termSubject.termYearLevel.yearLevel.id,
                name: schedule.termSubject.termYearLevel.yearLevel.name,
            },
            section: schedule.section
                ? {
                    id: schedule.section.id,
                    name: schedule.section.name,
                    capacity: schedule.section.capacity,
                }
                : null,
            schedule: {
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                room: schedule.room,
            },
            teacher: schedule.teacherId
                ? {
                    teacherId: schedule.teacherId,
                    teacherName: schedule.teacherName,
                    teacherEmail: schedule.teacherEmail,
                }
                : null,
            isAssigned: !!schedule.teacherId,
        }));

        return {
            success: true,
            data: formattedSchedules,
            count: formattedSchedules.length,
        };
    } catch (error) {
        console.error("Error getting available schedules:", error);
        return { success: false, error: "Failed to get available schedules" };
    }
}

/**
 * Validate API key for HRMS integration
 * TODO: Implement proper API key validation with database storage
 */
async function validateApiKey(apiKey: string): Promise<boolean> {
    // Temporary validation - replace with actual implementation
    const validKeys = process.env.HRMS_API_KEYS?.split(",") || [];
    return validKeys.includes(apiKey);
}
