"use server";

import { prisma } from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";
import nodemailer from 'nodemailer';
// import { logSystemAction } from "@/lib/systemLogger";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Generate a secure random password
 * Format: 2 uppercase + 2 lowercase + 2 numbers + 2 special chars = 12 chars minimum
 */
function generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

    // Build password with required character types
    let password = '';
    password += getRandomChar(uppercase) + getRandomChar(uppercase);
    password += getRandomChar(lowercase) + getRandomChar(lowercase);
    password += getRandomChar(numbers) + getRandomChar(numbers);
    password += getRandomChar(special) + getRandomChar(special);

    // Add 4 more random characters from all sets
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 4; i++) {
        password += getRandomChar(allChars);
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Send welcome email with credentials to approved student
 */
async function sendWelcomeEmail(
    email: string,
    studentName: string,
    applicationNumber: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Create reusable transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address
                pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
            },
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP verification failed:', verifyError);
            return { success: false, error: 'SMTP configuration error' };
        }

        // Create professional HTML email template
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: white; 
                }
                .header { 
                    background: linear-gradient(135deg, #8B0000 0%, #a81414 100%);
                    color: white; 
                    padding: 40px 20px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: bold; 
                }
                .header p { 
                    margin: 10px 0 0 0; 
                    font-size: 18px; 
                    opacity: 0.95; 
                }
                .success-badge {
                    background-color: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    display: inline-block;
                    margin: 20px 0;
                    font-weight: bold;
                    font-size: 16px;
                }
                .content { 
                    padding: 30px 20px; 
                }
                .greeting { 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                }
                .credentials-box { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px; 
                    border-radius: 10px; 
                    margin: 25px 0; 
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .credentials-box h3 { 
                    margin-top: 0; 
                    font-size: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .credential-item { 
                    background-color: rgba(255, 255, 255, 0.2); 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 15px 0; 
                    backdrop-filter: blur(10px);
                }
                .credential-item label { 
                    display: block; 
                    font-size: 12px; 
                    opacity: 0.9; 
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .credential-item .value { 
                    font-size: 18px; 
                    font-weight: bold; 
                    font-family: 'Courier New', monospace;
                    word-break: break-all;
                }
                .student-info { 
                    background-color: #e8f4f8; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #0066cc; 
                }
                .student-info p {
                    margin: 8px 0;
                }
                .warning-box { 
                    background-color: #fff3cd; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #ffc107; 
                }
                .warning-box h3 { 
                    color: #856404; 
                    margin-top: 0; 
                    font-size: 18px;
                }
                .warning-box ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .warning-box li {
                    margin: 8px 0;
                    color: #856404;
                }
                .next-steps { 
                    background-color: #d4edda; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #28a745; 
                }
                .next-steps h3 { 
                    color: #155724; 
                    margin-top: 0; 
                }
                .next-steps ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .next-steps li {
                    margin: 10px 0;
                    color: #155724;
                }
                .contact-info { 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                }
                .contact-info h3 { 
                    color: #495057; 
                    margin-top: 0; 
                }
                .contact-item { 
                    margin: 10px 0; 
                    display: flex; 
                    align-items: center; 
                }
                .contact-item strong { 
                    min-width: 120px; 
                    color: #495057; 
                }
                .footer { 
                    background-color: #2c3e50; 
                    color: white;
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                }
                .footer p {
                    margin: 5px 0;
                    opacity: 0.9;
                }
                .signature { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #eee; 
                }
                a { 
                    color: #0066cc; 
                    text-decoration: none; 
                }
                a:hover { 
                    text-decoration: underline; 
                }
                @media only screen and (max-width: 600px) {
                    .container { margin: 0 10px; }
                    .content, .header { padding: 20px 15px; }
                    .credential-item .value { font-size: 14px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to SJSFI! 🎉</h1>
                    <p>Your Application Has Been Approved</p>
                    <div class="success-badge">✓ APPROVED</div>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${studentName}</strong>,</p>
                    </div>
                    
                    <p>Congratulations! We are delighted to inform you that your student application has been <strong>approved</strong>! Welcome to the Saint Joseph School of Fairview Inc. family.</p>
                    
                    <div class="student-info">
                        <p><strong>Student Number:</strong> ${applicationNumber}</p>
                        <p><strong>Student Name:</strong> ${studentName}</p>
                        <p><strong>Email Address:</strong> ${email}</p>
                    </div>
                    
                    <div class="credentials-box">
                        <h3>🔐 Your Login Credentials</h3>
                        <p style="text-align: center; margin-bottom: 20px; font-size: 14px;">Please keep this information secure and confidential.</p>
                        
                        <div class="credential-item">
                            <label>Email Address (Username)</label>
                            <div class="value">${email}</div>
                        </div>
                        
                        <div class="credential-item">
                            <label>Temporary Password</label>
                            <div class="value">${password}</div>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <h3>⚠️ Important Security Notice</h3>
                        <ul>
                            <li><strong>Change your password immediately</strong> after your first login</li>
                            <li>Never share your password with anyone, including school staff</li>
                            <li>Use a strong, unique password that you don't use elsewhere</li>
                            <li>Keep this email in a secure location for your records</li>
                            <li>If you suspect unauthorized access, contact us immediately</li>
                        </ul>
                    </div>
                    
                    <div class="next-steps">
                        <h3>📋 Next Steps</h3>
                        <ol>
                            <li><strong>Login to your account</strong> using the credentials above</li>
                            <li><strong>Change your password</strong> in your account settings</li>
                            <li><strong>Complete your profile</strong> by adding any missing information</li>
                            <li><strong>Review your enrollment details</strong> and academic schedule</li>
                            <li><strong>Submit any pending requirements</strong> if applicable</li>
                        </ol>
                    </div>
                    
                    <div class="contact-info">
                        <h3>📞 Need Help?</h3>
                        <p>If you have any questions or need assistance with your account, please contact us:</p>
                        <div class="contact-item">
                            <strong>Registrar's Office:</strong> <span>(02) 8123-4567</span>
                        </div>
                        <div class="contact-item">
                            <strong>Email Support:</strong> <a href="mailto:registrar@sjsfi.edu.ph">registrar@sjsfi.edu.ph</a>
                        </div>
                        <div class="contact-item">
                            <strong>Office Hours:</strong> <span>Monday to Friday, 8:00 AM - 5:00 PM</span>
                        </div>
                    </div>
                    
                    <p style="margin-top: 30px;">We look forward to supporting your educational journey and helping you achieve your academic goals!</p>
                    
                    <div class="signature">
                        <p><strong>Warm regards,</strong></p>
                        <p><strong>SJSFI Registrar's Office</strong><br>
                        Saint Joseph School of Fairview Inc.<br>
                        <em>Excellence in Education Since 1996</em></p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>This is an automated message regarding your application approval.</strong></p>
                    <p>For security reasons, please do not reply directly to this email with your password.</p>
                    <p>© ${new Date().getFullYear()} Saint Joseph School of Fairview Inc. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Plain text version for email clients that don't support HTML
        const textContent = `
🎉 WELCOME TO SJSFI! 🎉
Your Application Has Been Approved

Dear ${studentName},

Congratulations! We are delighted to inform you that your student application has been APPROVED! Welcome to the Saint Joseph School of Fairview Inc. family.

STUDENT INFORMATION:
- Student Number: ${applicationNumber}
- Student Name: ${studentName}
- Email Address: ${email}

YOUR LOGIN CREDENTIALS:
========================
Email (Username): ${email}
Temporary Password: ${password}
========================

⚠️ IMPORTANT SECURITY NOTICE:
• Change your password immediately after your first login
• Never share your password with anyone, including school staff
• Use a strong, unique password that you don't use elsewhere
• Keep this email in a secure location for your records
• If you suspect unauthorized access, contact us immediately

NEXT STEPS:
1. Login to your account using the credentials above
2. Change your password in your account settings
3. Complete your profile by adding any missing information
4. Review your enrollment details and academic schedule
5. Submit any pending requirements if applicable

NEED HELP?
If you have any questions or need assistance:
- Registrar's Office: (02) 8123-4567
- Email Support: registrar@sjsfi.edu.ph
- Office Hours: Monday to Friday, 8:00 AM - 5:00 PM

We look forward to supporting your educational journey!

Warm regards,
SJSFI Registrar's Office
Saint Joseph School of Fairview Inc.
Excellence in Education Since 1996

---
This is an automated message. For security reasons, please do not reply with your password.
© ${new Date().getFullYear()} Saint Joseph School of Fairview Inc. All rights reserved.
        `;

        // Define mail options
        const mailOptions = {
            from: {
                name: 'SJSFI Registrar Office',
                address: process.env.GMAIL_USER || 'registrar@sjsfi.edu.ph'
            },
            to: email,
            subject: `🎉 Welcome to SJSFI - Your Application is Approved! (Student #: ${applicationNumber})`,
            text: textContent,
            html: htmlContent,
            priority: 'high' as const,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'X-Mailer': 'SJSFI Registration System',
                'Importance': 'high'
            }
        };

        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);

        console.log('Welcome email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        return { success: true };

    } catch (error) {
        console.error('Email sending failed:', error);

        let errorMessage = 'Failed to send welcome email';

        if (error instanceof Error) {
            if (error.message.includes('authentication')) {
                errorMessage = 'Email authentication failed. Please check your Gmail credentials.';
            } else if (error.message.includes('connection')) {
                errorMessage = 'Failed to connect to email server. Please check your internet connection.';
            } else if (error.message.includes('recipient')) {
                errorMessage = 'Invalid recipient email address.';
            } else {
                errorMessage = `Email error: ${error.message}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}

interface RequirementFiles {
    birthCertificate: File | null;
    f137: File | null;
    f138: File | null;
    goodMoral: File | null;
    privacyForm: File | null;
}

interface StudentApplication {
    id: number;
    applicationNumber: string | null;
    fullName: string;
    gradeLevel: string;
    status: string;
    emailAddress: string;
    createdAt: string;
}

interface ApproveApplicationResult {
    success: boolean;
    error?: string;
    password?: string; // Return password for reference
    emailSent?: boolean; // Indicates if welcome email was sent successfully
}

export async function approveApplication(student: StudentApplication, requirementFiles: RequirementFiles): Promise<ApproveApplicationResult> {
    try {
        // Step 1: First get the application number (need it for file uploads)
        const studentApplicationData = await prisma.studentApplication.findUnique({
            where: { id: student.id },
            select: {
                academicYearId: true,
                academicYear: {
                    select: { year: true }
                }
            },
        });

        if (!studentApplicationData) {
            throw new Error('Student application not found');
        }

        const year = studentApplicationData.academicYear?.year.split('-')[0] ?? new Date().getFullYear().toString();

        // Find the highest application number for this academic year to avoid duplicates
        const lastApprovedApplication = await prisma.studentApplication.findFirst({
            where: {
                academicYearId: studentApplicationData.academicYearId,
                applicationNumber: {
                    startsWith: `SJSFI-${year}-`
                }
            },
            orderBy: {
                applicationNumber: 'desc'
            },
            select: {
                applicationNumber: true
            }
        });

        let nextNumber = 0;
        if (lastApprovedApplication?.applicationNumber) {
            // Extract the number from the last application number (e.g., "SJSFI-2024-0004" -> 4)
            const lastNumber = parseInt(lastApprovedApplication.applicationNumber.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        const applicationNumber = `SJSFI-${year}-${String(nextNumber).padStart(4, '0')}`;

        // Store old application number for potential rollback
        const oldApplicationNumber = studentApplicationData.academicYearId ?
            (await prisma.studentApplication.findUnique({
                where: { id: student.id },
                select: { applicationNumber: true, status: true }
            })) : null;

        // Step 2: Upload files to Supabase (BEFORE transaction, using generated application number)
        const { uploadRequirementFile, deleteRequirementFile } = await import('@/lib/supabase');
        const uploadedUrls: {
            birthCertificate: string;
            f137: string;
            f138: string;
            goodMoral: string;
            privacyForm: string;
        } = {
            birthCertificate: '',
            f137: '',
            f138: '',
            goodMoral: '',
            privacyForm: '',
        };

        const fileTypes: Array<keyof RequirementFiles> = [
            'birthCertificate',
            'f137',
            'f138',
            'goodMoral',
            'privacyForm',
        ];

        // Upload each file sequentially
        try {
            for (const fileType of fileTypes) {
                const file = requirementFiles[fileType];
                if (file) {
                    console.log(`Uploading ${fileType} for ${applicationNumber}...`);

                    const uploadResult = await uploadRequirementFile(
                        file,
                        applicationNumber,
                        student.fullName,
                        fileType
                    );

                    if (uploadResult.success && uploadResult.url) {
                        uploadedUrls[fileType] = uploadResult.url;
                        console.log(`${fileType} uploaded successfully`);
                    } else {
                        console.error(`Failed to upload ${fileType}:`, uploadResult.error);
                        throw new Error(`Failed to upload ${fileType}: ${uploadResult.error}`);
                    }
                }
            }
        } catch (uploadError) {
            // Clean up any uploaded files before throwing error
            console.error('File upload failed, cleaning up uploaded files...');
            for (const fileType of fileTypes) {
                if (uploadedUrls[fileType]) {
                    await deleteRequirementFile(uploadedUrls[fileType]);
                }
            }
            throw uploadError;
        }

        // Step 3: Now do ALL database operations in a transaction (if this fails, files get cleaned up)
        const result = await prisma.$transaction(async (tx) => {
            // Update student application status to APPROVED and set application number
            const studentApplication = await tx.studentApplication.update({
                where: { id: student.id },
                data: {
                    status: 'APPROVED',
                    applicationNumber: applicationNumber,
                },
            });

            // Create requirement records with uploaded file URLs
            const requirementTypes = [
                { type: 'Birth Certificate', fileUrl: uploadedUrls.birthCertificate },
                { type: 'F137', fileUrl: uploadedUrls.f137 },
                { type: 'F138', fileUrl: uploadedUrls.f138 },
                { type: 'Good Moral', fileUrl: uploadedUrls.goodMoral },
                { type: 'Privacy Form', fileUrl: uploadedUrls.privacyForm },
            ];

            for (const req of requirementTypes) {
                await tx.requirements.create({
                    data: {
                        studentApplicationId: student.id,
                        requirementType: req.type,
                        status: req.fileUrl ? 'SUBMITTED' : 'PENDING',
                        fileUrl: req.fileUrl || null,
                    },
                });
            }

            // Create User record
            const user = await tx.user.create({
                data: {
                    email: studentApplication.emailAddress,
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    firstName: studentApplication.firstName,
                    familyName: studentApplication.familyName,
                    middleName: studentApplication.middleName,
                    suffix: null,
                },
            });

            // Create Student record
            await tx.student.create({
                data: {
                    userId: user.id,
                    studentNumber: applicationNumber,
                    birthdate: studentApplication.birthdate,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            return { studentApplication, applicationNumber };
        }, {
            maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
            timeout: 20000, // Maximum time the transaction can run (20s)
        }).catch(async (txError) => {
            // If transaction fails, clean up uploaded files
            console.error('Transaction failed, cleaning up uploaded files...');
            for (const fileType of fileTypes) {
                if (uploadedUrls[fileType]) {
                    await deleteRequirementFile(uploadedUrls[fileType]);
                }
            }
            throw txError;
        });

        // Step 4: Create Clerk account (OUTSIDE transaction - needs manual cleanup if fails)
        const generatedPassword = generateSecurePassword();
        let clerkUserId: string | null = null;

        try {
            const existingUsers = await clerkClient.users.getUserList({
                emailAddress: [result.studentApplication.emailAddress],
            });

            if (existingUsers.data && existingUsers.data.length > 0) {
                console.log('Clerk user already exists:', existingUsers.data[0].id);
                clerkUserId = existingUsers.data[0].id;

                await clerkClient.users.updateUser(clerkUserId, {
                    publicMetadata: {
                        role: 'STUDENT',
                        studentNumber: result.applicationNumber,
                    },
                });
            } else {
                const clerkUser = await clerkClient.users.createUser({
                    emailAddress: [result.studentApplication.emailAddress],
                    password: generatedPassword,
                    firstName: result.studentApplication.firstName,
                    lastName: result.studentApplication.familyName,
                    publicMetadata: {
                        role: 'STUDENT',
                        studentNumber: result.applicationNumber,
                    },
                    skipPasswordRequirement: false,
                    skipPasswordChecks: false,
                });

                clerkUserId = clerkUser.id;
                console.log('Clerk user created:', clerkUserId);
            }
        } catch (clerkError) {
            console.error('Clerk user creation error:', clerkError);

            if (clerkError && typeof clerkError === 'object' && 'errors' in clerkError) {
                console.error('Clerk error details:', JSON.stringify(clerkError.errors, null, 2));
            }

            // ROLLBACK: Revert all database changes to original state
            console.log('Rolling back database changes due to Clerk error...');
            try {
                await prisma.$transaction([
                    // Delete student record
                    prisma.student.delete({
                        where: { studentNumber: result.applicationNumber }
                    }),
                    // Delete user record
                    prisma.user.delete({
                        where: { email: result.studentApplication.emailAddress }
                    }),
                    // Delete all requirements created for this application
                    prisma.requirements.deleteMany({
                        where: { studentApplicationId: student.id }
                    }),
                    // Revert application status back to original state
                    prisma.studentApplication.update({
                        where: { id: student.id },
                        data: {
                            status: oldApplicationNumber?.status || 'PENDING',
                            applicationNumber: oldApplicationNumber?.applicationNumber || null
                        },
                    }),
                ]);

                // Also clean up uploaded files
                console.log('Cleaning up uploaded files after rollback...');
                const { deleteRequirementFile } = await import('@/lib/supabase');
                for (const fileType of fileTypes) {
                    if (uploadedUrls[fileType]) {
                        await deleteRequirementFile(uploadedUrls[fileType]);
                    }
                }

                console.log('Database rollback completed successfully - all changes reverted to original state');
            } catch (rollbackError) {
                console.error('CRITICAL: Rollback failed!', rollbackError);
                console.error('Manual intervention required to clean up:');
                console.error(`- Student Number: ${result.applicationNumber}`);
                console.error(`- User Email: ${result.studentApplication.emailAddress}`);
                console.error(`- Application ID: ${student.id}`);
            }

            throw new Error(`Failed to create Clerk user: ${clerkError instanceof Error ? clerkError.message : 'Unknown error'}`);
        }

        // Step 8: Send welcome email (OUTSIDE transaction - email failure doesn't rollback)
        const emailResult = await sendWelcomeEmail(
            result.studentApplication.emailAddress,
            result.studentApplication.firstName + ' ' + result.studentApplication.familyName,
            result.applicationNumber,
            generatedPassword
        );

        if (!emailResult.success) {
            console.error('Failed to send welcome email:', emailResult.error);
            // Note: We don't rollback if email fails - the account is still valid
        }

        // Log the system action

        return {
            success: true,
            password: generatedPassword,
            emailSent: emailResult.success
        };
    } catch (error) {
        console.error('Error approving application:', error);

        let errorMessage = 'Failed to approve application. backend';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
}