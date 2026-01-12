"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

type GeneralStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';

/**
 * Create a new section for a term-year level
 */
export async function createSection(
  termYearLevelId: number,
  name: string,
  capacity: number
) {
  try {
    // Verify term-year level exists
    const termYearLevel = await prisma.termYearLevel.findFirst({
      where: {
        id: termYearLevelId,
        deletedAt: null,
      },
      include: {
        academicTerm: true,
        yearLevel: true,
      },
    });

    if (!termYearLevel) {
      return { success: false, error: "Term-year level not found" };
    }

    // Check for duplicate section name (case-insensitive)
    const existing = await prisma.section.findFirst({
      where: {
        termYearLevelId: termYearLevelId,
        name: {
          equals: name,
          mode: "insensitive",
        },
        deletedAt: null,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A section with this name already exists for this term and year level",
      };
    }

    // Validate capacity
    if (capacity < 1) {
      return { success: false, error: "Capacity must be at least 1" };
    }

    // Create the section
    const section = await prisma.section.create({
      data: {
        termYearLevelId: termYearLevelId,
        name: name.trim(),
        capacity: capacity,
        currentStudents: 0,
        status: "ACTIVE",
      },
      include: {
        termYearLevel: {
          include: {
            academicTerm: true,
            yearLevel: true,
          },
        },
      },
    });

    // Log the action
    await logSystemAction({
      actionCategory: "SCHEDULE_MANAGEMENT",
      actionType: "CREATE",
      actionDescription: `Created section "${name}" for ${termYearLevel.academicTerm.year} - ${termYearLevel.yearLevel.name}`,
      targetType: "Section",
      targetId: section.id.toString(),
      targetName: name,
      newValues: section,
      status: "SUCCESS",
      severityLevel: "MEDIUM",
    });

    return { success: true, data: section };
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, error: "Failed to create section" };
  }
}

/**
 * Get all sections for a term-year level
 */
export async function getSectionsForYearLevel(termYearLevelId: number) {
  try {
    const sections = await prisma.section.findMany({
      where: {
        termYearLevelId: termYearLevelId,
        deletedAt: null,
      },
      include: {
        termYearLevel: {
          include: {
            academicTerm: true,
            yearLevel: true,
          },
        },
        schedules: {
          where: {
            deletedAt: null,
          },
          include: {
            termSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: sections };
  } catch (error) {
    console.error("Error getting sections:", error);
    return { success: false, error: "Failed to get sections" };
  }
}

/**
 * Update a section's details
 */
export async function updateSection(
  sectionId: number,
  data: { name?: string; capacity?: number; status?: string }
) {
  try {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        termYearLevel: {
          include: {
            academicTerm: true,
            yearLevel: true,
          },
        },
      },
    });

    if (!section || section.deletedAt) {
      return { success: false, error: "Section not found" };
    }

    // If updating name, check for duplicates (case-insensitive)
    if (data.name && data.name !== section.name) {
      const existing = await prisma.section.findFirst({
        where: {
          termYearLevelId: section.termYearLevelId,
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          deletedAt: null,
          id: {
            not: sectionId,
          },
        },
      });

      if (existing) {
        return {
          success: false,
          error: "A section with this name already exists",
        };
      }
    }

    // Validate capacity if updating
    if (data.capacity !== undefined && data.capacity < section.currentStudents) {
      return {
        success: false,
        error: `Cannot set capacity lower than current student count (${section.currentStudents})`,
      };
    }

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.status && { status: data.status as GeneralStatus }),
      },
    });

    // Log the action
    await logSystemAction({
      actionCategory: "SCHEDULE_MANAGEMENT",
      actionType: "UPDATE",
      actionDescription: `Updated section "${section.name}"`,
      targetType: "Section",
      targetId: sectionId.toString(),
      targetName: section.name,
      oldValues: section,
      newValues: updated,
      status: "SUCCESS",
      severityLevel: "MEDIUM",
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating section:", error);
    return { success: false, error: "Failed to update section" };
  }
}

/**
 * Delete a section (soft delete)
 */
export async function deleteSection(sectionId: number) {
  try {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        termYearLevel: {
          include: {
            academicTerm: true,
            yearLevel: true,
          },
        },
        schedules: {
          where: { deletedAt: null },
        },
      },
    });

    if (!section || section.deletedAt) {
      return { success: false, error: "Section not found" };
    }

    // Check if there are students enrolled
    if (section.currentStudents > 0) {
      return {
        success: false,
        error: "Cannot delete section with enrolled students",
      };
    }

    // Check if there are active schedules
    if (section.schedules.length > 0) {
      return {
        success: false,
        error: "Cannot delete section with existing schedules. Please delete schedules first.",
      };
    }

    // Soft delete
    const deleted = await prisma.section.update({
      where: { id: sectionId },
      data: { deletedAt: new Date() },
    });

    // Log the action
    await logSystemAction({
      actionCategory: "SCHEDULE_MANAGEMENT",
      actionType: "DELETE",
      actionDescription: `Deleted section "${section.name}" from ${section.termYearLevel.academicTerm.year} - ${section.termYearLevel.yearLevel.name}`,
      targetType: "Section",
      targetId: sectionId.toString(),
      targetName: section.name,
      oldValues: section,
      status: "SUCCESS",
      severityLevel: "MEDIUM",
    });

    return { success: true, data: deleted };
  } catch (error) {
    console.error("Error deleting section:", error);
    return { success: false, error: "Failed to delete section" };
  }
}
