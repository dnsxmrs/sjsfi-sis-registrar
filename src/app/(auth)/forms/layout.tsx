import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

const USER_BUTTON_CONFIG = {
    appearance: {
        elements: {
            userPreview: { display: "none" },
            userButtonPopoverFooter: { display: "none" },
            userPreviewAvatarBox: { display: "none" },
        },
    },
    userProfileProps: {
        appearance: {
            elements: {
                profileSectionPrimaryButton__profile: { display: "none" },
                profileSection__connectedAccounts: { display: "none" },
                profileSectionPrimaryButton__emailAddresses: { display: "none" },
                profileSection__danger: { display: "none" },
                menuButtonEllipsis: { display: "none" },
                profileSectionPrimaryButton__password: { display: "none" },
            },
        },
    },
} as const;

export default function AdminHomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-4">
                    {/* Desktop and Tablet Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <Image
                                src="/assets/sjsfi_logo.svg"
                                alt="SJSFI Logo"
                                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
                                width={64}
                                height={64}
                                priority
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                                <h1 className="text-red-800 font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-wider leading-tight">
                                    SAINT JOSEPH SCHOOL OF FAIRVIEW INC.
                                </h1>
                                <p className="text-red-800 font-bold text-xs md:text-sm tracking-wider leading-tight">
                                    Atherton St. cor. Pound St. Ph.8 North Fairview, Q.C,
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4 flex items-center space-x-3">
                            <p className="text-red-800 font-bold text-xs md:text-sm tracking-wider">
                                Tel. No. 461-3272 | 461-3346
                            </p>
                            <UserButton {...USER_BUTTON_CONFIG} />
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                            <div className="flex items-center space-x-2 flex-1">
                                <Image
                                    src="/assets/sjsfi_logo.svg"
                                    alt="SJSFI Logo"
                                    className="h-8 w-8"
                                    width={32}
                                    height={32}
                                    priority
                                />
                                <h1 className="text-red-800 font-bold text-xs tracking-wider leading-tight">
                                    SAINT JOSEPH SCHOOL OF FAIRVIEW INC.
                                </h1>
                            </div>
                            <UserButton {...USER_BUTTON_CONFIG} />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-red-800 font-bold text-xs tracking-wider">
                                Atherton St. cor. Pound St. Ph.8 North Fairview, Q.C,
                            </p>
                            <p className="text-red-800 font-bold text-xs tracking-wider">
                                Tel. No. 461-3272 | 461-3346
                            </p>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}