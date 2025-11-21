"use server";

import { prisma } from "@/lib/prisma";
// import { logSystemAction } from "@/lib/systemLogger";

export async function getStudentTableData() {
    // Fetch ONLY minimal data for table display
    const registrations = await prisma.registration.findMany({
        where: {
            status: 'PENDING',
            deletedAt: null,
        },
        select: {
            id: true,
            studentNo: true,
            firstName: true,
            familyName: true,
            yearLevel: {
                select: {
                    id: true,
                    name: true,
                }
            },
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // format the data for table display
    const formattedList = registrations.map((reg) => ({
        id: reg.id,
        registrationId: reg.studentNo,
        fullName: `${reg.firstName} ${reg.familyName}`,
        // firstName: reg.firstName,
        // familyName: reg.familyName,
        gradeLevel: reg.yearLevel.name,
        createdAt: reg.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        }),
    }));

    // return paginated result
    return {
        success: true,
        students: formattedList,
    };
}

export async function getOneStudentTableData(studentId: number) {
    // Fetch all data needed for viewing a single student's details
    const registration = await prisma.registration.findFirst({
        where: {
            id: studentId,
            deletedAt: null,
        },
        select: {
            studentNo: true,
            firstName: true,
            middleName: true,
            familyName: true,
            emailAddress: true,

            birthdate: true,
            placeOfBirth: true,
            age: true,
            gender: true,

            streetAddress: true,
            city: true,
            stateProvince: true,
            postalCode: true,

            // Related data
            yearLevel: {
                select: {
                    id: true,
                    name: true,
                }
            },
            schoolYear: {
                select: {
                    id: true,
                    year: true,
                }
            },
            registrationType: true,
            status: true,

            modeOfPayment: true,
            amountPayable: true,

            contactNumbers: {
                select: {
                    id: true,
                    number: true,
                }
            },

            guardians: {
                select: {
                    id: true,
                    familyName: true,
                    firstName: true,
                    middleName: true,
                    occupation: true,
                    relationToStudent: true,
                }
            },

            createdAt: true,
            updatedAt: true,
        },
    });

    // console.log("Fetched student details:", registration);

    if (!registration) {
        return null;
    }

    // Convert Decimal to number for Client Component compatibility
    return {
        ...registration,
        amountPayable: Number(registration.amountPayable),
    };
}

export async function getStudentApplicationTableData() {
    // Fetch ONLY minimal data for table display
    const applications = await prisma.studentApplication.findMany({
        where: {
            status: 'PENDING',
            deletedAt: null,
        },
        select: {
            id: true,
            applicationNumber: true,
            firstName: true,
            familyName: true,
            yearLevel: {
                select: {
                    id: true,
                    name: true,
                }
            },
            status: true,
            emailAddress: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const formattedList = applications.map((app) => ({
        id: app.id,
        applicationNumber: app.applicationNumber,
        fullName: `${app.firstName} ${app.familyName}`,
        gradeLevel: app.yearLevel.name,
        status: app.status,
        emailAddress: app.emailAddress,
        createdAt: app.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        }),
    }));

    // return paginated result
    return {
        success: true,
        students: formattedList,
    };
}

export async function getStudentInformationTableData() {
    const applications = await prisma.studentApplication.findMany({
        where: {
            status: 'APPROVED',
            deletedAt: null,
        },
        select: {
            id: true,
            applicationNumber: true,
            firstName: true,
            familyName: true,
            gender: true,
            yearLevel: {
                select: {
                    id: true,
                    name: true,
                }
            },
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const formattedList = applications.map((app) => ({
        id: app.id,
        applicationNumber: app.applicationNumber,
        fullName: `${app.firstName} ${app.familyName}`,
        yearLevel: app.yearLevel.name,
        createdAt: app.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        }),
    }));

    // return paginated result
    return {
        success: true,
        students: formattedList,
    };
}

export async function getPersonalData(studentId: number) {
    const personalData = await prisma.studentApplication.findFirst({
        where: {
            id: studentId,
            deletedAt: null,
        },
        select: {
            id: true,
            firstName: true,
            middleName: true,
            familyName: true,
            applicationNumber: true,
            emailAddress: true,
            yearLevel: {
                select: {
                    id: true,
                    name: true,
                }
            },
            gender: true,
            birthdate: true,
            status: true,
            homeAddress: true,
            city: true,
            stateProvince: true,
            postalCode: true,
            // check for family background like father, mother, guardian
            createdAt: true,
        }
    });

    if (!personalData) {
        return null;
    }


    const formattedList = {
        id: personalData.id,
        fullName: `${personalData.firstName} ${personalData.middleName} ${personalData.familyName}`,
        applicationNumber: personalData.applicationNumber,
        yearLevel: personalData.yearLevel.name,
        gender: personalData.gender,
        emailAddress: personalData.emailAddress,
        birthdate: personalData.birthdate,
        status: personalData.status,
        homeAddress: personalData.homeAddress,
        city: personalData.city,
        stateProvince: personalData.stateProvince,
        postalCode: personalData.postalCode,
        createdAt: personalData.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        }),
    };

        // return paginated result
    return {
        success: true,
        students: formattedList,
    };
}

export async function getHealthHistory(studentId: number | null) {
//     childhoodDiseases      String?
//   allergies              String?
//   otherMedicalConditions String?
//   immunizations          String?
//   specificHandicaps      String?
    if (!studentId) {
        return null;
    }

    const healthData = await prisma.healthHistory.findFirst({
        where: {
            studentApplicationId: studentId,
            deletedAt: null,
        },
        select: {
            id: true,
            studentApplicationId: true,
            childhoodDiseases: true,
            allergies: true,
            otherMedicalConditions: true,
            immunizations: true,
            specificHandicaps: true,
            createdAt: true,
        }
    });

    if (!healthData) {
        return null;
    }


    const formattedList = {
        id: healthData.id,
        applicatonId: healthData.studentApplicationId,
        allergies: healthData.allergies,
        childhoodDiseases: healthData.childhoodDiseases,
        medicalConditions: healthData.otherMedicalConditions,
        immunizations: healthData.immunizations,
        physicalHandicap: healthData.specificHandicaps,
        createdAt: healthData.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        }),
    };


    return {
        success: true,
        students: formattedList,
    };
}