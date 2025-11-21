'use server'

import { prisma } from '@/lib/prisma';
import { logRegistrationEvent } from '@/lib/systemLoggerHelpers';

export async function rejectRegistration(registrationId: number): Promise<{
    success: boolean;
    code?: string;
    error?: string;
}> {
    try {
        if (!registrationId || isNaN(registrationId)) {
            await logRegistrationEvent({
                actionType: 'UPDATE',
                actionSubType: 'REJECT',
                registrationId: registrationId?.toString() || 'invalid',
                success: false,
                errorMessage: 'Invalid registration ID',
                userName: 'System', // TODO: Get actual user
                userRole: 'REGISTRAR'
            });

            return { success: false, error: 'Invalid registration ID' };
        }

        // Check if registration exists
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            select: {
                id: true,
                status: true,
                studentApplicationId: true,
                firstName: true,
                familyName: true
            }
        });

        if (!registration) {
            return { success: false, error: 'Registration not found' };
        }

        if (registration.status === 'APPROVED') {
            return { success: false, error: 'Registration is already approved' };
        }

        const now = new Date();

        // Start transaction to update registration status and create code
        await prisma.$transaction(async (tx) => {
            // Update registration status to APPROVED
            await tx.registration.update({
                where: { id: registrationId },
                data: {
                    status: 'REJECTED',
                    updatedAt: now
                }
            });
        });

        console.log(`Registration ${registrationId} for ${registration.firstName} ${registration.familyName} rejected`);

        // Log successful rejection
        await logRegistrationEvent({
            actionType: 'UPDATE',
            actionSubType: 'REJECT',
            registrationId: registrationId.toString(),
            studentName: `${registration.firstName} ${registration.familyName}`,
            oldValues: { status: registration.status },
            newValues: { status: 'REJECTED' },
            success: true,
            userName: 'System', // TODO: Get actual user
            userRole: 'REGISTRAR'
        });

        return {
            success: true,
        };

    } catch (error) {
        console.error('Error approving registration:', error);
        return { success: false, error: 'Failed to approve registration' };
    }
};
