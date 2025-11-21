"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getStudentsByGradeLevel() {
    try {
        // Fetch all approved student applications with their year level
        const students = await prisma.studentApplication.findMany({
            where: {
                status: "APPROVED",
                deletedAt: null
            },
            select: {
                yearLevelId: true,
                yearLevel: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Group students by grade level and count
        const gradeLevelCounts = students.reduce((acc, student) => {
            const levelName = student.yearLevel.name;
            if (!acc[levelName]) {
                acc[levelName] = 0;
            }
            acc[levelName]++;
            return acc;
        }, {} as Record<string, number>);

        // Convert to array format for chart
        const data = Object.entries(gradeLevelCounts).map(([name, value]) => ({
            name,
            value
        }));

        // Sort by grade level (optional - you can customize the sorting)
        data.sort((a, b) => a.name.localeCompare(b.name));

        const totalStudents = students.length;

        return {
            success: true,
            data,
            totalStudents
        };
    } catch (error) {
        // Log the error in system logger - Non-blocking
        logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching students by grade level: ${error}`,
            targetType: "REPORT",
            targetId: "students-by-grade-level",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        }).catch(console.error); // Fire-and-forget logging
        console.error("Error in getStudentsByGradeLevel:", error);
        return {
            success: false,
            data: [],
            error: "Failed to fetch students by grade level",
        };
    }
}
