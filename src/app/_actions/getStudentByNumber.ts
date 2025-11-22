'use server';

import { prisma } from '@/lib/prisma';
import type { FamilyBackground, HonorsAwards } from '@/generated/prisma';

export interface StudentPersonalData {
    id: number;
    fullName: string;
    applicationNumber: string | null;
    yearLevel: string;
    academicYear?: string;
    admissionGradeYear?: string;
    familyName?: string;
    firstName?: string;
    middleName?: string;
    nickname?: string;
    placeOfBirth?: string;
    age?: string;
    birthOrder?: string;
    numberOfSiblings?: string;
    nationality?: string;
    religion?: string;
    height?: string;
    weight?: string;
    bloodType?: string;
    language?: string;
    landlineNumber?: string;
    mobileNumber?: string;
    hobbiesInterests?: string;
    talentsSpecialSkills?: string;
    childStatus?: string;
    biologicalRelationship?: string;
    adoptedStatus?: string;
    provincialAddress?: string;
    provincialCity?: string;
    provincialStateProvince?: string;
    provincialPostalCode?: string;
    gender: string;
    emailAddress: string;
    birthdate: string;
    status: string;
    homeAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    createdAt: string;
}

export interface StudentHealthData {
    id: number;
    applicationId: number;
    allergies: string | null;
    childhoodDiseases: string | null;
    medicalConditions: string | null;
    immunizations: string | null;
    physicalHandicap: string | null;
    createdAt: string;
}

export interface StudentFamilyBackground {
    id: number;
    guardianType: string;
    familyName: string;
    firstName: string;
    middleName: string | null;
    birthDate: string;
    placeOfBirth: string;
    age: string;
    nationality: string;
    religion: string;
    landlineNumber: string | null;
    mobileNumber: string;
    email: string;
    homeAddress: string;
    city: string;
    stateProvince: string;
    zipCode: string;
    education: string;
    occupation: string;
    company: string | null;
    companyAddress: string | null;
    companyCity: string | null;
    businessNumber: string | null;
    annualIncome: string | null;
    statusOfParent: string;
}

export interface StudentEducationalBackground {
    yearLevel: string | null;
    schoolName: string | null;
    schoolAddress: string | null;
    honorsReceived: string[];
    inclusiveYearsAttended: string | null;
    attendedSummerClasses: string | null;
    summerClassDetails: string | null;
    yearRepeated: string | null;
    numberOfSubjectsFailed: number | null;
}

export interface StudentTransfereeBackground {
    id: number;
    reasonForTransfer: string;
    disciplinaryRecord: string | null;
    presentSchool: {
        schoolName: string;
        schoolAddress: string;
        inclusiveYears: string;
        reasonForLeaving: string | null;
    } | null;
    previousSchool: {
        schoolName: string;
        schoolAddress: string;
        inclusiveYears: string;
        reasonForLeaving: string | null;
    } | null;
}

export interface StudentSibling {
    id: number;
    familyName: string;
    firstName: string;
    middleName: string | null;
    birthDate: string;
    age: number;
    gradeYearLevel: string;
    schoolEmployer: string;
}

