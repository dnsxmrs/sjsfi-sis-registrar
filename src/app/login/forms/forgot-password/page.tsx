'use client';

import InputField from '@/app/login/components/InputField';
import LoginFooter from '@/app/login/components/LoginFooter';
import { facultyEmailExists } from '../../actions/handleFacultyLogin';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import type { SignInResource } from '@clerk/types'

interface SetRoleResult {
    success: boolean;
    error?: string;
}

// Extend Window interface for signInAttempt storage
declare global {
    interface Window {
        signInAttempt?: SignInResource;
    }
}

export default function FacultyForgotPassword() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [successfulCreation, setSuccessfulCreation] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const { isSignedIn } = useAuth()
    const { isLoaded, signIn, setActive } = useSignIn()

    useEffect(() => {
        if (isSignedIn) {
            router.push('/forms/home')
        }
    }, [isSignedIn, router])

    if (!isLoaded) {
        return null
    }

    const create = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("");
        setIsLoading(true);

        if (!email) {
            setError('Please enter your email address.')
            setIsLoading(false);
            return
        }

        try {
            // check if email exists in faculty db
            const facultyCheck = await facultyEmailExists(
                email,
                "registrar" // Changed from "faculty" to "registrar" for registrar login
            );

            if (!facultyCheck.success) {
                setError(facultyCheck.error || "Invalid email.");
                setIsLoading(false);
                return;
            }

            const signInAttempt = await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });            // Store signInAttempt in state for use in reset
            window.signInAttempt = signInAttempt;
            setSuccessfulCreation(true)
            toast.success('Reset code sent to your email address.')
        } catch {
            setError('Failed to send reset code.')
        } finally {
            setIsLoading(false);
        }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("");
        setIsLoading(true);

        if (!code || !password) {
            setError('Please enter both the reset code and new password.')
            setIsLoading(false);
            return
        }

        try {
            const signInAttempt = window.signInAttempt;
            if (!signInAttempt) {
                setError('No reset attempt found. Please request a reset code again.');
                setIsLoading(false);
                return;
            }
            const result = await signInAttempt.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: result.createdSessionId })

                // Wait longer for Clerk session to be fully established
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const response = await fetch('/api/auth/set-role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        role: 'registrar'
                    })
                });

                let setRoleResult: SetRoleResult = { success: false };
                try {
                    setRoleResult = await response.json();
                } catch {
                    setError("Failed to parse server response. Please try again.");
                    setIsLoading(false);
                    return;
                } if (!response.ok || !setRoleResult.success) {
                    setError(setRoleResult.error || "Failed to set user role. Please try again.");
                    setIsLoading(false);
                    return;
                }

                // Wait a short moment to ensure Clerk metadata is updated before redirect
                await new Promise((resolve) => setTimeout(resolve, 500));

                toast.success('Password reset successfully, logging in...')
                router.push('/registrar/home')
                return;
            }
        } catch {
            setError('Failed to reset password.')
        } finally {
            setIsLoading(false);
        }
    };

    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="flex h-screen w-screen bg-white min-w-[360px]">
            <div className="container">
                {/* Main Screen - BG IMAGE */}
                <div
                    style={{ backgroundImage: "url('/assets/sis_bg.webp')" }}
                    className=" h-screen w-screen bg-cover bg-center"
                >
                    {/* LOGIN FORM BG */}
                    <div className="absolute right-0 w-full md:w-1/3 min-h-screen min-w-[360px] pt-[10vh] overflow-hidden bg-white/70 backdrop-blur-[20px] backdrop-saturate-[168%] shadow-md m-0 rounded-none flex flex-col bg-clip-border border border-transparent break-words mb-4">

                        {/* WRAPPER */}
                        <div className="flex flex-col items-center h-full w-full">

                            {/* HEADER */}
                            <div className="flex flex-col items-center justify-center w-full mb-4">
                                <Image
                                    src="/assets/sjsfi_logo.svg"
                                    alt="SJSFI Logo"
                                    width={90}
                                    height={90}
                                    className="mb-2"
                                />
                                <h1 className="text-3xl text-center text-[#000] w-full mb-1 mx-1">
                                    <span className='font-bold text-[#800000]'>SJSFI-SIS </span>Forms Module
                                </h1>
                                <h3 className="text-2xl text-center text-[#800000] w-full mb-2 mx-1">
                                    Forgot Password
                                </h3>
                            </div>

                            {/* BODY */}
                            <div className="flex flex-col items-center justify-center w-full">
                                {!successfulCreation && (
                                    <p className='text-center text-black text-sm mb-4 mx-1'>
                                        Can&apos;t remember your password? You can request a reset code below.
                                    </p>
                                )}

                                {successfulCreation && (
                                    <p className='text-center text-black text-sm mb-4 mx-1'>
                                        We&apos;ve sent a reset code to your email. Enter the code and your new password below.
                                    </p>
                                )}

                                {/* FORM */}
                                <form className="w-full px-4" autoComplete="off" onSubmit={!successfulCreation ? create : reset}>
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

                                    {!successfulCreation && (
                                        <>
                                            <div className="mb-4 w-full">
                                                <InputField
                                                    name="email"
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="bg-[#800000] text-white text-sm rounded-sm px-4 py-2 w-full flex items-center justify-center hover:bg-[#600000] transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading && <LoadingSpinner />}
                                                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {successfulCreation && (
                                        <>
                                            <div className="mb-4 w-full">
                                                <InputField
                                                    name="code"
                                                    type="text"
                                                    placeholder="Reset Code"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <InputField
                                                    name="password"
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="bg-[#800000] text-white text-sm rounded-sm px-4 py-2 w-full flex items-center justify-center hover:bg-[#600000] transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading && <LoadingSpinner />}
                                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    <div className="mb-4 w-full">
                                        <Link href="/auth/forms" className="w-full inline-block">
                                            <span
                                                className={`bg-[#fff] text-[#800000] text-sm rounded-sm px-4 py-2 w-full block text-center transition duration-200 ease-in-out ${isLoading
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-[#fff]/80'
                                                    }`}
                                            >
                                                Back to Login
                                            </span>
                                        </Link>
                                    </div>
                                    <LoginFooter />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}