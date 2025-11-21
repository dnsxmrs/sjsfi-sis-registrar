'use client'

import { useEffect, useState } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface SignOutHandlerProps {
    redirectUrl?: string
    onSignOutComplete?: () => void
}

export default function SignOutHandler({
    redirectUrl = '/',
    onSignOutComplete
}: SignOutHandlerProps) {
    const { signOut } = useClerk()
    const { isLoaded, isSignedIn } = useUser()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const performSignOut = async () => {
            // Wait for Clerk to load
            if (!isLoaded) return

            // If already signed out, redirect immediately
            if (!isSignedIn) {
                window.location.href = redirectUrl
                return
            }

            // Prevent multiple sign-out attempts
            if (isSigningOut) return

            setIsSigningOut(true)

            try {
                await signOut({ redirectUrl })
                onSignOutComplete?.()
            } catch {
                setError('Failed to sign out. Redirecting...')

                // Fallback: Force redirect after a short delay
                setTimeout(() => {
                    window.location.href = redirectUrl
                }, 2000)
            }
        }

        performSignOut()
    }, [isLoaded, isSignedIn, isSigningOut, redirectUrl, signOut, onSignOutComplete])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen bg-white text-center">
                {/* Logo */}
                <Image
                    src="/assets/sjsfi_logo.svg"
                    alt="SJSFI Logo"
                    width={90}
                    height={90}
                    className="mb-6"
                />

                {/* Error Icon */}
                <div className="text-red-600 text-4xl mb-4">⚠️</div>

                {/* Error Text */}
                <h2 className="text-2xl text-[#800000] font-semibold mb-2">
                    Error
                </h2>
                <p className="text-sm text-red-600 mb-4">
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-white text-center">
            {/* Logo */}
            <Image
                src="/assets/sjsfi_logo.svg"
                alt="SJSFI Logo"
                width={90}
                height={90}
                className="mb-6 animate-pulse"
            />

            {/* Loading Text */}
            <h2 className="text-2xl text-[#800000] font-semibold mb-2">
                Signing you out...
            </h2>
            <p className="text-sm text-black mb-4">
                Please wait while we securely log you out
            </p>            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-[#DAA520] border-t-[#800000] rounded-full animate-spin" />
        </div>
    )
}
