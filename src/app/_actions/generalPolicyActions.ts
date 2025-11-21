"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getGeneralPolicy() {
    try {
        const policy = await prisma.generalPolicy.findFirst({
            where: {
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Log the system action for fetching general policy
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Fetched general policy. Policy ID: ${policy?.id ?? 'none'}`,
            targetType: "GENERAL_POLICY",
            targetId: String(policy?.id ?? 'none'),
            status: "SUCCESS",
            severityLevel: "LOW"
        });

        return {
            success: true,
            policy,
            message: 'General policy fetched successfully'
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching general policy: ${error}`,
            targetType: "GENERAL_POLICY",
            targetId: "unknown",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error('Error fetching general policy:', error);

        return {
            success: false,
            policy: null,
            error: error instanceof Error ? error.message : 'Failed to fetch general policy'
        };
    }
}

export async function saveGeneralPolicy(content: string) {
    try {
        if (!content.trim()) {
            return {
                success: false,
                error: 'Content is required'
            };
        }

        // Check if there's an existing policy
        const existingPolicy = await prisma.generalPolicy.findFirst({
            where: {
                deletedAt: null
            }
        });

        const now = new Date();

        let policy;
        if (existingPolicy) {
            // Update existing policy
            policy = await prisma.generalPolicy.update({
                where: { id: existingPolicy.id },
                data: {
                    content: content.trim(),
                    updatedAt: now
                }
            });
        } else {
            // Create new policy
            policy = await prisma.generalPolicy.create({
                data: {
                    title: 'General Policy and Guidelines',
                    content: content.trim(),
                    createdAt: now,
                    updatedAt: now
                }
            });
        }

        // Log the system action for saving general policy
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: existingPolicy ? "UPDATE" : "CREATE",
            actionDescription: `${existingPolicy ? 'Updated' : 'Created'} general policy. Policy ID: ${policy.id}`,
            targetType: "GENERAL_POLICY",
            targetId: String(policy.id),
            status: "SUCCESS",
            severityLevel: "LOW"
        });

        return {
            success: true,
            policy,
            message: 'General policy saved successfully'
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "UPDATE",
            actionDescription: `Error saving general policy: ${error}`,
            targetType: "GENERAL_POLICY",
            targetId: "unknown",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error('Error saving general policy:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save general policy'
        };
    }
}
