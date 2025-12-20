'use server';

import { prisma } from '@/lib/prisma';

interface StudentNotificationData {
    id: number;
    studentNumber: string;
    firstName: string;
    middleName: string | null;
    familyName: string;
    email: string;
    missingRequirements?: string[];
}

export async function getStudentForNotification(studentNumber: string): Promise<{
    success: boolean;
    student?: StudentNotificationData;
    error?: string;
}> {
    try {
        // First, find the user with the student
        const user = await prisma.user.findFirst({
            where: {
                student: {
                    studentNumber: studentNumber,
                },
                role: 'STUDENT',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                familyName: true,
                student: {
                    select: {
                        studentNumber: true,
                    },
                },
            },
        });

        if (!user || !user.student) {
            return {
                success: false,
                error: 'Student not found',
            };
        }

        // Find the most recent student application by email match
        const studentApplication = await prisma.studentApplication.findFirst({
            where: {
                emailAddress: user.email,
                deletedAt: null,
            },
            select: {
                id: true,
                requirements: {
                    where: {
                        status: {
                            in: ['PENDING', 'REJECTED'],
                        },
                        deletedAt: null,
                    },
                    select: {
                        requirementType: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const missingRequirements =
            studentApplication?.requirements.map((req) => req.requirementType) || [];

        return {
            success: true,
            student: {
                id: user.id,
                studentNumber: user.student.studentNumber,
                firstName: user.firstName,
                middleName: user.middleName,
                familyName: user.familyName,
                email: user.email,
                missingRequirements,
            },
        };
    } catch (error) {
        console.error('Error fetching student for notification:', error);
        return {
            success: false,
            error: 'Failed to fetch student data',
        };
    }
}
