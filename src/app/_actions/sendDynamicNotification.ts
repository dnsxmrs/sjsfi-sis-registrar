'use server';

import { prisma } from '@/lib/prisma';
// import { logSystemAction } from '@/lib/systemLogger';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

interface SendNotificationPayload {
    title: string;
    description: string;
    type: 'info' | 'warning' | 'system';
    scope: 'GENERAL' | 'GROUP' | 'USER';
    groupTypes?: ('STUDENT' | 'ADMIN' | 'REGISTRAR')[];
    recipientIds?: number[];
}

export async function sendNotification(payload: SendNotificationPayload) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized',
            };
        }

        // Get user from Clerk to access privateMetadata
        const clerkUser = await clerkClient.users.getUser(userId);
        const userRoles = (clerkUser?.privateMetadata?.roles || clerkUser?.privateMetadata?.role) as
            | string[]
            | string
            | undefined;

        // Determine sender role with admin taking precedence
        let senderRole = 'ADMIN';

        if (userRoles) {
            const rolesArray = Array.isArray(userRoles)
                ? userRoles.map(r => r.toLowerCase())
                : [userRoles.toString().toLowerCase()];

            if (rolesArray.includes('admin')) {
                senderRole = 'ADMIN';
            } else if (rolesArray.includes('registrar')) {
                senderRole = 'REGISTRAR';
            } else if (rolesArray.includes('student')) {
                senderRole = 'STUDENT';
            }
        }

        if (payload.scope === 'GENERAL') {
            // Get all active users (only students have user accounts)
            const allUsers = await prisma.user.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true },
            });
            const recipientIds = allUsers.map((u) => u.id);

            // Create single notification for everyone
            await prisma.notification.create({
                data: {
                    title: payload.title,
                    description: payload.description,
                    type: payload.type,
                    scope: 'GENERAL',
                    senderType: senderRole,
                },
            });

            return {
                success: true,
                message: `Notification sent to all users (${recipientIds.length} recipient${recipientIds.length > 1 ? 's' : ''})`,
            };
        } else if (payload.scope === 'GROUP' && payload.groupTypes && payload.groupTypes.length > 0) {
            // Create separate notification record for each role
            let totalRecipients = 0;
            let notificationsCreated = 0;

            for (const role of payload.groupTypes) {
                // Get users for this role
                const groupUsers = await prisma.user.findMany({
                    where: {
                        status: 'ACTIVE',
                        role: role,
                    },
                    select: { id: true },
                });

                const recipientIds = groupUsers.map((u) => u.id);

                // Create notification record even if no recipients (for ADMIN/REGISTRAR)
                await prisma.notification.create({
                    data: {
                        title: payload.title,
                        description: payload.description,
                        type: payload.type,
                        scope: role.toLocaleUpperCase() as 'STUDENT' | 'ADMIN' | 'REGISTRAR',
                        senderType: senderRole,
                    },
                });

                totalRecipients += recipientIds.length;
                notificationsCreated++;
            }

            return {
                success: true,
                message: `${notificationsCreated} notification${notificationsCreated > 1 ? 's' : ''} created${totalRecipients > 0 ? ` (sent to ${totalRecipients} recipient${totalRecipients > 1 ? 's' : ''})` : ''}`,
            };
        } else if (payload.scope === 'USER' && payload.recipientIds && payload.recipientIds.length > 0) {
            // Create separate notification for each person
            for (const recipientId of payload.recipientIds) {
                await prisma.notification.create({
                    data: {
                        title: payload.title,
                        description: payload.description,
                        type: payload.type,
                        scope: 'USER',
                        senderType: senderRole,
                        recipients: {
                            create: {
                                userId: recipientId,
                                isRead: false,
                            },
                        },
                    },
                });
            }

            return {
                success: true,
                message: `${payload.recipientIds.length} notification${payload.recipientIds.length > 1 ? 's' : ''} sent to specific users`,
            };
        }

        return {
            success: false,
            message: 'No recipients found',
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            success: false,
            message: 'Failed to send notification',
        };
    }
}
