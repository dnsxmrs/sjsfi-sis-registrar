// src/app/not-found.tsx
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftFromLineIcon } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen w-screen bg-white px-4 text-center">
            <div className="flex flex-col items-center max-w-xl">
                <Image
                    src="/assets/sjsfi_logo.svg"
                    alt="SJSFI Logo"
                    width={100}
                    height={100}
                    className="mb-4"
                />
                <h2 className="text-2xl font-semibold text-[#800000] mb-2">
                    404 - Page Not Found
                </h2>
                <p className="text-sm text-black mb-6">
                    The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                </p>
                <Link
                    href="/"
                    className="bg-[#800000] text-white hover:bg-[#DAA520] transition-colors px-6 py-2 rounded-md font-medium flex items-center justify-center"
                >
                    <ArrowLeftFromLineIcon className="w-4 h-4 mr-2" />
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
