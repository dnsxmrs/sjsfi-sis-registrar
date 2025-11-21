"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";

export async function getStudents() {
    let logError: string | undefined = undefined;
    try {
        console.log("Fetching students from database...");

        // Fetch students with their user information, regardless of status but only non-deleted
        const registration = await prisma.registration.findMany({
            where: {
                status: 'PENDING', // Only active registrations
                deletedAt: null, // Only non-deleted students
            },
            include: {
                yearLevel: true, // Include year level information
                schoolYear: true, // Include school year information
                studentForm: true, // Include student application form data
                guardians: true, // Include guardians information
                contactNumbers: true, // Include contact numbers
                registrationcode: true, // Include registration codes
            },
            orderBy: {
                createdAt: "desc", // Most recent first
            },
        });

        // console.log("Students fetched successfully:", registration.length); // Transform the data to match the expected format
        const formattedStudents = registration.map((regis) => ({
            id: regis.studentNo,
            registrationId: regis.id,
            fullName: `${regis.firstName} ${regis.familyName}`,
            firstName: regis.firstName,
            middleName: regis.middleName,
            familyName: regis.familyName,
            birthdate: regis.birthdate.toISOString(), // Convert Date to string
            placeOfBirth: regis.placeOfBirth,
            age: regis.age,
            gender: regis.gender,
            streetAddress: regis.streetAddress,
            city: regis.city,
            stateProvince: regis.stateProvince,
            postalCode: regis.postalCode,
            modeOfPayment: regis.modeOfPayment,
            amountPayable: Number(regis.amountPayable), // Convert Decimal to number
            registrationType: regis.registrationType,
            gradeLevel: regis.yearLevel.name,
            yearLevelId: regis.yearLevel.id,
            schoolYear: {
                id: regis.schoolYear.id,
                year: regis.schoolYear.year,
                startDate: regis.schoolYear.startDate.toISOString(), // Convert Date to string
                endDate: regis.schoolYear.endDate.toISOString(), // Convert Date to string
                status: regis.schoolYear.status,
            },
            status: regis.status,
            email: regis.emailAddress,
            guardians: regis.guardians.map(guardian => ({
                id: guardian.id,
                familyName: guardian.familyName,
                firstName: guardian.firstName,
                middleName: guardian.middleName,
                occupation: guardian.occupation,
                relationToStudent: guardian.relationToStudent,
            })),
            contactNumbers: regis.contactNumbers.map(contact => ({
                id: contact.id,
                number: contact.number,
            })),
            studentForm: regis.studentForm ? {
                id: regis.studentForm.id,
                // Add other student form fields as needed
            } : null,
            registrationCodes: regis.registrationcode.map(code => ({
                id: code.id,
                code: code.registrationCode,
                status: code.status,
                expirationDate: code.expirationDate?.toISOString() || null, // Convert Date to string
                createdAt: code.createdAt.toISOString(), // Convert Date to string
            })),
            createdAt: regis.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Manila'
            }), // Convert Date to string
            updatedAt: regis.updatedAt.toISOString(), // Convert Date to string
        }));

        return {
            success: true,
            students: formattedStudents,
        };
    } catch (error) {
        logError = 'Failed to fetch students';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch students (pending registrations)',
            targetType: 'Registration',
            targetId: 'all',
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'LOW',
        });
        console.error("Error fetching students:", error);
        return {
            success: false,
            students: [],
            error: logError,
        };
    }
}

export async function getApproveRegistrations() {
    let logError: string | undefined = undefined;
    try {
        console.log("Fetching students from database...");

        // Fetch students with their user information, regardless of status but only non-deleted
        const registration = await prisma.registration.findMany({
            where: {
                status: 'APPROVED', // Only active registrations
                deletedAt: null, // Only non-deleted students
            },
            include: {
                yearLevel: true, // Include year level information
                schoolYear: true, // Include school year information
                studentForm: true, // Include student application form data
                guardians: true, // Include guardians information
                contactNumbers: true, // Include contact numbers
                registrationcode: true, // Include registration codes
            },
            orderBy: {
                createdAt: "desc", // Most recent first
            },
        });

        // console.log("Students fetched successfully:", registration.length); // Transform the data to match the expected format
        const formattedStudents = registration.map((regis) => ({
            id: regis.studentNo,
            registrationId: regis.id,
            firstName: regis.firstName,
            middleName: regis.middleName,
            familyName: regis.familyName,
            birthdate: regis.birthdate.toISOString(), // Convert Date to string
            placeOfBirth: regis.placeOfBirth,
            age: regis.age,
            gender: regis.gender,
            streetAddress: regis.streetAddress,
            city: regis.city,
            stateProvince: regis.stateProvince,
            postalCode: regis.postalCode,
            modeOfPayment: regis.modeOfPayment,
            amountPayable: Number(regis.amountPayable), // Convert Decimal to number
            registrationType: regis.registrationType,
            gradeLevel: regis.yearLevel.name,
            yearLevelId: regis.yearLevel.id,
            schoolYear: {
                id: regis.schoolYear.id,
                year: regis.schoolYear.year,
            },
            status: regis.status,
            email: regis.emailAddress,
            guardians: regis.guardians.map(guardian => ({
                id: guardian.id,
                familyName: guardian.familyName,
                firstName: guardian.firstName,
                middleName: guardian.middleName,
                occupation: guardian.occupation,
                relationToStudent: guardian.relationToStudent,
            })),
            contactNumbers: regis.contactNumbers.map(contact => ({
                id: contact.id,
                number: contact.number,
            })),
            registrationCodes: regis.registrationcode.map(code => ({
                id: code.id,
                code: code.registrationCode,
            })),
            createdAt: regis.createdAt.toISOString(), // Convert Date to string
            updatedAt: regis.updatedAt.toISOString(), // Convert Date to string
        }));

        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch students (approved registrations)',
            targetType: 'Registration',
            targetId: 'all',
            status: 'SUCCESS',
            severityLevel: 'LOW',
        });

        return {
            success: true,
            students: formattedStudents,
        };
    } catch (error) {
        logError = 'Failed to fetch students';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'VIEW',
            actionDescription: 'Fetch students (approved registrations)',
            targetType: 'Registration',
            targetId: 'all',
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'LOW',
        });
        console.error("Error fetching students:", error);
        return {
            success: false,
            students: [],
            error: logError,
        };
    }
}


export async function getAllPendingStudentApplications() {
    let logError: string | undefined = undefined;
    try {
        console.log("Fetching pending student applications from database...");
        const applications = await prisma.studentApplication.findMany({
            where: {
                status: 'PENDING',
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log("Pending student applications fetched successfully:", applications.length);
        return {
            success: true,
            applications,
        };
    } catch (error) {
        logError = 'Failed to fetch pending student applications';
        console.error("Error fetching pending student applications:", error);
        return {
            success: false,
            applications: [],
            error: logError,
        };
    }
}