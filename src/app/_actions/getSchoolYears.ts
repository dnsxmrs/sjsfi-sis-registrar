"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getSchoolYears() {
    let logError: string | undefined = undefined;
    try {
        const schoolYears = await prisma.academicTerm.findMany({
            where: {
                status: 'ACTIVE', // Only active school years
                deletedAt: null, // Only non-deleted students
            },
        });

        // await logSystemAction({
        //     actionCategory: 'SYSTEM',
        //     actionType: 'VIEW',
        //     actionDescription: 'Fetch active school years',
        //     targetType: 'AcademicTerm',
        //     targetId: 'all',
        //     status: 'SUCCESS',
        //     severityLevel: 'LOW',
        // });

        return {
            success: true,
            schoolYears,
            message: 'School years fetched successfully'
        };
    } catch (error) {
        logError = error instanceof Error ? error.message : 'Failed to fetch school years';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch active school years',
            targetType: 'AcademicTerm',
            targetId: 'all',
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'LOW',
        });
        console.error('Error fetching school years:', error);
        return {
            success: false,
            schoolYears: [],
            error: logError
        };
    }
}

export async function getSchoolAllYears() {
    let logError: string | undefined = undefined;
    try {
        const schoolYears = await prisma.academicTerm.findMany({
            where: {
                deletedAt: null, // Only non-deleted school years
            },
            orderBy: [
                { startDate: 'desc' }, // Latest school year first
                { createdAt: 'desc' }  // Secondary sort by creation date
            ]
        });

        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch all school years',
            targetType: 'AcademicTerm',
            targetId: 'all',
            status: 'SUCCESS',
            severityLevel: 'LOW',
        });

        return {
            success: true,
            schoolYears,
            message: 'School years fetched successfully'
        };
    } catch (error) {
        logError = error instanceof Error ? error.message : 'Failed to fetch school years';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch all school years',
            targetType: 'AcademicTerm',
            targetId: 'all',
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'LOW',
        });
        console.error('Error fetching school years:', error);
        return {
            success: false,
            schoolYears: [],
            error: logError
        };
    }
}
