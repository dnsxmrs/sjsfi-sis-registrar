import { prisma } from '@/lib/prisma'

// Helper functions for generating random data
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomPhone(): string {
    return `09${Math.floor(Math.random() * 900000000) + 100000000}`;
}

function generateRandomEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function generateLandline(): string {
    return `02${Math.floor(Math.random() * 90000000) + 10000000}`;
}

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.registrationCode.deleteMany();
    await prisma.siblings.deleteMany();
    await prisma.presentSchool.deleteMany();
    await prisma.previousSchool.deleteMany();
    await prisma.transferee.deleteMany();
    await prisma.honorsAwards.deleteMany();
    await prisma.educationalBackground.deleteMany();
    await prisma.familyBackground.deleteMany();
    await prisma.healthHistory.deleteMany();
    await prisma.contactNumber.deleteMany();
    await prisma.guardian.deleteMany();
    await prisma.requirements.deleteMany();
    await prisma.studentApplication.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.generalPolicy.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.yearLevel.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();

    // Filipino names for realistic data
    const firstNames = [
        'Maria', 'Jose', 'Juan', 'Ana', 'Antonio', 'Carmen', 'Francisco', 'Rosa', 'Pedro', 'Teresa',
        'Manuel', 'Luz', 'Ricardo', 'Elena', 'Carlos', 'Cristina', 'Roberto', 'Patricia', 'Fernando', 'Isabel',
        'Miguel', 'Sofia', 'Diego', 'Gabriela', 'Luis', 'Valentina', 'Rafael', 'Isabella'
    ];

    const familyNames = [
        'Garcia', 'Cruz', 'Gonzalez', 'Reyes', 'Santos', 'Flores', 'Mendoza', 'Rivera', 'Torres', 'Rodriguez',
        'Ramos', 'Villanueva', 'Bautista', 'Francisco', 'Morales', 'Dela Cruz', 'Hernandez', 'Castro',
        'Santiago', 'Tan', 'Lim', 'Sy', 'Wong', 'Go'
    ];

    // 1. Create Year Levels
    console.log('📚 Creating year levels...');
    const yearLevels = await Promise.all([
        prisma.yearLevel.create({ data: { name: 'Kinder 1' } }),
        prisma.yearLevel.create({ data: { name: 'Kinder 2' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 1' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 2' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 3' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 4' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 5' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 6' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 7' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 8' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 9' } }),
        prisma.yearLevel.create({ data: { name: 'Grade 10' } }),
    ]);

    // 2. Create Academic Terms
    console.log('🗓️ Creating academic terms...');
    const academicTerms = await Promise.all([
        prisma.academicTerm.create({
            data: {
                year: '2023-2024',
                startDate: new Date('2023-08-15'),
                endDate: new Date('2024-06-15'),
                status: 'INACTIVE'
            }
        }),
        prisma.academicTerm.create({
            data: {
                year: '2024-2025',
                startDate: new Date('2024-08-15'),
                endDate: new Date('2025-06-15'),
                status: 'ACTIVE'
            }
        }),
        prisma.academicTerm.create({
            data: {
                year: '2025-2026',
                startDate: new Date('2025-08-15'),
                endDate: new Date('2026-06-15'),
                status: 'INACTIVE'
            }
        }),
    ]);

    // 3. Create General Policies
    console.log('📋 Creating general policies...');
    await prisma.generalPolicy.create({
        data: {
            title: 'General Enrollment Policy',
            content: '<h3>Enrollment Requirements</h3><p>All students must submit complete documents during enrollment period.</p><h3>Payment Policy</h3><p>Tuition fees must be settled according to the selected payment plan.</p>'
        }
    });

    // 4. Create Admin Users
    console.log('👥 Creating admin users...');
    const adminUsers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'admin@sjsfi.edu.ph',
                firstName: 'Administrator',
                familyName: 'System',
                role: 'ADMIN'
            }
        }),
        prisma.user.create({
            data: {
                email: 'staff@sjsfi.edu.ph',
                firstName: 'Staff',
                familyName: 'Office',
                role: 'STAFF'
            }
        }),
        prisma.user.create({
            data: {
                email: 'teacher@sjsfi.edu.ph',
                firstName: 'Teacher',
                familyName: 'Faculty',
                role: 'TEACHER'
            }
        })
    ]);

    // 5. Create Student Users
    console.log('👨‍🎓 Creating student users...');
    const students = [];

    // Create specific student
    const mainStudent = await prisma.user.create({
        data: {
            email: 'student@student.com',
            firstName: 'John',
            middleName: 'Miguel',
            familyName: 'Dela Cruz',
            role: 'STUDENT',
            student: {
                create: {
                    studentNumber: 'STU2025001',
                    birthdate: new Date('2010-11-11')
                }
            }
        },
        include: { student: true }
    });
    students.push(mainStudent);

    // Create additional students
    for (let i = 0; i < 9; i++) {
        const firstName = getRandomElement(firstNames);
        const middleName = getRandomElement(firstNames);
        const familyName = getRandomElement(familyNames);

        const student = await prisma.user.create({
            data: {
                email: generateRandomEmail(firstName, familyName),
                firstName,
                middleName: Math.random() > 0.3 ? middleName : undefined,
                familyName,
                role: 'STUDENT',
                student: {
                    create: {
                        studentNumber: `STU2025${String(i + 2).padStart(3, '0')}`,
                        birthdate: generateRandomDate(new Date('2008-01-01'), new Date('2015-12-31'))
                    }
                }
            },
            include: { student: true }
        });
        students.push(student);
    }

    // 6. Create Student Applications
    console.log('📝 Creating student applications...');
    const applications = [];

    for (let i = 0; i < 8; i++) {
        const student = students[i];
        const academicTerm = academicTerms[1]; // Active term
        const yearLevel = getRandomElement(yearLevels);
        const birthdate = student.student?.birthdate || new Date('2010-01-01');
        const age = new Date().getFullYear() - birthdate.getFullYear();

        const application = await prisma.studentApplication.create({
            data: {
                academicYearId: academicTerm.id,
                yearLevelId: yearLevel.id,
                familyName: student.familyName,
                firstName: student.firstName,
                middleName: student.middleName || 'N/A',
                nickName: student.firstName.substring(0, Math.min(4, student.firstName.length)),
                birthdate: birthdate,
                placeOfBirth: getRandomElement(['Manila', 'Quezon City', 'Makati', 'Pasig', 'Caloocan', 'Mandaluyong']),
                age: age,
                birthOrder: Math.floor(Math.random() * 4) + 1,
                numberOfSiblings: Math.floor(Math.random() * 5),
                gender: getRandomElement(['MALE', 'FEMALE']),
                nationality: 'Filipino',
                religion: getRandomElement(['Catholic', 'Protestant', 'Iglesia ni Cristo', 'Islam', 'Buddhist', 'Other']),
                heightCm: (age <= 7 ? 110 : age <= 12 ? 140 : 155) + Math.floor(Math.random() * 15),
                weightKg: (age <= 7 ? 20 : age <= 12 ? 35 : 45) + Math.floor(Math.random() * 10),
                bloodType: getRandomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                languagesSpokenAtHome: getRandomElement(['Filipino', 'English', 'Filipino and English', 'Tagalog', 'Cebuano']),
                childStatus: getRandomElement(['BIOLOGICAL', 'LEGITIMATE', 'ADOPTED', 'STEPCHILD']),
                landlineNumber: generateLandline(),
                mobileNumber: generateRandomPhone(),
                emailAddress: student.email,
                homeAddress: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Main', 'Pearl', 'Mango', 'Oak'])} Street`,
                city: getRandomElement(['Manila', 'Quezon City', 'Makati', 'Pasig']),
                stateProvince: 'Metro Manila',
                postalCode: String(Math.floor(Math.random() * 9000) + 1000),
                provincialAddress: `${Math.floor(Math.random() * 500) + 1} Provincial Road`,
                provincialCity: getRandomElement(['Batangas City', 'Santa Rosa', 'Bacoor', 'San Jose del Monte']),
                provincialStateProvince: getRandomElement(['Batangas', 'Laguna', 'Cavite', 'Bulacan']),
                provincialPostalCode: String(Math.floor(Math.random() * 5000) + 4000),
                talents: getRandomElement(['Drawing and Painting', 'Singing', 'Dancing', 'Playing Sports', 'Playing Musical Instruments']),
                hobbiesInterests: getRandomElement(['Reading books', 'Playing video games', 'Watching movies', 'Playing sports', 'Collecting toys']),
                createdBy: adminUsers[0].id,
                status: getRandomElement(['PENDING', 'APPROVED', 'UNDER_REVIEW', 'REJECTED'])
            }
        });
        applications.push(application);
    }

    // 7. Create Health History for applications
    console.log('🏥 Creating health history...');
    for (let i = 0; i < Math.min(5, applications.length); i++) {
        await prisma.healthHistory.create({
            data: {
                studentApplicationId: applications[i].id,
                childhoodDiseases: getRandomElement(['Measles', 'Chickenpox', 'None', 'Mumps']),
                allergies: getRandomElement(['None', 'Food allergies (seafood)', 'Dust allergies', 'Pollen allergies']),
                otherMedicalConditions: getRandomElement(['None', 'Asthma', 'Mild asthma']),
                immunizations: 'BCG, Hepatitis B, DPT, Polio, MMR',
                specificHandicaps: 'None',
                createdBy: adminUsers[0].id
            }
        });
    }

    // 8. Create Family Background for applications
    console.log('👪 Creating family backgrounds...');
    for (let i = 0; i < Math.min(5, applications.length); i++) {
        const guardianTypes: Array<'FATHER' | 'MOTHER'> = ['FATHER', 'MOTHER'];

        for (const guardianType of guardianTypes) {
            const birthdate = generateRandomDate(new Date('1975-01-01'), new Date('1995-12-31'));
            const age = new Date().getFullYear() - birthdate.getFullYear();

            await prisma.familyBackground.create({
                data: {
                    studentFormId: applications[i].id,
                    guardianType: guardianType,
                    familyName: getRandomElement(familyNames),
                    firstName: getRandomElement(firstNames),
                    middleName: getRandomElement(firstNames),
                    birthdate: birthdate,
                    placeOfBirth: getRandomElement(['Manila', 'Quezon City', 'Cebu', 'Davao']),
                    age: age,
                    nationality: 'Filipino',
                    religion: getRandomElement(['Catholic', 'Protestant', 'Iglesia ni Cristo']),
                    landLine: Math.random() > 0.5 ? generateLandline() : undefined,
                    mobileNo: generateRandomPhone(),
                    emailAddress: generateRandomEmail(getRandomElement(firstNames), getRandomElement(familyNames)),
                    homeAddress: `${Math.floor(Math.random() * 999) + 1} ${getRandomElement(['Main', 'Pearl', 'Oak'])} Street`,
                    city: getRandomElement(['Manila', 'Quezon City', 'Makati']),
                    stateProvince: 'Metro Manila',
                    postalCode: String(Math.floor(Math.random() * 9000) + 1000),
                    educationalAttainment: getRandomElement(['High School Graduate', 'College Graduate', 'Vocational', 'Master\'s Degree']),
                    occupation: getRandomElement(['Teacher', 'Engineer', 'Nurse', 'Businessman', 'OFW', 'Government Employee']),
                    employer: getRandomElement(['Private Company', 'Government Agency', 'Self-Employed', 'Abroad']),
                    companyAddress: '123 Business District, Makati City',
                    companyCity: 'Makati',
                    businessNo: generateRandomPhone(),
                    annualIncome: Math.floor(Math.random() * 500000) + 250000,
                    parentStatus: getRandomElement(['MARRIED', 'SEPARATED', 'SINGLE', 'WIDOWED']),
                    createdBy: adminUsers[0].id
                }
            });
        }
    }

    // 9. Create Siblings for applications
    console.log('👶 Creating siblings...');
    for (let i = 0; i < Math.min(4, applications.length); i++) {
        const numSiblings = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numSiblings; j++) {
            const siblingBirthdate = generateRandomDate(new Date('2005-01-01'), new Date('2018-12-31'));
            const siblingAge = new Date().getFullYear() - siblingBirthdate.getFullYear();

            await prisma.siblings.create({
                data: {
                    studentApplicationId: applications[i].id,
                    familyName: applications[i].familyName,
                    firstName: getRandomElement(firstNames),
                    middleName: getRandomElement(firstNames),
                    birthDate: siblingBirthdate,
                    age: siblingAge,
                    gradeYearLevel: siblingAge < 5 ? 'Preschool' : `Grade ${Math.min(siblingAge - 4, 12)}`,
                    schoolEmployer: getRandomElement(['St. John School', 'Public School', 'Private School', 'Working'])
                }
            });
        }
    }

    // 10. Create Educational Background
    console.log('📖 Creating educational backgrounds...');
    for (let i = 0; i < Math.min(3, applications.length); i++) {
        const edBg = await prisma.educationalBackground.create({
            data: {
                studentFormId: applications[i].id,
                yearLevel: getRandomElement(['Kinder 2', 'Grade 6', 'Grade 7']),
                schoolName: getRandomElement(['ABC Elementary School', 'XYZ Private School', 'Public Elementary School']),
                schoolAddress: '123 School Street, Manila',
                inclusiveYearsAttended: '2018-2024',
                attendedSummerClasses: Math.random() > 0.5,
                summerClassDetails: 'Math and Reading enrichment',
                yearRepeated: null,
                numberOfSubjectsFailed: 0
            }
        });

        // Add honors/awards
        if (Math.random() > 0.5) {
            await prisma.honorsAwards.create({
                data: {
                    educationalId: edBg.id,
                    description: getRandomElement(['With Honors', 'Perfect Attendance', 'Best in Math', 'Leadership Award'])
                }
            });
        }
    }

    // 11. Create Transferee records
    console.log('🔄 Creating transferee records...');
    for (let i = 0; i < Math.min(2, applications.length); i++) {
        const transferee = await prisma.transferee.create({
            data: {
                studentFormId: applications[i].id,
                reasonForTransfer: 'Family relocation',
                disiplinaryRecord: 'No disciplinary record'
            }
        });

        // Previous school
        await prisma.previousSchool.create({
            data: {
                transferId: transferee.id,
                schoolName: 'Previous School Name',
                schoolAddress: '456 Old Street, Quezon City',
                inclusiveYears: '2020-2024',
                reasonForLeaving: 'Family moved to new location'
            }
        });

        // Present school
        await prisma.presentSchool.create({
            data: {
                transferId: transferee.id,
                schoolName: 'St. John School',
                schoolAddress: 'Current School Address',
                inclusiveYears: '2024-Present',
                reasonForLeaving: null
            }
        });
    }

    // 12. Create Registrations
    console.log('🎓 Creating registrations...');
    const registrations = [];

    for (let i = 0; i < 6; i++) {
        const student = students[i];
        const application = i < applications.length ? applications[i] : undefined;
        const yearLevel = getRandomElement(yearLevels);
        const academicTerm = academicTerms[1];
        const birthdate = student.student?.birthdate || new Date('2010-01-01');
        const age = new Date().getFullYear() - birthdate.getFullYear();

        const registration = await prisma.registration.create({
            data: {
                studentApplicationId: application?.id,
                schoolYearId: academicTerm.id,
                registrationType: getRandomElement(['NEW', 'OLD', 'TRANSFER']),
                yearLevelId: yearLevel.id,
                studentNo: student.student!.studentNumber,
                familyName: student.familyName,
                firstName: student.firstName,
                middleName: student.middleName || 'N/A',
                birthdate: birthdate,
                placeOfBirth: getRandomElement(['Manila', 'Quezon City', 'Makati']),
                age: age,
                gender: getRandomElement(['MALE', 'FEMALE']),
                streetAddress: `${Math.floor(Math.random() * 999) + 1} Main Street`,
                city: getRandomElement(['Manila', 'Quezon City', 'Makati']),
                stateProvince: 'Metro Manila',
                postalCode: String(Math.floor(Math.random() * 9000) + 1000),
                modeOfPayment: getRandomElement(['Cash', 'Installment', 'Full Payment']),
                amountPayable: Math.floor(Math.random() * 30000) + 20000,
                emailAddress: student.email,
                status: getRandomElement(['PENDING', 'APPROVED', 'REJECTED'])
            }
        });
        registrations.push(registration);
    }

    // 13. Create Guardians for Registrations
    console.log('👨‍👩‍👧 Creating guardians...');
    for (const registration of registrations) {
        const numGuardians = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numGuardians; i++) {
            await prisma.guardian.create({
                data: {
                    registrationId: registration.id,
                    familyName: getRandomElement(familyNames),
                    firstName: getRandomElement(firstNames),
                    middleName: getRandomElement(firstNames),
                    occupation: getRandomElement(['Teacher', 'Engineer', 'Doctor', 'Nurse', 'Businessman', 'OFW']),
                    relationToStudent: i === 0 ? getRandomElement(['Mother', 'Father']) : getRandomElement(['Aunt', 'Uncle', 'Grandmother', 'Grandfather'])
                }
            });
        }
    }

    // 14. Create Contact Numbers for Registrations
    console.log('📞 Creating contact numbers...');
    for (const registration of registrations) {
        const numContacts = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numContacts; i++) {
            await prisma.contactNumber.create({
                data: {
                    registrationId: registration.id,
                    number: generateRandomPhone(),
                    type: i === 0 ? 'Mobile' : 'Home'
                }
            });
        }
    }

    // 15. Create Requirements
    console.log('📄 Creating requirements...');
    const requirementTypes = [
        'Birth Certificate (PSA)',
        'Form 137 (Report Card)',
        'Form 138 (Permanent Record)',
        'Good Moral Certificate',
        'Medical Certificate',
        '2x2 ID Picture',
        'Barangay Clearance',
        'Certificate of Transfer'
    ];

    for (let i = 0; i < 12; i++) {
        await prisma.requirements.create({
            data: {
                requirementType: getRandomElement(requirementTypes),
                status: getRandomElement(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'INCOMPLETE']),
                fileUrl: Math.random() > 0.4 ? `https://storage.sjsfi.edu.ph/documents/req_${Date.now()}_${i}.pdf` : undefined,
                description: Math.random() > 0.5 ? 'Submitted via online portal' : undefined
            }
        });
    }

    // 16. Create Registration Codes
    console.log('🔢 Creating registration codes...');
    for (let i = 0; i < applications.length; i++) {
        await prisma.registrationCode.create({
            data: {
                registrationCode: `REG${academicTerms[1].year.replace('-', '')}${String(i + 1).padStart(5, '0')}`,
                status: getRandomElement(['ACTIVE', 'INACTIVE', 'EXPIRED']),
                expirationDate: new Date('2025-12-31'),
                registrationId: i < registrations.length ? registrations[i].id : undefined,
                applicationId: applications[i].id
            }
        });
    }

    // 17. Create Feedback
    console.log('💬 Creating feedback...');
    const feedbackMessages = [
        { type: 'COMPLIMENT', msg: 'The enrollment process was very smooth and easy to understand!', sug: null },
        { type: 'SUGGESTION', msg: 'The website works well.', sug: 'Please add a mobile app for easier access.' },
        { type: 'COMPLAINT', msg: 'I had difficulty uploading large files.', sug: 'Increase file upload size limit.' },
        { type: 'BUG_REPORT', msg: 'The page refreshes automatically during form submission.', sug: 'Fix auto-refresh issue.' },
        { type: 'FEATURE_REQUEST', msg: 'Great system overall.', sug: 'Add email notifications for application status updates.' },
        { type: 'COMPLIMENT', msg: 'Staff were very helpful during enrollment!', sug: null },
        { type: 'SUGGESTION', msg: 'Good system.', sug: 'Add online payment options.' },
    ];

    for (const fb of feedbackMessages) {
        await prisma.feedback.create({
            data: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: fb.type as any,
                message: fb.msg,
                suggestion: fb.sug
            }
        });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 SEEDING SUMMARY
