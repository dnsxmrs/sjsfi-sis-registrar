'use server'

import { prisma } from '@/lib/prisma'
import { logRegistrationEvent, logSecurityEvent } from '@/lib/systemLoggerHelpers'

// Define enums locally since they might not be exported
enum RegistrationType {
    NEW = 'NEW',
    OLD = 'OLD',
    TRANSFER = 'TRANSFER'
}

enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export interface RegistrationFormData {
    registrationCode: string
    schoolYear: string
    schoolYearType: 'old' | 'new'
    gradeYearLevel: string
    familyName: string
    firstName: string
    middleName: string
    birthDate: string
    placeOfBirth: string
    age: string
    gender: 'female' | 'male'
    streetAddress: string
    city: string
    stateProvince: string
    zipCode: string
    parents: Array<{
        familyName: string
        firstName: string
        middleName: string
        occupation: string
        relation: string
    }>
    contactNumbers: string[]
    modeOfPayment: string
    amountPayable: string
    emailAddress: string
    requirements?: {
        goodMoral: boolean
        birthCertificate: boolean
        f138: boolean
        f137: boolean
        privacyForm: boolean
    }
}

export interface RegistrationResult {
    success: boolean
    registration?: {
        id: number
        studentNo: string
        fullName: string
        yearLevel: string
        schoolYear: string
    }
    error?: string
}

