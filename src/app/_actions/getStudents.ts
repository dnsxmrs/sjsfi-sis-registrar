"use server";

import { prisma } from "@/lib/prisma";
import { logSystemAction } from "@/lib/systemLogger";
import type { 
    StudentPersonalData, 
    StudentHealthData, 
    StudentFamilyBackground,
    StudentEducationalBackground,
    StudentTransfereeBackground,
    StudentSibling 
} from './getStudentByNumber';

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

export async function getAllApprovedStudentApplications() {
    let logError: string | undefined = undefined;
    try {
        console.log("Fetching approved student applications from database...");
        const applications = await prisma.studentApplication.findMany({
            where: {
                status: 'APPROVED',
                deletedAt: null,
            },
            select: {
                id: true,
                applicationNumber: true,
                firstName: true,
                middleName: true,
                familyName: true,
                createdAt: true,
                yearLevel: {
                    select: {
                        name: true,
                    },
                },
                academicYear: {
                    select: {
                        year: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log("Approved student applications fetched successfully:", applications.length);
        return {
            success: true,
            applications,
        };
    } catch (error) {
        logError = 'Failed to fetch approved student applications';
        console.error("Error fetching approved student applications:", error);
        return {
            success: false,
            applications: [],
            error: logError,
        };
    }
}

export async function saveStudentEdit(data: {
    studentNumber: string;
    personalData: StudentPersonalData | null;
    healthData: StudentHealthData | null;
    familyData: StudentFamilyBackground[];
    educationalData: StudentEducationalBackground | null;
    transfereeData: StudentTransfereeBackground | null;
    siblingsData: StudentSibling[];
}) {
    let logError: string | undefined = undefined;
    try {
        console.log('Saving student data:', data);

        // Find the student application by application number
        const studentApplication = await prisma.studentApplication.findUnique({
            where: {
                applicationNumber: data.studentNumber,
            },
        });

        if (!studentApplication) {
            throw new Error('Student not found');
        }

        // Update personal data
        if (data.personalData) {
            await prisma.studentApplication.update({
                where: { id: studentApplication.id },
                data: {
                    familyName: data.personalData.familyName,
                    firstName: data.personalData.firstName,
                    middleName: data.personalData.middleName,
                    nickName: data.personalData.nickname,
                    placeOfBirth: data.personalData.placeOfBirth,
                    age: data.personalData.age ? parseInt(data.personalData.age) : undefined,
                    birthOrder: data.personalData.birthOrder ? parseInt(data.personalData.birthOrder) : undefined,
                    numberOfSiblings: data.personalData.numberOfSiblings ? parseInt(data.personalData.numberOfSiblings) : undefined,
                    nationality: data.personalData.nationality,
                    religion: data.personalData.religion,
                    heightCm: data.personalData.height ? parseFloat(data.personalData.height) : undefined,
                    weightKg: data.personalData.weight ? parseFloat(data.personalData.weight) : undefined,
                    bloodType: data.personalData.bloodType,
                    languagesSpokenAtHome: data.personalData.language,
                    landlineNumber: data.personalData.landlineNumber,
                    mobileNumber: data.personalData.mobileNumber,
                    hobbiesInterests: data.personalData.hobbiesInterests,
                    talents: data.personalData.talentsSpecialSkills,
                    childStatus: data.personalData.childStatus,
                    provincialAddress: data.personalData.provincialAddress,
                    provincialCity: data.personalData.provincialCity,
                    provincialStateProvince: data.personalData.stateProvince,
                    provincialPostalCode: data.personalData.postalCode,
                    emailAddress: data.personalData.emailAddress,
                    homeAddress: data.personalData.homeAddress,
                    city: data.personalData.city,
                    stateProvince: data.personalData.stateProvince,
                    postalCode: data.personalData.postalCode,
                    birthdate: data.personalData.birthdate ? new Date(data.personalData.birthdate) : undefined,
                },
            });
        }

        // Update health data
        if (data.healthData) {
            await prisma.healthHistory.updateMany({
                where: { studentApplicationId: studentApplication.id },
                data: {
                    allergies: data.healthData.allergies,
                    childhoodDiseases: data.healthData.childhoodDiseases,
                    otherMedicalConditions: data.healthData.medicalConditions,
                    immunizations: data.healthData.immunizations,
                    specificHandicaps: data.healthData.physicalHandicap,
                },
            });
        }

        // Update family backgrounds
        if (data.familyData && data.familyData.length > 0) {
            for (const family of data.familyData) {
                if (family.id) {
                    await prisma.familyBackground.update({
                        where: { id: family.id },
                        data: {
                            familyName: family.familyName,
                            firstName: family.firstName,
                            middleName: family.middleName,
                            birthdate: new Date(family.birthDate),
                            placeOfBirth: family.placeOfBirth,
                            age: parseInt(family.age),
                            nationality: family.nationality,
                            religion: family.religion,
                            landLine: family.landlineNumber,
                            mobileNo: family.mobileNumber,
                            emailAddress: family.email,
                            homeAddress: family.homeAddress,
                            city: family.city,
                            stateProvince: family.stateProvince,
                            postalCode: family.zipCode,
                            educationalAttainment: family.education,
                            occupation: family.occupation,
                            employer: family.company,
                            companyAddress: family.companyAddress,
                            companyCity: family.companyCity,
                            businessNo: family.businessNumber,
                            annualIncome: family.annualIncome,
                            parentStatus: family.statusOfParent,
                        },
                    });
                }
            }
        }

        // Update siblings
        if (data.siblingsData && data.siblingsData.length > 0) {
            for (const sibling of data.siblingsData) {
                if (sibling.id) {
                    await prisma.siblings.update({
                        where: { id: sibling.id },
                        data: {
                            familyName: sibling.familyName,
                            firstName: sibling.firstName,
                            middleName: sibling.middleName,
                            birthDate: new Date(sibling.birthDate),
                            age: parseInt(sibling.age.toString()) || 0,
                            gradeYearLevel: sibling.gradeYearLevel,
                            schoolEmployer: sibling.schoolEmployer,
                        },
                    });
                }
            }
        }

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'UPDATE',
            actionDescription: `Updated student information for ${data.studentNumber}`,
            targetType: 'StudentApplication',
            targetId: studentApplication.id.toString(),
            status: 'SUCCESS',
            severityLevel: 'MEDIUM',
        });

        return {
            success: true,
            message: 'Student information updated successfully',
        };
    } catch (error) {
        logError = 'Failed to save student edit';
        console.error('Error saving student edit:', error);

        await logSystemAction({
            actionCategory: 'ACADEMIC',
            actionType: 'UPDATE',
            actionDescription: `Failed to update student information for ${data.studentNumber}`,
            targetType: 'StudentApplication',
            targetId: data.studentNumber,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : logError,
            severityLevel: 'HIGH',
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : logError,
        };
    }
}