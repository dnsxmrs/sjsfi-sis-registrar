'use server'

import { prisma } from '@/lib/prisma'
import { logSystemAction } from '@/lib/systemLogger'

/**
 * Generates a unique registration code in the format REG-XXXXXXXX
 * The code consists of:
 * - REG prefix for registration
 * - 8 character alphanumeric suffix (excluding confusing characters like 0, O, I, l)
 */
async function generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded: 0, O, I, 1
    const codeLength = 8;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        let code = 'REG-';

        // Generate random 8-character suffix
        for (let i = 0; i < codeLength; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if code already exists in database
        const existingCode = await prisma.registrationCode.findUnique({
            where: { registrationCode: code },
            select: { id: true }
        });

        if (!existingCode) {
            return code;
        }

        attempts++;
    }

    const now = new Date();
    const timestamp = now.getTime();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REG-${timestamp}${randomSuffix}`;
}

export async function generateRegistrationCode(): Promise<{
    success: boolean;
    code?: string;
    error?: string;
}> {
    try {
        const code = await generateUniqueCode();

        const now = new Date();
        const expirationDate = new Date(now.getTime() + 60 * 60 * 1000);

        console.log(`Generated registration code: ${code} at ${now.toISOString()}`);

        await prisma.registrationCode.create({
            data: {
                registrationCode: code,
                status: 'ACTIVE',
                expirationDate: expirationDate,
                createdAt: now
            }
        });

        // Log the system action for generating registration code
        await logSystemAction({
            actionCategory: "REGISTRATION",
            actionType: "CREATE",
            actionDescription: `Generated registration code: ${code}`,
            targetType: "REGISTRATION_CODE",
            targetId: code,
            status: "SUCCESS",
            severityLevel: "LOW",
            metadata: { expirationDate: expirationDate.toISOString() }
        });

        return {
            success: true,
            code: code
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "REGISTRATION",
            actionType: "CREATE",
            actionDescription: `Error generating registration code: ${error}`,
            targetType: "REGISTRATION_CODE",
            targetId: "unknown",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });
        console.error('Error generating registration code:', error);
        return {
            success: false,
            error: 'Failed to generate registration code'
        };
    }
}

/**
 * Validates if a registration code exists and is valid
 */
export async function validateRegistrationCode(code: string): Promise<{
    success: boolean;
    isValid?: boolean;
    registrationId?: number;
    error?: string;
}> {
    try {
        if (!code || !code.startsWith('REG-')) {
            return {
                success: true,
                isValid: false
            };
        }

        const registration = await prisma.registrationCode.findUnique({
            where: { registrationCode: code },
            select: {
                id: true,
                status: true,
                expirationDate: true,
                createdAt: true
            }
        });

        console.log('Registration code details:', registration);
        console.log('date today:', new Date());

        // check if code is active, not expired
        if (
            registration?.status !== 'ACTIVE' ||
            !registration?.expirationDate ||
            registration.expirationDate < new Date()
        ) {
            return {
                success: true,
                isValid: false
            };
        }

        return {
            success: true,
            isValid: true,
            registrationId: registration.id
        };
    } catch (error) {
        console.error('Error validating registration code:', error);
        return {
            success: false,
            error: 'Failed to validate registration code'
        };
    }
}

export async function generateUniqueApplicationCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded: 0, O, I, 1
    const codeLength = 8;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        let code = 'APP-';

        // Generate random 8-character suffix
        for (let i = 0; i < codeLength; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Check if code already exists in database
        const existingCode = await prisma.registrationCode.findUnique({
            where: { registrationCode: code },
            select: { id: true }
        });

        if (!existingCode) {
            return code;
        }

        attempts++;
    }

    const now = new Date();
    const timestamp = now.getTime();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `APP-${timestamp}${randomSuffix}`;
}

export async function generateApplicationCode(RegistrationId: string): Promise<{
    success: boolean;
    code?: string;
    registrationCodeId?: number;
    error?: string;
}> {
    try {
        const code = await generateUniqueApplicationCode();

        const now = new Date();
        const expirationDate = new Date(now.getTime() + 60 * 60 * 1000);

        console.log(`Generated application code: ${code} at ${now.toISOString()}`);

        await prisma.registrationCode.create({
            data: {
                registrationCode: code,
                status: 'ACTIVE',
                expirationDate: expirationDate,
                applicationId: parseInt(RegistrationId, 10), // Ensure this is a number
                createdAt: now
            }
        });

        // Log the system action for generating application code
        await logSystemAction({
            actionCategory: "REGISTRATION",
            actionType: "CREATE",
            actionDescription: `Generated application code: ${code} for registrationId: ${RegistrationId}`,
            targetType: "APPLICATION_CODE",
            targetId: code,
            status: "SUCCESS",
            severityLevel: "LOW",
            metadata: { expirationDate: expirationDate.toISOString(), registrationId: RegistrationId }
        });

        return {
            success: true,
            code: code
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "REGISTRATION",
            actionType: "CREATE",
            actionDescription: `Error generating application code for registrationId ${RegistrationId}: ${error}`,
            targetType: "APPLICATION_CODE",
            targetId: "unknown",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });
        console.error('Error generating application code for application:', error);
        return {
            success: false,
            error: 'Failed to generate application code for application'
        };
    }
}

export async function validateApplicationCode(code: string): Promise<{
    success: boolean;
    isValid?: boolean;
    applicationId?: number;
    registrationType?: string;
    error?: string;
}> {
    try {
        if (!code || !code.startsWith('APP-')) {
            return {
                success: true,
                isValid: false
            };
        }

        const application = await prisma.registrationCode.findUnique({
            where: { registrationCode: code },
            select: {
                id: true,
                status: true,
                expirationDate: true,
                registrationId: true,
                createdAt: true,
                registration: {
                    select: {
                        registrationType: true
                    }
                }
            }
        });

        // check if code is active, not expired, and has applicationId
        if (
            application?.status !== 'ACTIVE' ||
            !application?.expirationDate ||
            application.expirationDate < new Date() ||
            !application?.registrationId
        ) {
            return {
                success: true,
                isValid: false
            };
        }

        return {
            success: true,
            isValid: true,
            applicationId: application.registrationId,
            registrationType: application.registration?.registrationType || 'NEW'
        };
    } catch (error) {
        console.error('Error validating application code:', error);
        return {
            success: false,
            error: 'Failed to validate application code'
        };
    }
}

export async function validateApplicationCodeURL(code: string) {
    const application = await prisma.registrationCode.findUnique({
        where: { registrationCode: code, status: 'ACTIVE', deletedAt: null, applicationId: null },
        select: {
            id: true,
            status: true,
            expirationDate: true,
            registrationId: true,
            applicationId: true,
            createdAt: true
        }
    });

    if (
        !application ||
        !application?.expirationDate ||
        application.expirationDate < new Date() ||
        !application.applicationId
    ) {
        return {
            success: true,
            isValid: false
        };
    }

    return {
        success: true,
        isValid: true,
    };
}