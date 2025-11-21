    // const [activeSubjectCount, setActiveSubjectCount] = useState(0);
    // const pendingRegistrationCount = 12; // Placeholder value
    // const pendingApplicationCount = 8;
    // const [activeStudentCount, setActiveStudentCount] = useState(0);
    // const activeTermCount = 3; // Placeholder value
    // const feedbackCount = 27; // Placeholder value
    // const approvedRegistrationCount = 45; // Placeholder value
    // const approvedApplicationCount = 30; // Placeholder value

'use server'

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getActiveSubjects() {
    try {
        // Note: Subject model doesn't exist in current schema
        // Returning mock data for development purposes
        const mockSubjects = [
            {
                id: "mock-1",
                code: "ENG101",
                name: "English 1",
                description: "Basic English Language and Communication Skills",
                units: 3,
                gradeLevel: "Grade 7",
                department: "Language Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-2",
                code: "MATH101",
                name: "Mathematics 1",
                description: "Fundamentals of Algebra and Geometry",
                units: 3,
                gradeLevel: "Grade 7",
                department: "Mathematics Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-3",
                code: "SCI101",
                name: "Science 1",
                description: "Introduction to Physical and Earth Sciences",
                units: 3,
                gradeLevel: "Grade 7",
                department: "Science Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-4",
                code: "FIL101",
                name: "Filipino 1",
                description: "Wikang Filipino at Kultura",
                units: 3,
                gradeLevel: "Grade 7",
                department: "Language Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-5",
                code: "AP101",
                name: "Araling Panlipunan 1",
                description: "Philippine History and Geography",
                units: 3,
                gradeLevel: "Grade 7",
                department: "Social Studies Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-6",
                code: "MAPEH101",
                name: "MAPEH 1",
                description: "Music, Arts, Physical Education, and Health",
                units: 2,
                gradeLevel: "Grade 7",
                department: "MAPEH Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-7",
                code: "TLE101",
                name: "Technology and Livelihood Education 1",
                description: "Basic Computer Skills and Digital Literacy",
                units: 2,
                gradeLevel: "Grade 7",
                department: "TLE Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-8",
                code: "ENG201",
                name: "English 2",
                description: "Advanced English Language and Literature",
                units: 3,
                gradeLevel: "Grade 8",
                department: "Language Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-9",
                code: "MATH201",
                name: "Mathematics 2",
                description: "Advanced Algebra and Basic Statistics",
                units: 3,
                gradeLevel: "Grade 8",
                department: "Mathematics Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-10",
                code: "SCI201",
                name: "Science 2",
                description: "Biology and Chemistry Fundamentals",
                units: 3,
                gradeLevel: "Grade 8",
                department: "Science Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-11",
                code: "PE101",
                name: "Physical Education 1",
                description: "Basic Physical Fitness and Sports",
                units: 2,
                gradeLevel: "Grade 7",
                department: "PE Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "mock-12",
                code: "ESP101",
                name: "Edukasyon sa Pagpapakatao 1",
                description: "Values Education and Character Development",
                units: 1,
                gradeLevel: "Grade 7",
                department: "Values Education Department",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        return {
            success: true,
            subjects: mockSubjects,
            count: mockSubjects.length,
            isMockData: true,
            message: "Returning mock data - Subject model not implemented in database schema",
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching active subjects: ${error}`,
            targetType: "REPORT",
            targetId: "mock-active-subjects",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error in getActiveSubjects:", error);
        return {
            success: false,
            subjects: [],
            count: 0,
            error: "Failed to fetch active subjects",
        };
    }
}

export async function getPendingRegistrationCount() {
    try {
        // Count pending registrations
        const pendingCount = await prisma.registration.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: pendingCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching pending registrations: ${error}`,
            targetType: "REGISTRATION",
            targetId: "pending-registrations",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching pending registrations:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch pending registrations",
        };
    }
}

export async function getPendingApplicationCount() {
    try {
        // Fetch pending applications
        const pendingApplications = await prisma.studentApplication.count({
            where: {
                status: "PENDING",
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: pendingApplications,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching pending registrations: ${error}`,
            targetType: "REGISTRATION",
            targetId: "pending-registrations",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching pending registrations:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch pending registrations",
        };
    }
}

export async function getActiveStudents() {
    try {
        // Count active students
        const activeStudentCount = await prisma.student.count({
            where: {
                deletedAt: null,
            },
        });

        return {
            success: true,
            count: activeStudentCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching active students: ${error}`,
            targetType: "STUDENT",
            targetId: "active-students",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching active students:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch active students",
        };
    }
}

export async function getActiveTermCount() {
    try {
        // Count active academic terms
        const activeTermCount = await prisma.academicTerm.count({
            where: {
                status: 'ACTIVE',
            },
        });

        return {
            success: true,
            count: activeTermCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching active terms: ${error}`,
            targetType: "ACADEMIC_TERM",
            targetId: "active-terms",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching active terms:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch active terms",
        };
    }
}

export async function getFeedbackCount() {
    try {
        // Count feedback entries
        const feedbackCount = await prisma.feedback.count();
        return {
            success: true,
            count: feedbackCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching feedback count: ${error}`,
            targetType: "FEEDBACK",
            targetId: "feedback-count",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching feedback count:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch feedback count",
        };
    }
}

export async function getApprovedRegistrationCount() {
    try {
        // Count approved registrations
        const approvedCount = await prisma.registration.count({
            where: {
                status: "APPROVED",
                deletedAt: null,
            },
        });
        return {
            success: true,
            count: approvedCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching approved registration count: ${error}`,
            targetType: "REGISTRATION",
            targetId: "approved-registrations",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching approved registration count:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch approved registration count",
        };
    }
}

export async function getApprovedApplicationCount() {
    try {
        // Count approved student applications
        const approvedCount = await prisma.studentApplication.count({
            where: {
                status: "APPROVED",
                deletedAt: null,
            },
        });
        return {
            success: true,
            count: approvedCount,
        };
    } catch (error) {
        // Log the error in system logger
        await logSystemAction({
            actionCategory: "SYSTEM",
            actionType: "VIEW",
            actionDescription: `Error fetching approved application count: ${error}`,
            targetType: "APPLICATION",
            targetId: "approved-applications",
            status: "FAILED",
            severityLevel: "LOW",
            errorMessage: String(error)
        });

        console.error("Error fetching approved application count:", error);
        return {
            success: false,
            count: 0,
            error: "Failed to fetch approved application count",
        };
    }
}
