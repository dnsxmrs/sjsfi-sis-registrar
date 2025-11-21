'use server'

import { prisma } from "@/lib/prisma";
// import { logSystemAction } from "@/lib/systemLogger";

export async function getActiveStudents() {
    try {
        // Count active students
        console.log("Fetching count of active students...");
        const activeStudentCount = await prisma.student.count({
            where: {
                deletedAt: null,
            },
        });

        // Log the system action for fetching active students
        // await logSystemAction({
        //     actionCategory: "SYSTEM",
        //     actionType: "VIEW",
        //     actionDescription: `Fetched count of active students: ${activeStudentCount}`,
        //     targetType: "STUDENT",
        //     targetId: "active-students",
        //     status: "SUCCESS",
        //     severityLevel: "LOW",
        //     metadata: { count: activeStudentCount }
        // });

        console.log("Count of active students fetched successfully:", activeStudentCount);
        return {
            success: true,
            count: activeStudentCount,
        };
    } catch (error) {
        // Log the error in system logger
        // await logSystemAction({
        //     actionCategory: "SYSTEM",
        //     actionType: "VIEW",
        //     actionDescription: `Error fetching active students: ${error}`,
        //     targetType: "STUDENT",
        //     targetId: "active-students",
        //     status: "FAILED",
        //     severityLevel: "LOW",
        //     errorMessage: String(error)
        // });

        console.error("Error fetching active students:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch active students",
        };
    }
}
