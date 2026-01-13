    // const [activeSubjectCount, setActiveSubjectCount] = useState(0);
    // const pendingRegistrationCount = 12; // Placeholder value
    // const pendingApplicationCount = 8;
    // const [activeStudentCount, setActiveStudentCount] = useState(0);
    // const activeTermCount = 3; // Placeholder value
    // const feedbackCount = 27; // Placeholder value
    // const approvedRegistrationCount = 45; // Placeholder value
    // const approvedApplicationCount = 30; // Placeholder value

'use server'

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getPendingRegistrationCount() {
    try {
        // Count pending registrations
        const pendingCount = await prisma.registration.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: pendingCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching pending registrations: ${error}`,
            targetType: "REGISTRATION",
            targetId: "pending-registrations",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching pending registrations:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch pending registrations",
        };
    }
}

export async function getPendingApplicationCount() {
    try {
        // Fetch pending applications
        const pendingApplications = await prisma.studentApplication.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: pendingApplications,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching pending registrations: ${error}`,
            targetType: "REGISTRATION",
            targetId: "pending-registrations",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching pending registrations:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch pending registrations",
        };
    }
}

export async function getActiveStudents() {
    try {
        // Count active students
        const activeStudentCount = await prisma.student.count({
            where: {
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: activeStudentCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching active students: ${error}`,
            targetType: "STUDENT",
            targetId: "active-students",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching active students:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch active students",
        };
    }
}

export async function getCriticalLogs() {
    try {
        // Count critical severity logs
        const criticalCount = await prisma.systemLog.count({
            where: {
                severityLevel: "CRITICAL",
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: criticalCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching critical logs: ${error}`,
            targetType: "SYSTEM_LOG",
            targetId: "critical-logs",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching critical logs:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch critical logs",
        };
    }
}

// Last week stats functions
export async function getLastWeekPendingRegistrationCount() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const pendingCount = await prisma.registration.count({
            where: {
                status: "PENDING",
                deletedAt: null,
                createdAt: {
                    lte: oneWeekAgo
                }
            },
        });

        return {
            success: true,
            count: pendingCount,
        };
    } catch (error) {
        console.error("Error fetching last week pending registrations:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch last week pending registrations",
        };
    }
}

export async function getLastWeekPendingApplicationCount() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const pendingCount = await prisma.studentApplication.count({
            where: {
                status: "PENDING",
                deletedAt: null,
                createdAt: {
                    lte: oneWeekAgo
                }
            },
        });

        return {
            success: true,
            count: pendingCount,
        };
    } catch (error) {
        console.error("Error fetching last week pending applications:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch last week pending applications",
        };
    }
}

export async function getLastWeekActiveStudents() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const activeStudentCount = await prisma.student.count({
            where: {
                deletedAt: null,
                createdAt: {
                    lte: oneWeekAgo
                }
            },
        });

        return {
            success: true,
            count: activeStudentCount,
        };
    } catch (error) {
        console.error("Error fetching last week active students:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch last week active students",
        };
    }
}

export async function getLastWeekCriticalLogs() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const criticalCount = await prisma.systemLog.count({
            where: {
                severityLevel: "CRITICAL",
                deletedAt: null,
                timestamp: {
                    lte: oneWeekAgo
                }
            },
        });

        return {
            success: true,
            count: criticalCount,
        };
    } catch (error) {
        console.error("Error fetching last week critical logs:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch last week critical logs",
        };
    }
}

export async function getEnrollmentByYearLevel() {
    try {
        // Get all year levels with their registration counts
        const yearLevels = await prisma.yearLevel.findMany({
            where: {
                deletedAt: null,
                status: "ACTIVE"
            },
            include: {
                studentApplications: {
                    where: {
                        deletedAt: null,
                        status: {
                            in: ["APPROVED"]
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Transform data for chart and filter out year levels with 0 students
        const enrollmentData = yearLevels
            .map(level => ({
                yearLevel: level.name,
                students: level.studentApplications.length
            }))
            .filter(level => level.students > 0);

        return {
            success: true,
            data: enrollmentData,
        };
    } catch (error) {
        console.error("Error fetching enrollment by year level:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch enrollment data",
        };
    }
}

export async function getRegistrationTypesCount() {
    try {
        // Group registrations by type and count them
        const registrationTypes = await prisma.registration.groupBy({
            by: ['registrationType'],
            where: {
                deletedAt: null,
            },
            _count: {
                registrationType: true
            }
        });

        // Transform data for chart
        const registrationTypeData = registrationTypes.map(type => ({
            type: type.registrationType,
            count: type._count.registrationType
        }));

        return {
            success: true,
            data: registrationTypeData,
        };
    } catch (error) {
        console.error("Error fetching registration types count:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch registration types count",
        };
    }
}

// get requirements count per requirement type and their status
export async function getRequirementsStatusCount() {
    try {
        // Group requirements by type and status, then count them
        const requirementsStatus = await prisma.requirements.groupBy({
            by: ['requirementType', 'status'],
            where: {
                deletedAt: null,
            },
            _count: {
                id: true
            }
        });

        // Get total counts per requirement type
        const requirementTypeCounts = await prisma.requirements.groupBy({
            by: ['requirementType'],
            where: {
                deletedAt: null,
            },
            _count: {
                id: true
            }
        });

        // Transform data for chart
        const requirementsData = requirementTypeCounts.map(type => {
            const approved = requirementsStatus.find(
                r => r.requirementType === type.requirementType && r.status === 'APPROVED'
            )?._count.id || 0;
            
            const total = type._count.id;

            return {
                requirementType: type.requirementType,
                approved,
                total,
                percentage: total > 0 ? Math.round((approved / total) * 100) : 0
            };
        });

        return {
            success: true,
            data: requirementsData,
        };
    } catch (error) {
        console.error("Error fetching requirements status count:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch requirements status count",
        };
    }
}

export async function getFeedbackStatusCount() {
    try {
        // Group feedbacks by type and count them
        const feedbackTypes = await prisma.feedback.groupBy({
            by: ['type'],
            where: {
                deletedAt: null,
            },
            _count: {
                id: true
            }
        });

        // Transform data for chart
        const feedbackData = feedbackTypes.map(type => ({
            type: type.type,
            count: type._count.id
        }));

        return {
            success: true,
            data: feedbackData,
        };
    } catch (error) {
        console.error("Error fetching feedback status count:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch feedback status count",
        };
    }
}

export async function getRecentFeedbacks(limit: number = 10) {
    try {
        // Get recent feedbacks
        const feedbacks = await prisma.feedback.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            select: {
                id: true,
                type: true,
                message: true,
                suggestion: true,
                status: true,
                createdAt: true
            }
        });

        return {
            success: true,
            data: feedbacks,
        };
    } catch (error) {
        console.error("Error fetching recent feedbacks:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch recent feedbacks",
        };
    }
}

export async function getRecentApplications(limit: number = 10) {
    try {
        // Get recent student applications
        // get studentNo, name, year level, submitted date, status
        const applications = await prisma.studentApplication.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            select: {
                id: true,
                applicationNumber: true,
                firstName: true,
                middleName: true,
                familyName: true,
                status: true,
                createdAt: true,
                yearLevel: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            data: applications,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching recent applications: ${error}`,
            targetType: "STUDENT_APPLICATION",
            targetId: "recent-applications",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching recent applications:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch recent applications",
        };
    }
}