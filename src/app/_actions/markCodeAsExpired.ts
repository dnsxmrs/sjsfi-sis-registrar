'use server'

import { prisma } from '@/lib/prisma';

export async function markCodeAsExpired(codeId: number) {
    try {
        const updatedCode = await prisma.registrationCode.update({
            where: {
                id: codeId
            },
            data: {
                status: 'EXPIRED',
                updatedAt: new Date()
            },
            select: {
                id: true,
                registrationCode: true,
                status: true,
                expirationDate: true,
                createdAt: true,
            }
        });

        // Convert Date objects to ISO strings for serialization
        return {
            success: true,
            code: {
                ...updatedCode,
                expirationDate: updatedCode.expirationDate ? updatedCode.expirationDate.toISOString() : null,
                createdAt: updatedCode.createdAt.toISOString(),
            }
        };
    } catch (error) {
        console.error('Error marking code as expired:', error);
        return {
            success: false,
            error: 'Failed to mark code as expired'
        };
    }
}
