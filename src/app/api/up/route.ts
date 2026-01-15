// A GET request to check database status and keep the database connection alive
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // simple query to check database connection
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ message: 'Database connection is healthy' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Database connection failed', error: errorMessage }, { status: 500 });
    }
}