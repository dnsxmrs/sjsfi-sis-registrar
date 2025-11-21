import { NextResponse } from "next/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
    try {
        // Check environment variables
        const hasSecretKey = !!process.env.CLERK_SECRET_KEY;
        if (!hasSecretKey) {
            return NextResponse.json({
                success: false,
                error: "An internal error occurred. Please contact SJSFI Administration."
            }, { status: 500 });
        }

        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            await logErrorWithRequestContext(parseError, request, "Failed to parse request body");
            return NextResponse.json({
                success: false,
                error: "Invalid request format. Please try again."
            }, { status: 400 });
        }

        const { role } = body;

        // Validate role input
        if (!role || typeof role !== 'string') {
            return NextResponse.json({
                success: false,
                error: "Role is required and must be a string"
            }, { status: 400 });
        }

        // Define allowed roles
        const allowedRoles = ['registrar', 'admin'];
        const normalizedRole = role.toLowerCase().trim();
        if (!allowedRoles.includes(normalizedRole)) {
            return NextResponse.json({
                success: false,
                error: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
            }, { status: 400 });
        }

        // Get current user
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({
                success: false,
                error: "No authenticated user found"
            }, { status: 401 });
        }

        // Initialize Clerk client and update user metadata
        try {
            const client = await clerkClient();
            const currentUserData = await client.users.getUser(user.id);
            const existingPrivateMetadata = currentUserData.privateMetadata || {};

            // Normalize existing roles to an array
            const existingRoles = Array.isArray(existingPrivateMetadata.roles)
                ? existingPrivateMetadata.roles
                : existingPrivateMetadata.roles
                    ? [existingPrivateMetadata.roles]
                    : [];

            let newRoles = [...existingRoles];

            // Role logic:
            // - If registrar: only registrar
            // - If forms: both registrar and forms
            if (normalizedRole === "registrar") {
                newRoles = ["registrar"];
            } else if (normalizedRole === "admin") {
                newRoles = ["registrar", "admin"];
            }

            await client.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    ...existingPrivateMetadata,
                    roles: newRoles,
                    roleSetAt: new Date().toISOString(),
                    roleSetBy: "system"
                }
            });

            const updatedUser = await client.users.getUser(user.id);
            const updatedSuccessfully = Array.isArray(updatedUser.privateMetadata?.roles)
                && updatedUser.privateMetadata.roles.includes(normalizedRole);

            return NextResponse.json({
                success: true,
                data: {
                    userId: user.id,
                    roles: updatedUser.privateMetadata.roles,
                    roleSetAt: updatedUser.privateMetadata?.roleSetAt,
                    updateVerified: updatedSuccessfully,
                    privateMetadata: updatedUser.privateMetadata
                }
            });
        } catch (clerkError) {
            await logErrorWithRequestContext(clerkError, request, "Clerk client or update error");
            if (clerkError instanceof Error) {
                const errorMessage = clerkError.message;
                if (errorMessage.includes('User not found')) {
                    return NextResponse.json({
                        success: false,
                        error: "User not found in authentication system"
                    }, { status: 404 });
                }
                if (errorMessage.includes('Unauthorized') || errorMessage.includes('Permission')) {
                    return NextResponse.json({
                        success: false,
                        error: "Insufficient permissions to update user role"
                    }, { status: 403 });
                }
                if (errorMessage.includes('Rate limit')) {
                    return NextResponse.json({
                        success: false,
                        error: "Too many requests. Please try again later"
                    }, { status: 429 });
                }
            }
            return NextResponse.json({
                success: false,
                error: "An error occurred while updating user role. Please try again later."
            }, { status: 500 });
        }
    } catch (error) {
        await logErrorWithRequestContext(error, request, "Unexpected error in POST /api/auth/set-role");
        return NextResponse.json({
            success: false,
            error: "An unexpected error occurred. Please try again later."
        }, { status: 500 });
    }
}

// Helper to log error with stack and request context
async function logErrorWithRequestContext(error: unknown, request: Request, context: string) {
    let requestInfo: Record<string, unknown> = {};
    try {
        requestInfo = {
            method: request.method,
            url: request.url,
            headers: Object.fromEntries(request.headers.entries()),
            body: undefined
        };
        // Try to clone and parse the body if possible (only for debugging, not for response)
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const clone = request.clone();
            try {
                requestInfo.body = await clone.text();
            } catch { }
        }
    } catch { }
    console.error(`❌ [${context}]`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        request: requestInfo
    });
}