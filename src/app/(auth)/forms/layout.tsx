import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default async function AdminHomeLayout({ children }: { children: React.ReactNode }) {
  // delay to test the loading screen
  await new Promise(resolve => setTimeout(resolve, 5000));

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-4">
                    {/* Desktop and Tablet Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                        {/* Left side - Logo and School Info */}
                        <div className="flex items-center space-x-3 md:space-x-4">
                            {/* School Logo */}
                            <div className="flex-shrink-0">
                                <Image
                                    src="/assets/sjsfi_logo.svg"
                                    alt="SJSFI Logo"
                                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
                                    width={64}
                                    height={64}
                                />
                            </div>

                            {/* School Name and Address */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <h1 className="text-red-800 font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-wider leading-tight">
                                    SAINT JOSEPH SCHOOL OF FAIRVIEW INC.
                                </h1>
                                <p className="text-red-800 font-bold text-xs sm:text-xs md:text-sm tracking-wider leading-tight">
                                    Atherton St. cor. Pound St. Ph.8 North Fairview, Q.C,
                                </p>
                            </div>
                        </div>

                        {/* Right side - Contact Info */}
                        <div className="text-right flex-shrink-0 ml-4 flex items-center space-x-3">
                            <p className="text-red-800 font-bold text-xs sm:text-xs md:text-sm tracking-wider">
                                Tel. No. 461-3272 | 461-3346
                            </p>
                            <UserButton
                                appearance={{
                                    elements: {
                                        userPreview: {
                                            display: "none",
                                        },
                                    },
                                }}
                                userProfileProps={{
                                    appearance: {
                                        elements: {
                                            profileSectionPrimaryButton__profile: {
                                                display: "none",
                                            },
                                            profileSection__connectedAccounts: {
                                                display: "none",
                                            },
                                            profileSectionPrimaryButton__emailAddresses:
                                            {
                                                display: "none",
                                            },
                                            profileSection__danger: {
                                                display: "none",
                                            },
                                            menuButtonEllipsis: {
                                                display: "none",
                                            },
                                            profileSectionPrimaryButton__password: {
                                                display: "none",
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                        {/* Logo and School Name Row */}
                        <div className="flex items-center justify-between space-x-2 mb-2">
                            <div className="flex items-center space-x-2 flex-1">
                                <div className="flex-shrink-0">
                                    <Image
                                        src="/assets/sjsfi_logo.svg"
                                        alt="SJSFI Logo"
                                        className="h-8 w-8"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-red-800 font-bold text-xs tracking-wider leading-tight">
                                        SAINT JOSEPH SCHOOL OF FAIRVIEW INC.
                                    </h1>
                                </div>
                            </div>
                            {/* UserButton for mobile */}
                            <div className="flex-shrink-0">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            userPreview: {
                                                display: "none",
                                            },
                                        },
                                    }}
                                    userProfileProps={{
                                        appearance: {
                                            elements: {
                                                profileSectionPrimaryButton__profile: {
                                                    display: "none",
                                                },
                                                profileSection__connectedAccounts: {
                                                    display: "none",
                                                },
                                                profileSectionPrimaryButton__emailAddresses:
                                                {
                                                    display: "none",
                                                },
                                                profileSection__danger: {
                                                    display: "none",
                                                },
                                                menuButtonEllipsis: {
                                                    display: "none",
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* Address and Contact Info */}
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

                {/* Page Content */}
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}