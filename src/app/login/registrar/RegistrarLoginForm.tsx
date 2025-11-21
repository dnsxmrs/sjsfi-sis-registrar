"use client";

import { facultyEmailExists } from "../actions/handleFacultyLogin";
import InputField from "@/app/login/components/InputField";
import LoginFooter from "@/app/login/components/LoginFooter";
import ActionButton from "@/app/login/components/ActionButton";
import Link from "next/link";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SetRoleResult {
    success: boolean;
    error?: string;
}

export default function RegistrarLoginForm() {
    const [email_address, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false); const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        // Prevent default form submission behavior
        e.preventDefault();
        // Reset error state and set loading state
        setError("");
        setIsLoading(true);

        if (!isLoaded) return;

        try {

            if (!email_address || !password) {
                setError("Please fill in all fields");
                return;
            }

            // STEP 1: Start sign-in by identifying the user
            const signInAttempt = await signIn.create({
                identifier: email_address,
            });

            // STEP 2: Check if the user exists with registrar access
            const facultyCheck = await facultyEmailExists(
                email_address,
                "registrar" // Changed from "faculty" to "registrar" for registrar login
            );

            if (!facultyCheck.success) {
                setError(
                    facultyCheck.error
                        ? facultyCheck.error
                        : "Invalid credentials."
                );
                return;
            }

            const role = facultyCheck.role

            // STEP 3: Now try to complete with password
            const result = await signInAttempt.attemptFirstFactor({
                strategy: "password",
                password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: result.createdSessionId });

                // Frontend call to set role in Clerk metadata
                const response = await fetch('/api/auth/set-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        role: role
                    })
                });

                let setRoleResult: SetRoleResult = { success: false };
                try {
                    setRoleResult = await response.json();
                } catch {
                    setError("Failed to parse server response. Please try again.");
                    return;
                }

                if (!response.ok || !setRoleResult.success) {
                    setError(setRoleResult.error || "Failed to set user role. Please try again.");
                    return;
                }

                router.push(`/registrar/home`);
            } else {
                setError("Invalid credentials.");
            }
        } catch (err: unknown) {
            if (err && typeof err === "object" && "message" in err) {
                setError((err as Error).message || "Login failed");
            } else {
                setError("Login failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            className="w-full px-4"
            autoComplete="off"
            onSubmit={handleSubmit}
        >
            {error && (
                <div className="mb-4 w-full bg-amber-50 border border-amber-200 rounded-md p-3 sm:p-4">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-amber-800 text-sm sm:text-base font-medium leading-relaxed">
                            {error}
                        </p>
                    </div>
                </div>
            )}
            <div className="mb-4 w-full">
                <InputField
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={email_address}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="mb-4 w-full">
                <InputField
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="mb-4 w-full">
                <ActionButton
                    label="Sign In"
                    isLoading={isLoading}
                    loadingText="Signing In..."
                />
            </div>
            <div className="flex items-center justify-center mb-4 w-full">
                {/* <p className="text-sm text-black text-center italic">
                    <span className="text-[#800000]">Forgot your password?</span> Contact the system administrator for assistance.
                </p> */}
                <Link
                    href="/login/registrar/forgot-password"
                    className="font-medium text-sm text-[#800000] hover:underline hover:text-[#800000]/80 transition duration-200 ease-in-out"
                >
                    I forgot my password
                </Link>
            </div>
            <LoginFooter />
        </form>
    );
}