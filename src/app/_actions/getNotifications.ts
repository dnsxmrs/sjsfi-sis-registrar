'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function getNotifications() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return {
                success: false,
                message: 'Unauthorized',
                notifications: [],
            };
        }

        // Get user from Clerk to access privateMetadata
        const clerkUser = await clerkClient.users.getUser(userId);
        const userRoles = (clerkUser?.privateMetadata?.roles || clerkUser?.privateMetadata?.role) as
            | string[]
            | string
            | undefined;

        // Determine user role with admin taking precedence
        let userRole: 'STUDENT' | 'ADMIN' | 'REGISTRAR' = 'STUDENT';

        if (userRoles) {
            const rolesArray = Array.isArray(userRoles)
                ? userRoles.map(r => r.toLowerCase())
                : [userRoles.toString().toLowerCase()];

            if (rolesArray.includes('admin')) {
                userRole = 'ADMIN';
            } else if (rolesArray.includes('registrar')) {
                userRole = 'REGISTRAR';
            } else if (rolesArray.includes('student')) {
                userRole = 'STUDENT';
            }
        }

        console.log('User role detected:', userRole);
        console.log('Clerk privateMetadata:', clerkUser.privateMetadata);

        // Fetch notifications:
        // 1. GENERAL scope (for everyone)
        // 2. Role-based scope (STUDENT, ADMIN, REGISTRAR)
        // 3. USER scope where user is a recipient (specific to them)
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    // GENERAL notifications (shown to everyone)
                    { scope: 'GENERAL' },
                    // Role-based notifications (scope is set to the role name)
                    { scope: userRole },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });

        const formattedNotifications = notifications.map((notif) => ({
            id: notif.id,
            title: notif.title,
            description: notif.description,
            type: notif.type,
            scope: notif.scope,
            createdAt: notif.createdAt,
            senderType: notif.senderType,
        }));

        console.log('Fetched notifications:', formattedNotifications.map(n => ({ title: n.title, scope: n.scope })));

        return {
            success: true,
            notifications: formattedNotifications,
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            success: false,
            message: 'Failed to fetch notifications',
            notifications: [],
        };
    }
}
