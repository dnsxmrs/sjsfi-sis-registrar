"use server";

import { logSystemAction } from "@/lib/systemLogger";

export type FacultyResult = {
    success: boolean;
    error?: string;
    errorCode?: string;
    role?: string;
};

export type checkHrmsUserResult = {
    success: boolean;
    role?: string;
    error?: string;
    errorCode?: string;
    source?: "app" | "hrms"; // indicates if error is from local app or external HRMS
};

// Helper function to log authentication attempts
async function logAuthAttempt(
    email: string,
    origin: string,
    status: "SUCCESS" | "FAILED",
    errorMessage?: string,
    role?: string,
    severityLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW",
    additionalMetadata?: Record<string, string | null>
) {
    await logSystemAction({
        actionCategory: "AUTH",
        actionType: "SIGN-IN",
        actionDescription: `Faculty sign-in attempt from ${origin}`,
        targetType: "USER",
        targetId: email,
        targetName: email,
        status,
        errorMessage,
        severityLevel,
        metadata: {
            origin,
            role: role ?? null,
            ...additionalMetadata
        },
    });
}

export async function facultyEmailExists(
    email: string,
    origin: string
): Promise<FacultyResult> {
    try {
        // only allow requests with email and origin
        if (!email || !origin) {
            const errorMsg = "Missing email or origin";
            const errorCode = "AU01";
            await logAuthAttempt(email, origin, "FAILED", `${errorMsg} [${errorCode}]`);
            return { success: false, error: errorMsg, errorCode };
        }

        // Allow requests from 'forms' and 'registrar' origins
        const allowedOrigins = ["forms", "registrar"];

        if (!allowedOrigins.includes(origin)) {
            const errorMsg = `Invalid origin attempt: ${origin}`;
            const errorCode = "AU02";
            await logAuthAttempt(email, origin, "FAILED", `${errorMsg} [${errorCode}]`);
            return { success: false, error: "Invalid origin attempt.", errorCode };
        }

        // Step 1: Check if the user exists by looking up their role from external system
        const userResult = await checkHrmsUser(email);

        // Step 2: Handle different error scenarios
        if (!userResult.success) {
            const errorMsg = userResult.error || "User verification failed";
            const errorCode = userResult.source === "hrms" ? "AU04" : "AU03";

            await logAuthAttempt(
                email,
                origin,
                "FAILED",
                `${errorMsg} [${errorCode}]`,
                undefined,
                "LOW",
                { source: userResult.source ?? null }
            );

            if (userResult.source === "hrms") {
                return {
                    success: false,
                    error: "Unable to verify user credentials with external system",
                    errorCode: "AU04",
                };
            } else {
                return {
                    success: false,
                    error: errorMsg,
                    errorCode: "AU03",
                };
            }
        }

        // Step 3: If user exists but is not registrar or admin, return unauthorized error
        const allowedRoles = ["Registrar", "Admin"];
        if (
            !userResult.role ||
            !allowedRoles.includes(userResult.role)
        ) {
            const errorMsg = "Access denied for this role";
            await logAuthAttempt(
                email,
                origin,
                "FAILED",
                `${errorMsg} [AU05]`,
                userResult.role
            );
            return { success: false, error: errorMsg, errorCode: "AU05" };
        }

        // Step 3.5: Check if Registrar account is trying to access forms origin
        // Admin can access both forms and registrar, but Registrar can only access registrar origin
        if (userResult.role === "Registrar" && origin === "forms") {
            const errorMsg = "Registrar accounts cannot access forms origin";
            await logAuthAttempt(
                email,
                origin,
                "FAILED",
                `${errorMsg} [AU06]`,
                userResult.role,
                "MEDIUM"
            );
            return {
                success: false,
                error: "Registrar accounts can only access the registrar portal",
                errorCode: "AU06"
            };
        }

        // make role lowercase
        const normalizedRole = userResult.role.toLowerCase();

        // Step 4: If user exists and has an allowed role, return success
        await logAuthAttempt(
            email,
            origin,
            "SUCCESS",
            undefined,
            normalizedRole
        );

        return {
            success: true,
            role: normalizedRole,
        };
    } catch (error) {
        // Log the error for debugging
        const errorMsg = error instanceof Error
            ? error.message
            : "Internal server error occurred";

        await logAuthAttempt(email, origin, "FAILED", `${errorMsg} [AU07]`);

        return { success: false, error: "Internal server error occurred", errorCode: "AU07" };
    }
}

export async function checkHrmsUser(
    email: string
): Promise<checkHrmsUserResult> {
    try {
        // Step 3: Check environment variables
        const secret = process.env.SJSFI_SHARED_SECRET;
        const apiKey = process.env.SJSFI_SIS_API_KEY;
        const baseUrl = process.env.BASE_URL;

        if (!secret || !apiKey || !baseUrl) {
            return {
                success: false,
                error: "Server misconfiguration",
                errorCode: "HR02",
                source: "app",
            };
        }

        // Step 4: Import key for HMAC SHA-256
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        // Step 5: Prepare rawBody and timestamp
        const rawBody = JSON.stringify({ email });
        const timestamp = Date.now().toString();

        // Step 6: Generate HMAC signature (body + timestamp)
        const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            encoder.encode(rawBody + timestamp)
        );

        // Step 7: Convert signature to hex string
        const signature = Array.from(new Uint8Array(signatureBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        // Step 8: Make the upstream fetch request with headers
        const upstreamUrl = `${baseUrl}/api/xr/user-access-lookup`;

        const res = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "x-timestamp": timestamp,
                "x-signature": signature,
            },
            body: rawBody,
        });

        // Step 9: Read and parse upstream response body safely
        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);

            const role = data.Role[0];

            if (data.Email && data.Role) {
                // Return the role for further validation by the calling function
                return { success: true, role: role, source: "hrms" };
            } else {
                return {
                    success: false,
                    error: "User not found",
                    errorCode: "HR03",
                    source: "hrms",
                };
            }
        } catch {
            return {
                success: false,
                error: "Invalid response from external system",
                errorCode: "HR04",
                source: "hrms",
            };
        }
    } catch {
        return {
            success: false,
            error: "External system unavailable",
            errorCode: "HR05",
            source: "hrms",
        };
    }
}
