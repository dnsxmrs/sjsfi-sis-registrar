'use server'

import { prisma } from '@/lib/prisma'

export async function getRegistrationByCode(code: string) {
    try {
        if (!code) {
            return {
                success: false,
                error: 'Registration code is required'
            }
        }

        // Find the registration code
        const registrationCode = await prisma.registrationCode.findFirst({
            where: {
                registrationCode: code,
                status: 'ACTIVE'
            },
            include: {
                registration: {
                    include: {
                        schoolYear: true,
                        yearLevel: true
                    }
                },
            }
        })

        if (!registrationCode) {
            return {
                success: false,
                error: 'Invalid or expired registration code'
            }
        }

        // Get data from either registration or application
        const registration = registrationCode.registration

        // Prepare the response data
        const data = {
            // Personal Data
            academicYear: registration?.schoolYear?.year || '',
            admissionGradeYear: registration?.yearLevel?.name || '',
            familyName: registration?.familyName || '',
            firstName: registration?.firstName || '',
            middleName: registration?.middleName || '',
            birthDate: registration?.birthdate ? new Date(registration.birthdate).toISOString().split('T')[0] : '',
            placeOfBirth: registration?.placeOfBirth || '',
            age: registration?.age?.toString() || '',
            gender: registration?.gender?.toLowerCase() || '',
            email: registration?.emailAddress || '',
            homeAddress: registration?.streetAddress || '',
            homeCity: registration?.city || '',
            homeStateProvince: registration?.stateProvince || '',
            homeZip: registration?.postalCode || '',

            // Additional metadata
            hasRegistration: !!registration,
            registrationId: registration?.id,
            codeId: registrationCode.id
        }

        return {
            success: true,
            data
        }
    } catch (error) {
        console.error('Error fetching registration by code:', error)
        return {
            success: false,
            error: 'Failed to fetch registration data'
        }
    }
}
