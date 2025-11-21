// components/TermsNotice.tsx
import Link from 'next/link';

export default function LoginFooter() {
    return (
        <div className="flex items-center justify-center mb-4 w-full">
            <p className="text-xs md:text-sm text-black text-center leading-relaxed">
                By using this service, you understood and agree to the
                <span className="font-semibold text-[#800000]"> SJSFI Online Services </span>
                <Link
                    href="https://sjsfi.vercel.app/privacy-policy"
                    target='_blank'
                    className="text-[#800000] hover:text-[#A00000] transition duration-200 ease-in-out underline font-medium"
                >
                    Privacy Policy
                </Link>
                ,{' '}
                <Link
                    href="https://sjsfi.vercel.app/terms-of-service"
                    target='_blank'
                    className="text-[#800000] hover:text-[#A00000] transition duration-200 ease-in-out underline font-medium"
                >
                    Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                    href="https://sjsfi.vercel.app/data-privacy"
                    target='_blank'
                    className="text-[#800000] hover:text-[#A00000] transition duration-200 ease-in-out underline font-medium"
                >
                    Data Privacy Notice
                </Link>
            </p>
        </div>
    );
}
