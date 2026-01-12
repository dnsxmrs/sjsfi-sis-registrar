"use server";

import { prisma } from "@/lib/prisma";
import { logDatabaseChange } from "@/lib/systemLoggerHelpers";

export async function addYearLevel(name: string) {
    const now = new Date();

    try {
        if (!name.trim()) {
            return {
                success: false,
                error: 'Year level name is required'
            };
        }

        // Check if year level already exists (case-insensitive)
        const existingYearLevel = await prisma.yearLevel.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                },
                deletedAt: null
            }
        });

        if (existingYearLevel) {
            return {
                success: false,
                error: 'Year level already exists'
            };
        }

        // Use logDatabaseChange for logging
        const yearLevel = await logDatabaseChange(
            () => prisma.yearLevel.create({
                data: {
                    name: name.trim(),
                    createdAt: now,
                    updatedAt: now
                }
            }),
            {
                actionType: 'CREATE',
                targetType: 'YearLevel',
                targetId: name.trim(),
                targetName: name.trim(),
            }
        );

        return {
            success: true,
            yearLevel,
            message: 'Year level added successfully'
        };
    } catch (error) {
        console.error('Error adding year level:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add year level'
        };
    }
}

export async function updateYearLevel(id: number, name: string) {
    const now = new Date();

    try {
        if (!name.trim()) {
            return {
                success: false,
                error: 'Year level name is required'
            };
        }

        // Check if another year level with the same name exists (case-insensitive)
        const existingYearLevel = await prisma.yearLevel.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: 'insensitive'
                },
                deletedAt: null,
                NOT: { id }
            }
        });

        if (existingYearLevel) {
            return {
                success: false,
                error: 'Year level name already exists'
            };
        }

        // Fetch old values for logging
        const oldYearLevel = await prisma.yearLevel.findUnique({ where: { id } });

        const yearLevel = await logDatabaseChange(
            () => prisma.yearLevel.update({
                where: { id },
                data: {
                    name: name.trim(),
                    updatedAt: now
                }
            }),
            {
                actionType: 'UPDATE',
                targetType: 'YearLevel',
                targetId: id.toString(),
                targetName: name.trim(),
                oldValues: oldYearLevel || undefined,
            }
        );

        return {
            success: true,
            yearLevel,
            message: 'Year level updated successfully'
        };
    } catch (error) {
        console.error('Error updating year level:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update year level'
        };
    }
}

export async function deleteYearLevel(id: number) {
    const now = new Date();

    try {
        // Fetch old values for logging
        const oldYearLevel = await prisma.yearLevel.findUnique({ where: { id } });

        // Soft delete the year level
        const yearLevel = await logDatabaseChange(
            () => prisma.yearLevel.update({
                where: { id },
                data: {
                    deletedAt: now
                }
            }),
            {
                actionType: 'DELETE',
                targetType: 'YearLevel',
                targetId: id.toString(),
                targetName: oldYearLevel?.name || id.toString(),
                oldValues: oldYearLevel || undefined,
            }
        );

        return {
            success: true,
            yearLevel,
            message: 'Year level deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting year level:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete year level'
        };
    }
}
