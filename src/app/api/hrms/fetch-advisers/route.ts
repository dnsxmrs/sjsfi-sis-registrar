
export async function fetchAdviser(){
    try {
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

        const timestamp = Date.now().toString();

        const rawBody = ''

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
        // api/xr/section-assignments?gradeLevel=7&schoolYear=2024-2025
        const upstreamUrl = `${baseUrl}/api/xr/section-assignments`;

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
