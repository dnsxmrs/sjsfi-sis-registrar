import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimiter } from '@/lib/limiter';
import { getServerIp } from '@/lib/ip';
import { z } from 'zod';
import crypto from 'crypto';

const SHARED_SECRET = process.env.SJSFI_SHARED_SECRET || '';
const VALID_API_KEYS = {
    // 'sis': process.env.SJSFI_SIS_API_KEY,
    'lms': process.env.SJSFI_LMS_API_KEY,
    'hrms': process.env.SJSFI_HRMS_API_KEY // don't use self apikey
}

const schema = z.object({
    scheduleId: z.number(),
    teacher: z.object({
        teacherId: z.string(),
        teacherName: z.string(),
        teacherEmail: z.string().email(),
    }),
});

function verifySignature(body: string, timestamp: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', SHARED_SECRET);
    hmac.update(body + timestamp);
    const digest = hmac.digest('hex');
    console.log('[verifySignature] Computed digest:', digest);

    // Use constant-time comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(digest, 'hex'),
            Buffer.from(signature, 'hex')
        );
    } catch {
        // If buffers are different lengths, timingSafeEqual throws
        return false;
    }
}

export async function POST(request: NextRequest) {
    console.log('POST /api/hrms/assign-teacher called');

    // Enforce HTTPS in production
    if (process.env.NODE_ENV === 'production') {
        const proto = request.headers.get('x-forwarded-proto');
        if (proto !== 'https') {
            console.warn('HTTPS required in production');
            return Response.json({ error: 'HTTPS required' }, { status: 403 });
        }
    }

    const userIP = getServerIp(request);
    console.log('Client IP:', userIP);

    try {
        await rateLimiter.consume(userIP, 1);
    } catch {
        console.warn('Rate limit exceeded for:', userIP);
        return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

    const auth = request.headers.get('authorization') || '';
    const apiKey = auth.split(' ')[1];
    console.log('Received API key:', apiKey ? '[REDACTED]' : 'None');

    // Use constant-time comparison for API key validation
    if (!apiKey) {
        console.warn('Missing API key');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let validKey = false;
    for (const key of Object.values(VALID_API_KEYS)) {
        if (key && apiKey.length === key.length) {
            try {
                if (crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(key))) {
                    validKey = true;
                    break;
                }
            } catch {
                // Continue to next key if comparison fails
                continue;
            }
        }
    }

    if (!validKey) {
        console.warn('Invalid API key');
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timestamp = request.headers.get('x-timestamp') || '';
    const signature = request.headers.get('x-signature') || '';
    const now = Date.now();
    const tsInt = parseInt(timestamp, 10);

    console.log('Timestamp:', timestamp);
    console.log('Signature:', signature ? '[REDACTED]' : 'None');
    console.log('All headers:', Object.fromEntries(request.headers.entries()));

    if (!timestamp || !signature || isNaN(tsInt) || Math.abs(now - tsInt) > 5 * 60 * 1000) {
        console.warn('Invalid timestamp or signature window.');
        console.log('Debug - timestamp empty?', !timestamp, 'signature empty?', !signature, 'tsInt:', tsInt, 'time diff:', Math.abs(now - tsInt));
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    if (!verifySignature(rawBody, timestamp, signature)) {
        console.warn('Signature verification failed');
        return Response.json({ error: 'Invalid request' }, { status: 403 });
    }

    let scheduleId: number;
    let teacher: { teacherId: string; teacherName: string; teacherEmail: string };

    try {
        const parsed = schema.parse(JSON.parse(rawBody));
        scheduleId = parsed.scheduleId;
        teacher = parsed.teacher;
        console.log('Parsed data - Schedule ID:', scheduleId);
        console.log('Teacher info:', teacher.teacherName, teacher.teacherEmail);
    } catch (err) {
        console.error('Zod validation failed:', err);
        return Response.json({
            success: false,
            error: 'Invalid request data',
            details: err instanceof Error ? err.message : 'Validation failed'
        }, { status: 400 });
    }

    try {
        console.log(`Assigning teacher to schedule ID: ${scheduleId}`);

        // Check if schedule exists and is not deleted
        const existingSchedule = await prisma.schedule.findFirst({
            where: {
                id: scheduleId,
                deletedAt: null,
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                        termYearLevel: {
                            include: {
                                academicTerm: true,
                                yearLevel: true,
                            },
                        },
                    },
                },
                section: true,
            },
        });

        if (!existingSchedule) {
            console.warn(`Schedule not found: ${scheduleId}`);
            return Response.json({
                success: false,
                error: 'Schedule not found',
            }, { status: 404 });
        }

        // Log if replacing existing teacher assignment
        if (existingSchedule.teacherId) {
            console.log(`Schedule ${scheduleId} already has teacher ${existingSchedule.teacherName}, replacing with ${teacher.teacherName}`);
        }

        // Update the schedule with teacher information
        const updatedSchedule = await prisma.schedule.update({
            where: {
                id: scheduleId,
            },
            data: {
                teacherId: teacher.teacherId,
                teacherName: teacher.teacherName,
                teacherEmail: teacher.teacherEmail,
            },
            include: {
                termSubject: {
                    include: {
                        subject: true,
                        termYearLevel: {
                            include: {
                                academicTerm: true,
                                yearLevel: true,
                            },
                        },
                    },
                },
                section: true,
            },
        });

        console.log(`✅ Successfully assigned teacher ${teacher.teacherName} to schedule ${scheduleId}`);

        // Format successful response
        const response = {
            success: true,
            message: existingSchedule.teacherId
                ? 'Teacher assignment updated successfully'
                : 'Teacher assigned successfully',
            data: {
                scheduleId: updatedSchedule.id,
                subject: {
                    id: updatedSchedule.termSubject.subject.id,
                    name: updatedSchedule.termSubject.subject.name,
                    code: updatedSchedule.termSubject.subject.code,
                },
                term: {
                    id: updatedSchedule.termSubject.termYearLevel.academicTerm.id,
                    name: updatedSchedule.termSubject.termYearLevel.academicTerm.year,
                },
                yearLevel: {
                    id: updatedSchedule.termSubject.termYearLevel.yearLevel.id,
                    name: updatedSchedule.termSubject.termYearLevel.yearLevel.name,
                },
                section: updatedSchedule.section ? {
                    id: updatedSchedule.section.id,
                    name: updatedSchedule.section.name,
                    capacity: updatedSchedule.section.capacity,
                } : null,
                schedule: {
                    day: updatedSchedule.day,
                    startTime: updatedSchedule.startTime,
                    endTime: updatedSchedule.endTime,
                    room: updatedSchedule.room,
                },
                teacher: {
                    assigned: true,
                    teacherId: updatedSchedule.teacherId,
                    teacherName: updatedSchedule.teacherName,
                    teacherEmail: updatedSchedule.teacherEmail,
                },
                metadata: {
                    updatedAt: updatedSchedule.updatedAt,
                },
            },
        };

        return Response.json(response, { status: 200 });

    } catch (err) {
        console.error('Database error:', err);
        return Response.json({
            success: false,
            error: 'Server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}