export async function addRegistration(data: RegistrationFormData): Promise<RegistrationResult> {
    const startTime = Date.now();
    const studentName = `${data.firstName} ${data.middleName || ''} ${data.familyName}`.trim();

    try {
        // 1. Validate the registration code and check if it's still active
        const registrationCodeRecord = await prisma.registrationCode.findUnique({
            where: {
                registrationCode: data.registrationCode
            }
        })

        if (!registrationCodeRecord) {
            // Log failed registration attempt due to invalid code
            await logSecurityEvent({
                actionType: 'SUSPICIOUS_ACTIVITY',
                description: `Failed registration attempt with invalid code: ${data.registrationCode}`,
                targetType: 'REGISTRATION',
                targetId: data.registrationCode,
                metadata: {
                    studentName,
                    email: data.emailAddress,
                    reason: 'Invalid registration code'
                }
            });

            return {
                success: false,
                error: 'Invalid registration code.'
            }
        }

        if (registrationCodeRecord.status !== 'ACTIVE') {
            // Log failed registration attempt due to inactive code
            await logRegistrationEvent({
                actionType: 'CREATE',
                registrationId: data.registrationCode,
                studentName,
                success: false,
                errorMessage: 'Registration code already used or invalid',
                userName: 'System',
                userRole: 'SYSTEM'
            });

            return {
                success: false,
                error: 'Registration code has already been used or is no longer valid.'
            }
        }

        // Check if the code has expired (if expiration date is set)
        if (registrationCodeRecord.expirationDate && new Date() > registrationCodeRecord.expirationDate) {
            // Log failed registration attempt due to expired code
            await logRegistrationEvent({
                actionType: 'CREATE',
                registrationId: data.registrationCode,
                studentName,
                success: false,
                errorMessage: 'Registration code expired',
                userName: 'System',
                userRole: 'SYSTEM'
            });

            return {
                success: false,
                error: 'Registration code has expired.'
            }
        }

        // 2. Find the school year and year level by name/year
        const schoolYearRecord = await prisma.academicTerm.findFirst({
            where: {
                year: data.schoolYear,
                status: 'ACTIVE'
            }
        })

        if (!schoolYearRecord) {
            return {
                success: false,
                error: 'Invalid school year selected.'
            }
        }

        const yearLevelRecord = await prisma.yearLevel.findFirst({
            where: {
                name: data.gradeYearLevel
            }
        })

        if (!yearLevelRecord) {
            return {
                success: false,
                error: 'Invalid year level selected.'
            }
        }

        // 3. Generate student number (you may want to implement your own logic here)
        const registrationCount = await prisma.registration.count()
        const schoolYearPrefix = schoolYearRecord.startDate.getFullYear()
        const studentNo = `REG-${schoolYearPrefix}-${String(registrationCount + 1).padStart(4, '0')}`

        // 4. Convert string values to appropriate types
        const ageNumber = parseInt(data.age, 10)
        const amountPayableNumber = parseInt(data.amountPayable, 10)
        const birthDateObj = new Date(data.birthDate)

        const now = new Date();

        // Map registration type
        const registrationType: RegistrationType = data.schoolYearType === 'new' ? RegistrationType.NEW : RegistrationType.OLD

        // Map gender
        const genderEnum: Gender = data.gender === 'male' ? Gender.MALE : Gender.FEMALE

        // 5. Use a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Create the registration record
            const registration = await tx.registration.create({
                data: {
                    schoolYearId: schoolYearRecord.id,
                    registrationType: registrationType,
                    yearLevelId: yearLevelRecord.id,
                    studentNo: studentNo,
                    familyName: data.familyName,
                    firstName: data.firstName,
                    middleName: data.middleName,
                    birthdate: birthDateObj,
                    placeOfBirth: data.placeOfBirth,
                    age: ageNumber,
                    gender: genderEnum,
                    streetAddress: data.streetAddress,
                    city: data.city,
                    stateProvince: data.stateProvince,
                    postalCode: data.zipCode,
                    modeOfPayment: data.modeOfPayment,
                    amountPayable: amountPayableNumber,
                    status: 'PENDING', // Default status
                    emailAddress: data.emailAddress,

                    createdAt: now,
                    updatedAt: now,
                }
            })

            // Create contact numbers
            for (const contactNumber of data.contactNumbers) {
                if (contactNumber.trim()) {
                    await tx.contactNumber.create({
                        data: {
                            registrationId: registration.id,
                            number: contactNumber.trim(),
                            createdAt: now,
                            updatedAt: now
                        }
                    })
                }
            }

            // Create guardians/parents
            for (const parent of data.parents) {
                if (parent.familyName.trim() || parent.firstName.trim()) {
                    await tx.guardian.create({
                        data: {
                            registrationId: registration.id,
                            familyName: parent.familyName,
                            firstName: parent.firstName,
                            middleName: parent.middleName,
                            occupation: parent.occupation,
                            relationToStudent: parent.relation,
                            createdAt: now,
                            updatedAt: now
                        }
                    })
                }
            }

            // Mark the registration code as used
            await tx.registrationCode.update({
                where: {
                    id: registrationCodeRecord.id
                },
                data: {
                    status: 'INACTIVE',
                    updatedAt: now,
                    registrationId: registration.id
                }
            })

            return registration
        })

        // Log successful registration creation
        await logRegistrationEvent({
            actionType: 'CREATE',
            registrationId: result.id.toString(),
            studentName,
            newValues: {
                studentNo: result.studentNo,
                studentName,
                yearLevel: yearLevelRecord.name,
                schoolYear: schoolYearRecord.year,
                status: 'PENDING',
                registrationCode: data.registrationCode
            },
            success: true,
            userName: 'System',
            userRole: 'SYSTEM'
        });

        return {
            success: true,
            registration: {
                id: result.id,
                studentNo: result.studentNo,
                fullName: `${result.firstName} ${result.middleName} ${result.familyName}`,
                yearLevel: yearLevelRecord.name,
                schoolYear: schoolYearRecord.year
            }
        }

    } catch (error) {
        console.error('Error adding registration:', error)

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const executionTime = Date.now() - startTime;

        // Log the failed registration attempt
        await logRegistrationEvent({
            actionType: 'CREATE',
            registrationId: data.registrationCode,
            studentName,
            success: false,
            errorMessage,
            userName: 'System',
            userRole: 'SYSTEM'
        });

        // Handle specific error cases
        if (error instanceof Error) {
            // Check for unique constraint violations or other specific errors
            if (error.message.includes('Unique constraint')) {
                // Log duplicate registration attempt as security event
                await logSecurityEvent({
                    actionType: 'SUSPICIOUS_ACTIVITY',
                    description: `Duplicate registration attempt for student: ${studentName}`,
                    targetType: 'REGISTRATION',
                    targetId: data.registrationCode,
                    metadata: {
                        studentName,
                        email: data.emailAddress,
                        executionTime,
                        error: 'Unique constraint violation'
                    }
                });

                return {
                    success: false,
                    error: 'A registration with this information already exists.'
                }
            }
        }

        return {
            success: false,
            error: 'An unexpected error occurred while processing your registration. Please try again.'
        }
    }
}
