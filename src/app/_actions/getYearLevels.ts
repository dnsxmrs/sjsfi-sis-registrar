"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getYearLevels() {
    let logError: string | undefined = undefined;
    try {
        const yearLevels = await prisma.yearLevel.findMany({
            where: {
                status: 'ACTIVE', // Only active year levels
                deletedAt: null, // Only non-deleted year levels
            },
            orderBy: {
                id: 'desc' // Order by creation date to maintain insertion order
            }
        });

        // await logSystemAction({
        //     actionCategory: 'SYSTEM',
        //     actionType: 'VIEW',
        //     actionDescription: 'Fetch all year levels',
        //     targetType: 'YearLevel',
        //     targetId: 'all',
        //     status: 'SUCCESS',
        //     severityLevel: 'LOW',
        // });

        return {
            success: true,
            yearLevels,
            message: 'Year levels fetched successfully'
        };
    } catch (error) {
        console.error('Error fetching year levels:', error);
        logError = error instanceof Error ? error.message : 'Failed to fetch year levels';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch all year levels',
            targetType: 'YearLevel',
            targetId: 'all',
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'LOW',
        });
        return {
            success: false,
            yearLevels: [],
            error: logError
        };
    }
}
