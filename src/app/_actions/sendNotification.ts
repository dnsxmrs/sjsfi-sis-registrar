'use server';

import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { logSystemAction } from "@/lib/systemLogger";

interface NotificationPayload {
    studentId: string;
    studentName: string;
    email: string;
    phone?: string;
    missingRequirements: string[];
    notificationMethod: 'email' | 'sms' | 'both';
}

interface NotificationResponse {
    success: boolean;
    message: string;
    error?: string;
}

// Email notification function using Nodemailer
async function sendEmailNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    try {        // Create reusable transporter object using SMTP transport
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
                    background-color: #8B0000; 
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: bold; 
                }
                .header p { 
                    margin: 5px 0 0 0; 
                    font-size: 16px; 
                    opacity: 0.9; 
                }
                .content { 
                    padding: 30px 20px; 
                }
                .greeting { 
                    font-size: 16px; 
                    margin-bottom: 20px; 
                }
                .student-info { 
                    background-color: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #8B0000; 
                }
                .requirements { 
                    background-color: #fff3cd; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #ffc107; 
                }
                .requirements h3 { 
                    color: #856404; 
                    margin-top: 0; 
                    font-size: 18px; 
                }
                .requirements ul { 
                    margin: 10px 0; 
                    padding-left: 20px; 
                }
                .requirements li { 
                    margin: 8px 0; 
                    font-weight: 500; 
                    color: #856404; 
                }
                .instructions { 
                    background-color: #e7f3ff; 
                    padding: 20px; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                    border-left: 4px solid #0066cc; 
                }
                .instructions h3 { 
                    color: #0066cc; 
                    margin-top: 0; 
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
                    min-width: 80px; 
                    color: #495057; 
                }
                .footer { 
                    background-color: #f8f8f8; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                    color: #666; 
                    border-top: 1px solid #eee; 
                }
                .signature { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 1px solid #eee; 
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
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Saint Joseph School of Fairview Inc.</h1>
                    <p>Registrar's Office</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${payload.studentName}</strong>,</p>
                    </div>
                    
                    <p>We hope this message finds you well. We are writing to inform you about your student registration application status.</p>
                    
                    <div class="student-info">
                        <p><strong>Application ID:</strong> ${payload.studentId}</p>
                        <p><strong>Student Name:</strong> ${payload.studentName}</p>
                        <p><strong>Email:</strong> ${payload.email}</p>
                    </div>
                    
                    <p>We have reviewed your application and found that the following requirements are still missing from your submission:</p>
                    
                    <div class="requirements">
                        <h3>Missing Requirements</h3>
                        <ul>
                            ${payload.missingRequirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="instructions">
                        <h3>Next Steps</h3>
                        <p>To complete your registration, please submit the missing documents as soon as possible through any of the following methods:</p>
                        <ol>
                            <li><strong>In Person:</strong> Visit our registrar's office during business hours (8:00 AM - 5:00 PM, Monday to Friday)</li>
                            <li><strong>Email:</strong> Send scanned copies to <a href="mailto:registrar@sjsfi.edu.ph">registrar@sjsfi.edu.ph</a></li>
                            <li><strong>Online Portal:</strong> Upload documents through our student portal (if available)</li>
                        </ol>
                    </div>
                    
                    <div class="contact-info">
                        <h3>Contact Information</h3>
                        <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                        <div class="contact-item">
                            <strong>Phone:</strong> <span>(02) 8123-4567</span>
                        </div>
                        <div class="contact-item">
                            <strong>Email:</strong> <a href="mailto:registrar@sjsfi.edu.ph">registrar@sjsfi.edu.ph</a>
                        </div>
                        <div class="contact-item">
                            <strong>Office Hours:</strong> <span>Monday to Friday, 8:00 AM - 5:00 PM</span>
                        </div>
                    </div>
                    
                    <p>We appreciate your prompt attention to this matter and look forward to completing your enrollment process.</p>
                    
                    <div class="signature">
                        <p><strong>Best regards,</strong></p>
                        <p><strong>SJSFI Registrar's Office</strong><br>
                        Saint Joseph School of Fairview Inc.<br>
                        <em>Excellence in Education Since 1996</em></p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is an automated message regarding your student registration. Please do not reply directly to this email.</p>
                    <p>© ${new Date().getFullYear()} Saint Joseph School of Fairview Inc. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Plain text version for email clients that don't support HTML
        const textContent = `
Dear ${payload.studentName},

We hope this message finds you well. We are writing to inform you about your student registration application status.

Application Details:
- Application ID: ${payload.studentId}
- Student Name: ${payload.studentName}
- Email: ${payload.email}

MISSING REQUIREMENTS:
${payload.missingRequirements.map(req => `• ${req}`).join('\n')}

NEXT STEPS:
To complete your registration, please submit the missing documents through:

1. In Person: Visit our registrar's office (8:00 AM - 5:00 PM, Monday to Friday)
2. Email: Send scanned copies to registrar@sjsfi.edu.ph
3. Online Portal: Upload through our student portal (if available)

CONTACT INFORMATION:
- Phone: (02) 8123-4567
- Email: registrar@sjsfi.edu.ph
- Office Hours: Monday to Friday, 8:00 AM - 5:00 PM

We appreciate your prompt attention to this matter and look forward to completing your enrollment process.

Best regards,
SJSFI Registrar's Office
Saint Joseph School of Fairview Inc.

---
This is an automated message. Please do not reply directly to this email.
© ${new Date().getFullYear()} Saint Joseph School of Fairview Inc. All rights reserved.
        `;

        // Define mail options
        const mailOptions = {
            from: {
                name: 'SJSFI Registrar Office',
                address: process.env.GMAIL_USER || 'registrar@sjsfi.edu.ph'
            },
            to: payload.email,
            subject: `SJSFI Registration - Missing Requirements (Application ID: ${payload.studentId})`,
            text: textContent,
            html: htmlContent,
            // Optional: Add high priority
            priority: 'normal' as const,
            // Optional: Request delivery receipt
            headers: {
                'X-Priority': '3',
                'X-MSMail-Priority': 'Normal',
                'X-Mailer': 'SJSFI Registration System'
            }
        };

        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

        return { success: true };

    } catch (error) {
        console.error('Email sending failed:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to send email notification';

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

// SMS notification function
async function sendSMSNotification(payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    try {
        if (!payload.phone) {
            return { success: false, error: 'Phone number not provided' };
        }

        const smsContent = `SJSFI Registration Update: Hi ${payload.studentName}, your application (${payload.studentId}) is missing: ${payload.missingRequirements.join(', ')}. Please submit these documents to complete your registration. Contact: registrar@sjsfi.edu.ph`;

        // For now, we'll simulate SMS sending
        // In production, you would integrate with services like:
        // - Twilio
        // - AWS SNS
        // - Nexmo/Vonage
        // - Semaphore (for Philippines)

        console.log('SMS would be sent to:', payload.phone);
        console.log('SMS content:', smsContent);

        // Simulate SMS sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true };
    } catch (error) {
        console.error('SMS sending failed:', error);
        return { success: false, error: 'Failed to send SMS notification' };
    }
}


// Main notification function
export async function sendMissingRequirementsNotification(payload: NotificationPayload): Promise<NotificationResponse> {
    let logStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let logError: string | undefined = undefined;
    const logMethod = payload.notificationMethod;
    const logDetails: {
        email?: { success: boolean; error?: string };
        sms?: { success: boolean; error?: string };
    } = {};
    try {
        let emailResult: { success: boolean; error?: string } = { success: true };
        let smsResult: { success: boolean; error?: string } = { success: true };
        const results: string[] = [];

        // Send email notification
        if (payload.notificationMethod === 'email' || payload.notificationMethod === 'both') {
            emailResult = await sendEmailNotification(payload); 
            if (emailResult.success) {
                results.push('Email sent successfully');
            } else {
                results.push(`Email failed: ${emailResult.error || 'Unknown error'}`);
                logStatus = 'FAILED';
                logError = emailResult.error || 'Unknown error';
            }
            logDetails.email = emailResult;
        }

        // Send SMS notification
        if (payload.notificationMethod === 'sms' || payload.notificationMethod === 'both') {
            smsResult = await sendSMSNotification(payload);
            if (smsResult.success) {
                results.push('SMS sent successfully');
            } else {
                results.push(`SMS failed: ${smsResult.error || 'Unknown error'}`);
                logStatus = 'FAILED';
                logError = smsResult.error || 'Unknown error';
            }
            logDetails.sms = smsResult;
        }

        const overallSuccess = emailResult.success && smsResult.success;

        // System log for notification attempt
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'CREATE',
            actionDescription: `Send missing requirements notification via ${logMethod}`,
            targetType: 'STUDENT',
            targetId: payload.studentId,
            targetName: payload.studentName,
            status: logStatus,
            errorMessage: logError,
            severityLevel: logStatus === 'SUCCESS' ? 'LOW' : 'MEDIUM',
            metadata: {
                email: payload.email,
                phone: payload.phone ?? null,
                missingRequirements: payload.missingRequirements,
                notificationMethod: payload.notificationMethod,
                details: logDetails
            }
        });

        return {
            success: overallSuccess,
            message: results.join(', '),
            error: overallSuccess ? undefined : 'Some notifications failed to send'
        };

    } catch (error) {
        console.error('Notification sending failed:', error);
        logStatus = 'FAILED';
        logError = error instanceof Error ? error.message : 'Unknown error';
        await logSystemAction({
            actionCategory: 'SYSTEM',
            actionType: 'CREATE',
            actionDescription: `Send missing requirements notification via ${logMethod}`,
            targetType: 'STUDENT',
            targetId: payload.studentId,
            targetName: payload.studentName,
            status: 'FAILED',
            errorMessage: logError,
            severityLevel: 'MEDIUM',
            metadata: {
                email: payload.email,
                phone: payload.phone ?? null,
                missingRequirements: payload.missingRequirements,
                notificationMethod: payload.notificationMethod
            }
        });
        return {
            success: false,
            message: 'Failed to send notifications',
            error: logError
        };
    } finally {
        await prisma.$disconnect();
    }
}

// Helper function to get missing requirements
export async function getMissingRequirements(requirements: { [key: string]: boolean }): Promise<string[]> {
    const requirementLabels: { [key: string]: string } = {
        birthCertificate: 'Birth Certificate',
        f137: 'Form 137',
        f138: 'Form 138',
        goodMoral: 'Certificate of Good Moral Character',
        privacyForm: 'Privacy Form',
    };
    return Object.entries(requirements)
        .filter(([, isSubmitted]) => !isSubmitted)
        .map(([key]) => requirementLabels[key] || key);
}
