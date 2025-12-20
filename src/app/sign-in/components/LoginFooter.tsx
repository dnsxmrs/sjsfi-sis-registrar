import Link from 'next/link';

export default function LoginFooter() {
    return (
        <div className="flex items-center justify-center mb-4 w-full">
            <p className="text-sm text-black text-center">
                By using this service, you understood and agree to the
                <span className="font-medium text-[#DAA520]"> SJSFI Online Services </span>
                <Link
                    href="https://sjsfi.vercel.app/privacy-policy"
                    target='_blank'
                    className="text-[#800000] hover:text-[#800000]/80 transition duration-200 ease-in-out underline"
                >
                    Privacy Policy
                </Link>,&nbsp;
                <Link
                    href="https://sjsfi.vercel.app/terms-of-service"
                    target='_blank'
                    className="text-[#800000] hover:text-[#800000]/80 transition duration-200 ease-in-out underline"
                >
                    Terms of Service
                </Link>
                &nbsp;and&nbsp;
                <Link
                    href="https://sjsfi.vercel.app/data-privacy"
                    target='_blank'
                    className="text-[#800000] hover:text-[#800000]/80 transition duration-200 ease-in-out underline"
                >
                    Data Privacy Notice
                </Link>
            </p>
        </div>
    );
}