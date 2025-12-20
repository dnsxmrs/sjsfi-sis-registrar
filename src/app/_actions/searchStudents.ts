'use server';

import { prisma } from '@/lib/prisma';

export async function searchStudents(query: string) {
    try {
        const students = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                status: 'ACTIVE',
                OR: [
                    {
                        firstName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        familyName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        student: {
                            studentNumber: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                firstName: true,
                familyName: true,
                email: true,
                student: {
                    select: {
                        studentNumber: true,
                    },
                },
            },
            take: 20,
        });

        const formattedStudents = students
            .filter((student) => student.student)
            .map((student) => ({
                id: student.id,
                firstName: student.firstName,
                lastName: student.familyName,
                email: student.email,
                studentNumber: student.student!.studentNumber,
            }));

        return {
            success: true,
            students: formattedStudents,
        };
    } catch (error) {
        console.error('Error searching students:', error);
        return {
            success: false,
            error: 'Failed to search students',
        };
    }
}
