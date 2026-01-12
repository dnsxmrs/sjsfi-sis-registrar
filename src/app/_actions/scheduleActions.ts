"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

/**
 * Create a new schedule
 */
export async function createSchedule(data: {
    termSubjectId: number;
    sectionId?: number | null;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
}) {
    try {
        // Verify term-subject exists
        const termSubject = await prisma.termSubject.findFirst({
            where: {
                id: data.termSubjectId,
                deletedAt: null,
            },
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

        if (!termSubject) {
            return { success: false, error: "Term-subject not found" };
        }

        // If section is provided, verify it exists
        if (data.sectionId) {
            const section = await prisma.section.findFirst({
                where: {
                    id: data.sectionId,
                    deletedAt: null,
                },
            });

            if (!section) {
                return { success: false, error: "Section not found" };
            }
        }

        // Check for duplicate schedule (exact same termSubject, section, day, time)
        const duplicateSchedule = await prisma.schedule.findFirst({
            where: {
                termSubjectId: data.termSubjectId,
                sectionId: data.sectionId || null,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                deletedAt: null,
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        if (duplicateSchedule) {
            return {
                success: false,
                error: `A schedule for ${duplicateSchedule.termSubject.subject.name} already exists on ${data.day} from ${data.startTime} to ${data.endTime}`,
            };
        }

        // Check for room conflicts (same room, day, and overlapping time)
        const roomConflicts = await prisma.schedule.findMany({
            where: {
                room: data.room,
                day: data.day,
                deletedAt: null,
                termSubject: {
                    termYearLevel: {
                        academicTermId: termSubject.termYearLevel.academicTermId,
                    },
                },
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        // Check for time overlap in room
        for (const conflict of roomConflicts) {
            if (
                (data.startTime >= conflict.startTime &&
                    data.startTime < conflict.endTime) ||
                (data.endTime > conflict.startTime && data.endTime <= conflict.endTime) ||
                (data.startTime <= conflict.startTime && data.endTime >= conflict.endTime)
            ) {
                return {
                    success: false,
                    error: `Room conflict: Room ${data.room} is already booked for ${conflict.termSubject.subject.name} on ${data.day} from ${conflict.startTime} to ${conflict.endTime}`,
                };
            }
        }

        // Check for section conflicts (if section is provided)
        if (data.sectionId) {
            const sectionConflicts = await prisma.schedule.findMany({
                where: {
                    sectionId: data.sectionId,
                    day: data.day,
                    deletedAt: null,
                },
                include: {
                    termSubject: {
                        include: {
                            subject: true,
                        },
                    },
                },
            });

            for (const conflict of sectionConflicts) {
                if (
                    (data.startTime >= conflict.startTime &&
                        data.startTime < conflict.endTime) ||
                    (data.endTime > conflict.startTime && data.endTime <= conflict.endTime) ||
                    (data.startTime <= conflict.startTime && data.endTime >= conflict.endTime)
                ) {
                    return {
                        success: false,
                        error: `Section conflict: This section already has ${conflict.termSubject.subject.name} scheduled on ${data.day} from ${conflict.startTime} to ${conflict.endTime}`,
                    };
                }
            }
        }

        // Check for subject conflicts (same subject, same year level, overlapping time)
        const subjectConflicts = await prisma.schedule.findMany({
            where: {
                day: data.day,
                deletedAt: null,
                termSubject: {
                    subjectId: termSubject.subjectId,
                    termYearLevelId: termSubject.termYearLevelId,
                },
            },
            include: {
                section: true,
            },
        });

        for (const conflict of subjectConflicts) {
            if (
                (data.startTime >= conflict.startTime &&
                    data.startTime < conflict.endTime) ||
                (data.endTime > conflict.startTime && data.endTime <= conflict.endTime) ||
                (data.startTime <= conflict.startTime && data.endTime >= conflict.endTime)
            ) {
                const sectionInfo = conflict.section ? ` for section ${conflict.section.name}` : '';
                return {
                    success: false,
                    error: `Subject conflict: ${termSubject.subject.name} is already scheduled${sectionInfo} on ${data.day} from ${conflict.startTime} to ${conflict.endTime}`,
                };
            }
        }

        // Create the schedule
        const schedule = await prisma.schedule.create({
            data: {
                termSubjectId: data.termSubjectId,
                sectionId: data.sectionId || null,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
            },
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

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "CREATE",
            actionDescription: `Created schedule for ${termSubject.subject.name} on ${data.day} ${data.startTime}-${data.endTime} in ${data.room}`,
            targetType: "Schedule",
            targetId: schedule.id.toString(),
            targetName: `${termSubject.subject.name} - ${data.day} ${data.startTime}`,
            newValues: schedule,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: schedule };
    } catch (error) {
        console.error("Error creating schedule:", error);
        return { success: false, error: "Failed to create schedule" };
    }
}

/**
 * Get all schedules for a specific academic term
 */
export async function getSchedulesByTerm(termId: number) {
    try {
        const schedules = await prisma.schedule.findMany({
            where: {
                termSubject: {
                    termYearLevel: {
                        academicTermId: termId,
                    },
                },
                deletedAt: null,
            },
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

        return { success: true, data: schedules };
    } catch (error) {
        console.error("Error getting schedules by term:", error);
        return { success: false, error: "Failed to get schedules" };
    }
}

/**
 * Get all schedules for a specific term-year level
 */
export async function getSchedulesByTermYearLevel(termYearLevelId: number) {
    try {
        const schedules = await prisma.schedule.findMany({
            where: {
                termSubject: {
                    termYearLevelId: termYearLevelId,
                },
                deletedAt: null,
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                    },
                },
                section: true,
            },
            orderBy: [
                { day: "asc" },
                { startTime: "asc" },
            ],
        });

        return { success: true, data: schedules };
    } catch (error) {
        console.error("Error getting schedules by term-year level:", error);
        return { success: false, error: "Failed to get schedules" };
    }
}

/**
 * Get all schedules for a specific section
 */
export async function getSchedulesBySection(sectionId: number) {
    try {
        const schedules = await prisma.schedule.findMany({
            where: {
                sectionId: sectionId,
                deletedAt: null,
            },
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

        return { success: true, data: schedules };
    } catch (error) {
        console.error("Error getting schedules by section:", error);
        return { success: false, error: "Failed to get schedules" };
    }
}

/**
 * Get all schedules (for backward compatibility)
 */
export async function getAllSchedules() {
    try {
        const schedules = await prisma.schedule.findMany({
            where: {
                deletedAt: null,
            },
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

        return { success: true, data: schedules, schedules };
    } catch (error) {
        console.error("Error getting all schedules:", error);
        return { success: false, error: "Failed to get schedules", schedules: [] };
    }
}

/**
 * Update a schedule
 */
export async function updateSchedule(
    scheduleId: number,
    data: {
        day?: string;
        startTime?: string;
        endTime?: string;
        room?: string;
        sectionId?: number | null;
    }
) {
    try {
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                        termYearLevel: {
                            include: {
                                academicTerm: true,
                            },
                        },
                    },
                },
            },
        });

        if (!schedule || schedule.deletedAt) {
            return { success: false, error: "Schedule not found" };
        }

        // If updating time, room, or section, check for conflicts
        if (data.day || data.startTime || data.endTime || data.room || data.sectionId !== undefined) {
            const checkDay = data.day || schedule.day;
            const checkStartTime = data.startTime || schedule.startTime;
            const checkEndTime = data.endTime || schedule.endTime;
            const checkRoom = data.room || schedule.room;
            const checkSectionId = data.sectionId !== undefined ? data.sectionId : schedule.sectionId;

            // Check for duplicate schedule
            const duplicateSchedule = await prisma.schedule.findFirst({
                where: {
                    termSubjectId: schedule.termSubjectId,
                    sectionId: checkSectionId,
                    day: checkDay,
                    startTime: checkStartTime,
                    endTime: checkEndTime,
                    deletedAt: null,
                    id: { not: scheduleId },
                },
            });

            if (duplicateSchedule) {
                return {
                    success: false,
                    error: `A schedule for ${schedule.termSubject.subject.name} already exists with these exact details`,
                };
            }

            // Check for room conflicts
            const roomConflicts = await prisma.schedule.findMany({
                where: {
                    room: checkRoom,
                    day: checkDay,
                    deletedAt: null,
                    id: { not: scheduleId },
                    termSubject: {
                        termYearLevel: {
                            academicTermId:
                                schedule.termSubject.termYearLevel.academicTermId,
                        },
                    },
                },
                include: {
                    termSubject: {
                        include: {
                            subject: true,
                        },
                    },
                },
            });

            // Check for time overlap in room
            for (const conflict of roomConflicts) {
                if (
                    (checkStartTime >= conflict.startTime &&
                        checkStartTime < conflict.endTime) ||
                    (checkEndTime > conflict.startTime &&
                        checkEndTime <= conflict.endTime) ||
                    (checkStartTime <= conflict.startTime &&
                        checkEndTime >= conflict.endTime)
                ) {
                    return {
                        success: false,
                        error: `Room conflict: Room ${checkRoom} is already booked for ${conflict.termSubject.subject.name} on ${checkDay} from ${conflict.startTime} to ${conflict.endTime}`,
                    };
                }
            }

            // Check for section conflicts (if section is provided)
            if (checkSectionId) {
                const sectionConflicts = await prisma.schedule.findMany({
                    where: {
                        sectionId: checkSectionId,
                        day: checkDay,
                        deletedAt: null,
                        id: { not: scheduleId },
                    },
                    include: {
                        termSubject: {
                            include: {
                                subject: true,
                            },
                        },
                    },
                });

                for (const conflict of sectionConflicts) {
                    if (
                        (checkStartTime >= conflict.startTime &&
                            checkStartTime < conflict.endTime) ||
                        (checkEndTime > conflict.startTime &&
                            checkEndTime <= conflict.endTime) ||
                        (checkStartTime <= conflict.startTime &&
                            checkEndTime >= conflict.endTime)
                    ) {
                        return {
                            success: false,
                            error: `Section conflict: This section already has ${conflict.termSubject.subject.name} scheduled on ${checkDay} from ${conflict.startTime} to ${conflict.endTime}`,
                        };
                    }
                }
            }

            // Check for subject conflicts (same subject, same year level, overlapping time)
            const subjectConflicts = await prisma.schedule.findMany({
                where: {
                    day: checkDay,
                    deletedAt: null,
                    id: { not: scheduleId },
                    termSubject: {
                        subjectId: schedule.termSubject.subjectId,
                        termYearLevelId: schedule.termSubject.termYearLevelId,
                    },
                },
                include: {
                    section: true,
                    termSubject: {
                        include: {
                            subject: true,
                        },
                    },
                },
            });

            for (const conflict of subjectConflicts) {
                if (
                    (checkStartTime >= conflict.startTime &&
                        checkStartTime < conflict.endTime) ||
                    (checkEndTime > conflict.startTime &&
                        checkEndTime <= conflict.endTime) ||
                    (checkStartTime <= conflict.startTime &&
                        checkEndTime >= conflict.endTime)
                ) {
                    const sectionInfo = conflict.section ? ` for section ${conflict.section.name}` : '';
                    return {
                        success: false,
                        error: `Subject conflict: ${schedule.termSubject.subject.name} is already scheduled${sectionInfo} on ${checkDay} from ${conflict.startTime} to ${conflict.endTime}`,
                    };
                }
            }
        }

        const updated = await prisma.schedule.update({
            where: { id: scheduleId },
            data: {
                ...(data.day && { day: data.day }),
                ...(data.startTime && { startTime: data.startTime }),
                ...(data.endTime && { endTime: data.endTime }),
                ...(data.room && { room: data.room }),
                ...(data.sectionId !== undefined && { sectionId: data.sectionId }),
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
            actionDescription: `Updated schedule for ${schedule.termSubject.subject.name}`,
            targetType: "Schedule",
            targetId: scheduleId.toString(),
            targetName: `${schedule.termSubject.subject.name}`,
            oldValues: schedule,
            newValues: updated,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: updated, schedule: updated };
    } catch (error) {
        console.error("Error updating schedule:", error);
        return { success: false, error: "Failed to update schedule" };
    }
}

/**
 * Delete a schedule (soft delete)
 */
export async function deleteSchedule(scheduleId: number) {
    try {
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

        const deleted = await prisma.schedule.update({
            where: { id: scheduleId },
            data: { deletedAt: new Date() },
        });

        // Log the action
        await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "DELETE",
            actionDescription: `Deleted schedule for ${schedule.termSubject.subject.name} on ${schedule.day}`,
            targetType: "Schedule",
            targetId: scheduleId.toString(),
            targetName: `${schedule.termSubject.subject.name}`,
            oldValues: schedule,
            status: "SUCCESS",
            severityLevel: "MEDIUM",
        });

        return { success: true, data: deleted };
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return { success: false, error: "Failed to delete schedule" };
    }
}