==================
🎓 Academic Data:
   - Year Levels: ${yearLevels.length}
   - Academic Terms: ${academicTerms.length}
   - General Policies: 1

👥 Users:
   - Admin Users: ${adminUsers.length}
   - Student Users: ${students.length}
   - Total Users: ${students.length + adminUsers.length}

📝 Applications & Registrations:
   - Student Applications: ${applications.length}
   - Registrations: ${registrations.length}
   - Health History Records: ${Math.min(5, applications.length)}
   - Family Background Records: ${Math.min(5, applications.length) * 2}
   - Siblings Records: ~${Math.min(4, applications.length) * 2}
   - Educational Backgrounds: ${Math.min(3, applications.length)}
   - Transferee Records: ${Math.min(2, applications.length)}

📋 Supporting Data:
   - Guardians: ~${registrations.length * 1.5}
   - Contact Numbers: ~${registrations.length * 1.5}
   - Requirements: 12
   - Registration Codes: ${applications.length}
   - Feedback Entries: ${feedbackMessages.length}

🌟 Sample Credentials:
   - Admin: admin@sjsfi.edu.ph
   - Staff: staff@sjsfi.edu.ph
   - Teacher: teacher@sjsfi.edu.ph
   - Student: student@student.com
   
✨ All data uses "Filipino" nationality as requested!
`);
}

main()
    .then(() => {
        console.log('🎉 Seed complete');
        return prisma.$disconnect();
    })
    .catch((e) => {
        console.error('❌ Seed failed', e);
        return prisma.$disconnect().finally(() => process.exit(1));
    });
