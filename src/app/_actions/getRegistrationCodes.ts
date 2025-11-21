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

        // Convert Date objects to ISO strings for serialization
        const serializedCodes = codes.map(code => ({
            ...code,
            expirationDate: code.expirationDate ? code.expirationDate.toISOString() : null,
            createdAt: code.createdAt.toISOString(),
        }));

        // Categorize codes by status
        const availableCodes = serializedCodes.filter(code => code.status === 'ACTIVE' && (!code.expirationDate || new Date() < new Date(code.expirationDate)));
        const inactiveCodes = serializedCodes.filter(code => code.status === 'INACTIVE');
        const expiredCodes = serializedCodes.filter(code => code.status === 'EXPIRED' || (code.expirationDate && new Date() >= new Date(code.expirationDate)));

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


export async function getAllCodes() {
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

        // Convert Date objects to ISO strings for serialization
        const serializedCodes = codes.map(code => ({
            ...code,
            expirationDate: code.expirationDate ? code.expirationDate.toISOString() : null,
            createdAt: code.createdAt.toISOString(),
        }));

        // Categorize codes by status
        const availableCodes = serializedCodes.filter(code => code.status === 'ACTIVE');
        const inactiveCodes = serializedCodes.filter(code => code.status === 'INACTIVE');
        const expiredCodes = serializedCodes.filter(code => code.status === 'EXPIRED');

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
