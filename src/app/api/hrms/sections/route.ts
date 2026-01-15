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
    data: z.string()
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
    console.log('POST /api/hrms/sections called');

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

    let data: string;
    try {
        const parsed = schema.parse(JSON.parse(rawBody));
        data = parsed.data;
        console.log('Parsed data:', data);
    } catch (err) {
        console.error('Zod validation failed:', err);
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!data) {
        console.warn('data not present after parsing.');
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        console.log('Fetching all sections from database...');
        
        // Fetch all sections with their academic term, year level, and adviser
        const sections = await prisma.section.findMany({
            where: {
                deletedAt: null, // Only active sections
            },
            include: {
                termYearLevel: {
                    include: {
                        academicTerm: true,
                        yearLevel: true,
                    },
                },
            },
            orderBy: {
                id: 'desc', // Order by ID descending (newest first)
            },
        });

        console.log(`Found ${sections.length} sections`);

        // Format the response
         
        const formattedSections = sections.map((section: any) => ({
            sectionId: section.id,
            section: {
                name: section.name,
                capacity: section.capacity,
                currentStudents: section.currentStudents,
            },
            term: {
                id: section.termYearLevel.academicTerm.id,
                name: section.termYearLevel.academicTerm.year,
                status: section.termYearLevel.academicTerm.status,
            },
            yearLevel: {
                id: section.termYearLevel.yearLevel.id,
                name: section.termYearLevel.yearLevel.name,
            },
            adviser: section.advisorFacultyId ? {
                facultyId: section.advisorFacultyId,
                employeeId: section.advisorEmployeeId,
                firstName: section.advisorFirstName,
                lastName: section.advisorLastName,
                email: section.advisorEmail,
                fullName: `${section.advisorFirstName || ''} ${section.advisorLastName || ''}`.trim(),
            } : null,
            metadata: {
                createdAt: section.createdAt,
                updatedAt: section.updatedAt,
            },
        }));

        const response = {
            success: true,
            message: 'All sections retrieved successfully',
            total: formattedSections.length,
            data: formattedSections,
        };

        return Response.json(response, { status: 200 });

    } catch (err) {
        console.error('Database error:', err);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}
