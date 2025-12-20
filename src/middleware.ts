import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Helper: Check if user has permission for the route based on roles.
 * Supports both string (legacy) and array (new) role structures.
 */
function checkRoleForRoute(pathname: string, userRoles: string[] | string): boolean {
    const roles = Array.isArray(userRoles)
        ? userRoles.map(r => r.toLowerCase())
        : [String(userRoles).toLowerCase()];

    if (pathname.startsWith("/forms/")) {
        // admin can access forms and registrar routes
        return roles.includes("admin");
    }

    if (pathname.startsWith("/registrar/")) {
        // registrar can access registrar routes only
        return roles.includes("registrar");
    }

    return false;
}

/**
 * Helper: Get the correct home page based on user's role(s)
 */
function getRoleHomePage(userRoles: string[] | string): string {
    const roles = Array.isArray(userRoles)
        ? userRoles.map(r => r.toLowerCase())
        : [String(userRoles).toLowerCase()];

    if (roles.includes("admin")) return "/forms/home";
    if (roles.includes("registrar")) return "/registrar/home";

    return "/logout";
}

const isPublicRoute = createRouteMatcher([
    "/",
    "/login/(.*)",
    "/logout"
]);

const isProtectedRoute = createRouteMatcher([
    "/forms/(.*)",
    "/registrar/(.*)"
]);

export default clerkMiddleware(
    async (auth, req) => {
        const { userId } = await auth();
        const isAuthenticated = !!userId;
        const url = new URL(req.url);

        // Case 1: Not authenticated and accessing protected route
        if (!isAuthenticated && isProtectedRoute(req)) {
            console.log("⚠️ Unauthenticated user trying to access protected route:", url.pathname);
            await auth.protect();
            return;
        }

        // Case 2: Authenticated user accessing API routes — skip restrictions
        if (isAuthenticated && url.pathname.startsWith("/api/")) {
            console.log("✅ Authenticated user accessing API route:", url.pathname);
            return NextResponse.next();
        }

        // Case 3: Authenticated user accessing public routes (redirect to dashboard)
        if (isAuthenticated && isPublicRoute(req)) {
            if (url.pathname === "/logout") {
                return NextResponse.next();
            }

            try {
                const user = await clerkClient.users.getUser(userId);
                const userRoles = (user?.privateMetadata?.roles || user?.privateMetadata?.role) as
                    | string[]
                    | string
                    | undefined;

                if (!userRoles) {
                    console.warn("⚠️ No roles found for user, redirecting to logout");
                    return NextResponse.redirect(new URL("/logout", req.url));
                }

                const redirectUrl = getRoleHomePage(userRoles);
                console.log("🔄 Redirecting authenticated user to:", redirectUrl);
                return NextResponse.redirect(new URL(redirectUrl, req.url));
            } catch (error) {
                console.error("❌ Error checking user role:", error);
                return NextResponse.redirect(new URL("/logout", req.url));
            }
        }

        // Case 4: Authenticated user accessing protected route (role validation)
        if (isAuthenticated && isProtectedRoute(req)) {
            try {
                const user = await clerkClient.users.getUser(userId);
                const userRoles = (user?.privateMetadata?.roles || user?.privateMetadata?.role) as
                    | string[]
                    | string
                    | undefined;

                if (!userRoles) {
                    console.warn("⚠️ No roles defined for user accessing protected route");
                    return NextResponse.redirect(new URL("/logout", req.url));
                }

                const allowedForRoute = checkRoleForRoute(url.pathname, userRoles);

                if (!allowedForRoute) {
                    console.log("❌ User lacks permission for:", url.pathname, "Roles:", userRoles);
                    const correctHome = getRoleHomePage(userRoles);
                    return NextResponse.redirect(new URL(correctHome, req.url));
                }

                console.log("✅ Access granted to:", url.pathname, "Roles:", userRoles);
                return NextResponse.next();
            } catch (error) {
                console.error("❌ Error verifying roles for protected route:", error);
                return NextResponse.redirect(new URL("/logout", req.url));
            }
        }

        // Case 5: Default fallback — allow public routes
        console.log("✅ Allowing request to continue:", url.pathname);
        return NextResponse.next();
    },
    { debug: false }
);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)"
    ]
};
