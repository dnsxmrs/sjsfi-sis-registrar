"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

type GeneralStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';

interface AdviserInfo {
  facultyId?: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
}

interface SectionAssignment {
  sectionId: number;
  sectionName: string;
  gradeLevel: string;
  section: string;
  schoolYear: string;
  semester?: string;
  adviser: AdviserInfo;
}

interface HRMSResponse {
  success: boolean;
  count?: number;
  assignments: SectionAssignment[];
}

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
        _count: {
          select: {
            schedules: true,
            studentApplications: true,
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

/**
 * Fetch advisers from HRMS and sync with section data
 */
export async function fetchAndSyncAdvisers(
  gradeLevel: string,
  schoolYear: string
) {
  try {
    const secret = process.env.SJSFI_SHARED_SECRET;
    const apiKey = process.env.SJSFI_SIS_API_KEY;
    const baseUrl = process.env.BASE_URL;

    if (!secret || !apiKey || !baseUrl) {
      return {
        success: false,
        error: "Server misconfiguration",
        errorCode: "HR02",
      };
    }

    // Import key for HMAC SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const timestamp = Date.now().toString();
    const rawBody = "";

    // Generate HMAC signature (body + timestamp)
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(rawBody + timestamp)
    );

    // Convert signature to hex string
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Make the GET request to fetch section assignments with advisers
    const upstreamUrl = `${baseUrl}/api/xr/section-assignments`;

    console.log('🔍 Fetching advisers from HRMS:', upstreamUrl);

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-timestamp": timestamp,
        "x-signature": signature,
      },
    });

    // Read and parse upstream response
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);

      console.log('✅ HRMS API Response:', JSON.stringify(data, null, 2));

      if (!res.ok) {
        return {
          success: false,
          error: data.message || "Failed to fetch advisers from HRMS",
          errorCode: "HR06",
        };
      }

      // Return the fetched data for syncing
      return { success: true, data: data };
    } catch {
      return {
        success: false,
        error: "Invalid response from external system",
        errorCode: "HR04",
      };
    }
  } catch (error) {
    console.error("Error fetching advisers:", error);
    return {
      success: false,
      error: "External system unavailable",
      errorCode: "HR05",
    };
  }
}

/**
 * Sync section adviser data with fetched HRMS data
 */
export async function syncSectionAdvisers(
  termYearLevelId: number,
  hrmsResponse: HRMSResponse
) {
  try {
    console.log('🔄 Starting adviser sync for termYearLevelId:', termYearLevelId);
    console.log('📦 HRMS Response:', JSON.stringify(hrmsResponse, null, 2));
    
    // Extract assignments array from response
    const assignments = hrmsResponse.assignments || [];
    
    if (!Array.isArray(assignments)) {
      return { 
        success: false, 
        error: "Invalid response format: assignments is not an array" 
      };
    }

    // Get all sections for this term-year level
    const sections = await prisma.section.findMany({
      where: {
        termYearLevelId: termYearLevelId,
        deletedAt: null,
      },
    });

    let updatedCount = 0;
    const updates = [];

    for (const section of sections) {
      // Find matching adviser data by sectionName
      const assignment = assignments.find(
        (item) => item.sectionName === section.name
      );

      if (assignment && assignment.adviser) {
        const adviser = assignment.adviser;
        
        console.log(`📋 Found adviser for section "${section.name}":`, adviser);
        
        // Compare existing adviser data with fetched data
        const needsUpdate =
          section.advisorEmployeeId !== adviser.employeeId ||
          section.advisorFirstName !== adviser.firstName ||
          section.advisorLastName !== adviser.lastName ||
          section.advisorEmail !== adviser.email;

        if (needsUpdate) {
          console.log(`🔄 Updating section "${section.name}" with new adviser data`);
          
          // Update section with new adviser data
          const updated = await prisma.section.update({
            where: { id: section.id },
            data: {
              advisorEmployeeId: adviser.employeeId,
              advisorFirstName: adviser.firstName,
              advisorLastName: adviser.lastName,
              advisorEmail: adviser.email,
              advisorFacultyId: adviser.facultyId,
            },
          });

          updates.push(updated);
          updatedCount++;

          // Log the action
          await logSystemAction({
            actionCategory: "SCHEDULE_MANAGEMENT",
            actionType: "UPDATE",
            actionDescription: `Synced adviser data for section "${section.name}"`,
            targetType: "Section",
            targetId: section.id.toString(),
            targetName: section.name,
            oldValues: {
              advisorEmployeeId: section.advisorEmployeeId,
              advisorFirstName: section.advisorFirstName,
              advisorLastName: section.advisorLastName,
              advisorEmail: section.advisorEmail,
              advisorFacultyId: section.advisorFacultyId ?? null,
            },
            newValues: {
              advisorEmployeeId: adviser.employeeId,
              advisorFirstName: adviser.firstName,
              advisorLastName: adviser.lastName,
              advisorEmail: adviser.email,
              advisorFacultyId: adviser.facultyId ?? null,
            },
            status: "SUCCESS",
            severityLevel: "LOW",
          });
        }
      }
    }

    console.log(`✅ Sync complete: Updated ${updatedCount} section(s)`);

    return {
      success: true,
      message: `Synced ${updatedCount} section(s)`,
      updatedCount,
      updates,
    };
  } catch (error) {
    console.error("Error syncing section advisers:", error);
    return { success: false, error: "Failed to sync section advisers" };
  }
}
