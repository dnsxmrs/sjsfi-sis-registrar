'use server';

import { prisma } from '@/lib/prisma';

interface StudentNotificationData {
    id: number;
    studentNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    missingRequirements?: string[];
}

export async function getStudentForNotification(studentNumber: string): Promise<{
    success: boolean;
    student?: StudentNotificationData;
    error?: string;
}> {
    try {
        const student = await prisma.user.findFirst({
            where: {
                Student: {
                    studentNumber: studentNumber,
                },
                role: 'STUDENT',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                lastName: true,
                Student: {
                    select: {
                        studentNumber: true,
                        phoneNumber: true,
                        StudentApplication: {
                            select: {
                                StudentApplicationRequirement: {
                                    where: {
                                        isSubmitted: false,
                                    },
                                    select: {
                                        Requirement: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!student || !student.Student) {
            return {
                success: false,
                error: 'Student not found',
            };
        }

        const missingRequirements =
            student.Student.StudentApplication[0]?.StudentApplicationRequirement.map(
                (req) => req.Requirement.name
            ) || [];

        return {
            success: true,
            student: {
                id: student.id,
                studentNumber: student.Student.studentNumber,
                firstName: student.firstName,
                middleName: student.middleName,
                lastName: student.lastName,
                email: student.email,
                phoneNumber: student.Student.phoneNumber,
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
