import { headers } from 'next/headers';

export async function getClientIp() {
    const headersList = await headers();

    const ip =
        headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
        headersList.get('x-real-ip') ||
        '127.0.0.1'; // Default to localhost if no IP is found

    return ip;
}

// Server-side function: extracts IP from NextRequest headers
export function getServerIp(request: { headers: { get: (key: string) => string | null } }): string {
    try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }

        const realIp = request.headers.get('x-real-ip');
        if (realIp) {
            return realIp;
        }

        return request.headers.get('x-client-ip') ||
            request.headers.get('cf-connecting-ip') ||
            'unknown';
    } catch (error) {
        console.error('Failed to get server IP:', error);
        return 'unknown';
    }
}