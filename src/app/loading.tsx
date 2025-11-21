// src/app/loading.tsx
import Image from 'next/image';

export default function Loading() {
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
            <h2 className="text-2xl font-semibold text-[#800000] mb-2">
                Loading...
            </h2>
            <p className="text-sm text-black mb-6">
                Please wait while we prepare your portal.
            </p>

            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-[#DAA520] border-t-[#800000] rounded-full animate-spin" />
        </div>
    );
}
