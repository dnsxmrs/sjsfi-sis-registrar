'use server';

// import { logSystemAction } from "@/lib/systemLogger";

export async function getActiveSubjects() {
    try {
        // Note: Subject model doesn't exist in current schema
        // Returning mock data for development purposes
        console.log("Returning mock subject data (Subject model not found in schema)...");

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

        // Log the system action for fetching active subjects (mock)
        // await logSystemAction({
        //     actionCategory: "SYSTEM",
        //     actionType: "VIEW",
        //     actionDescription: `Fetched mock active subjects. Total subjects: ${mockSubjects.length}`,
        //     targetType: "REPORT",
        //     targetId: "mock-active-subjects",
        //     status: "SUCCESS",
        //     severityLevel: "LOW",
        //     metadata: { count: mockSubjects.length }
        // });

        console.log("Mock subject data returned successfully:", mockSubjects.length, "subjects");
        return {
            success: true,
            subjects: mockSubjects,
            count: mockSubjects.length,
            isMockData: true,
            message: "Returning mock data - Subject model not implemented in database schema",
        };
    } catch (error) {
        // Log the error in system logger
        // await logSystemAction({
        //     actionCategory: "SYSTEM",
        //     actionType: "VIEW",
        //     actionDescription: `Error fetching active subjects: ${error}`,
        //     targetType: "REPORT",
        //     targetId: "mock-active-subjects",
        //     status: "FAILED",
        //     severityLevel: "LOW",
        //     errorMessage: String(error)
        // });

        console.error("Error in getActiveSubjects:", error);
        return {
            success: false,
            subjects: [],
            count: 0,
            error: "Failed to fetch active subjects",
        };
    }
}
