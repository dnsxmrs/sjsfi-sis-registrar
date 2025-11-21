'use server'

import { prisma } from '@/lib/prisma';

export async function getRegistrationCodes() {
    try {
        const codes = await prisma.registrationCode.findMany({
            where: {
                deletedAt: null
            },
            select: {
                id: true,
                registrationCode: true,
                status: true,
                expirationDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
        });

        // Categorize codes by status
        const availableCodes = codes.filter(code => code.status === 'ACTIVE' && (!code.expirationDate || new Date() < code.expirationDate));
        const inactiveCodes = codes.filter(code => code.status === 'INACTIVE');
        const expiredCodes = codes.filter(code => code.status === 'EXPIRED' || (code.expirationDate && new Date() >= code.expirationDate));

        return {
            success: true,
            codes: {
                available: availableCodes,
                inactive: inactiveCodes,
                expired: expiredCodes
            }
        };
    } catch (error) {
        console.error('Error fetching registration codes:', error);
        return {
            success: false,
            error: 'Failed to fetch registration codes',
            codes: {
                available: [],
                inactive: [],
                expired: []
            }
        };
    }
}