export interface StudentRequirement {
    id: number;
    requirementType: string;
    status: string;
    fileUrl: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StudentData {
    personalData: StudentPersonalData | null;
    healthData: StudentHealthData | null;
    familyBackground: StudentFamilyBackground[];
    educationalBackground: StudentEducationalBackground | null;
    transfereeBackground: StudentTransfereeBackground | null;
    siblings: StudentSibling[];
    requirements: StudentRequirement[];
}

export async function getStudentByNumber(studentNumber: string): Promise<StudentData | null> {
    try {
        // Find the student by application number
        const studentApplication = await prisma.studentApplication.findUnique({
            where: {
                applicationNumber: studentNumber,
            },
            include: {
                healthHistory: true,
                familyBackgrounds: true,
                siblings: true,
                requirements: {
                    take: 4
                },
                educationalBackground: {
                    include: {
                        honorsAwards: true,
                    },
                },
                transferee: {
                    include: {
                        presentSchool: true,
                        previousSchool: true,
                    },
                },
                academicYear: true,
                yearLevel: true,
            },
        });

        // console.log(studentApplication)

        if (!studentApplication) {
            return null;
        }

        // Build personal data from student application
        const personalData: StudentPersonalData = {
            id: studentApplication.id,
            fullName: `${studentApplication.firstName} ${studentApplication.middleName || ''} ${studentApplication.familyName}`.trim(),
            applicationNumber: studentApplication.applicationNumber,
            yearLevel: studentApplication.yearLevel.name,
            academicYear: studentApplication.academicYear.year,
            admissionGradeYear: studentApplication.yearLevel.name,
            familyName: studentApplication.familyName,
            firstName: studentApplication.firstName,
            middleName: studentApplication.middleName || undefined,
            nickname: studentApplication.nickName || undefined,
            placeOfBirth: studentApplication.placeOfBirth,
            age: studentApplication.age.toString(),
            birthOrder: studentApplication.birthOrder.toString(),
            numberOfSiblings: studentApplication.numberOfSiblings.toString(),
            nationality: studentApplication.nationality,
            religion: studentApplication.religion,
            height: studentApplication.heightCm.toString(),
            weight: studentApplication.weightKg.toString(),
            bloodType: studentApplication.bloodType,
            language: studentApplication.languagesSpokenAtHome,
            landlineNumber: studentApplication.landlineNumber,
            mobileNumber: studentApplication.mobileNumber,
            hobbiesInterests: studentApplication.hobbiesInterests,
            talentsSpecialSkills: studentApplication.talents,
            childStatus: studentApplication.childStatus,
            provincialAddress: studentApplication.provincialAddress,
            provincialCity: studentApplication.provincialCity,
            provincialStateProvince: studentApplication.provincialStateProvince,
            provincialPostalCode: studentApplication.provincialPostalCode,
            gender: studentApplication.gender,
            emailAddress: studentApplication.emailAddress,
            birthdate: studentApplication.birthdate.toISOString().split('T')[0],
            status: studentApplication.status,
            homeAddress: studentApplication.homeAddress,
            city: studentApplication.city,
            stateProvince: studentApplication.stateProvince,
            postalCode: studentApplication.postalCode,
            createdAt: studentApplication.createdAt.toISOString(),
        };

        // Build health data
        const healthData: StudentHealthData | null = studentApplication.healthHistory
            ? {
                id: studentApplication.healthHistory.id,
                applicationId: studentApplication.healthHistory.studentApplicationId,
                allergies: studentApplication.healthHistory.allergies,
                childhoodDiseases: studentApplication.healthHistory.childhoodDiseases,
                medicalConditions: studentApplication.healthHistory.otherMedicalConditions,
                immunizations: studentApplication.healthHistory.immunizations,
                physicalHandicap: studentApplication.healthHistory.specificHandicaps,
                createdAt: studentApplication.healthHistory.createdAt.toISOString(),
            }
            : null;

        // Build family background data
        const familyBackground: StudentFamilyBackground[] = studentApplication.familyBackgrounds.map((family: FamilyBackground) => ({
            id: family.id,
            guardianType: family.guardianType,
            familyName: family.familyName,
            firstName: family.firstName,
            middleName: family.middleName,
            birthDate: family.birthdate.toISOString().split('T')[0],
            placeOfBirth: family.placeOfBirth,
            age: family.age.toString(),
            nationality: family.nationality,
            religion: family.religion,
            landlineNumber: family.landLine,
            mobileNumber: family.mobileNo,
            email: family.emailAddress,
            homeAddress: family.homeAddress,
            city: family.city,
            stateProvince: family.stateProvince,
            zipCode: family.postalCode,
            education: family.educationalAttainment,
            occupation: family.occupation,
            company: family.employer,
            companyAddress: family.companyAddress,
            companyCity: family.companyCity,
            businessNumber: family.businessNo,
            annualIncome: family.annualIncome?.toString() || null,
            statusOfParent: family.parentStatus,
        }));

        // Build educational background data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const educBg = (studentApplication.educationalBackground as any)?.[0];
        const educationalBackground: StudentEducationalBackground | null =
            educBg
            ? {
                yearLevel: educBg.yearLevel,
                schoolName: educBg.schoolName,
                schoolAddress: educBg.schoolAddress,
                honorsReceived: (educBg.honorsAwards || []).map(
                    (honor: HonorsAwards) => honor.description || ''
                ),
                inclusiveYearsAttended: educBg.inclusiveYearsAttended,
                attendedSummerClasses: educBg.attendedSummerClasses
                    ? 'Yes'
                    : 'No',
                summerClassDetails: educBg.summerClassDetails,
                yearRepeated: educBg.yearRepeated,
                numberOfSubjectsFailed: educBg.numberOfSubjectsFailed,
            }
            : null;

        // Build transferee background data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transfereeData = studentApplication.transferee as any;
        const transfereeBackground: StudentTransfereeBackground | null = 
            transfereeData
            ? {
                id: transfereeData.id,
                reasonForTransfer: transfereeData.reasonForTransfer,
                disciplinaryRecord: transfereeData.disiplinaryRecord,
                presentSchool: transfereeData.presentSchool
                    ? {
                        schoolName: transfereeData.presentSchool.schoolName,
                        schoolAddress: transfereeData.presentSchool.schoolAddress,
                        inclusiveYears: transfereeData.presentSchool.inclusiveYears,
                        reasonForLeaving: transfereeData.presentSchool.reasonForLeaving,
                    }
                    : null,
                previousSchool: transfereeData.previousSchool
                    ? {
                        schoolName: transfereeData.previousSchool.schoolName,
                        schoolAddress: transfereeData.previousSchool.schoolAddress,
                        inclusiveYears: transfereeData.previousSchool.inclusiveYears,
                        reasonForLeaving: transfereeData.previousSchool.reasonForLeaving,
                    }
                    : null,
            }
            : null;

        // Build siblings data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const siblings: StudentSibling[] = (studentApplication.siblings || []).map((sibling: any) => ({
            id: sibling.id,
            familyName: sibling.familyName,
            firstName: sibling.firstName,
            middleName: sibling.middleName,
            birthDate: sibling.birthDate.toISOString().split('T')[0],
            age: sibling.age,
            gradeYearLevel: sibling.gradeYearLevel,
            schoolEmployer: sibling.schoolEmployer,
        }));

        // Build requirements data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requirements: StudentRequirement[] = (studentApplication.requirements || []).map((req: any) => ({
            id: req.id,
            requirementType: req.requirementType,
            status: req.status,
            fileUrl: req.fileUrl,
            description: req.description,
            createdAt: req.createdAt.toISOString(),
            updatedAt: req.updatedAt.toISOString(),
        }));

        return {
            personalData,
            healthData,
            familyBackground,
            educationalBackground,
            transfereeBackground,
            siblings,
            requirements,
        };
    } catch (error) {
        console.error('Error fetching student data:', error);
        return null;
    }
}
