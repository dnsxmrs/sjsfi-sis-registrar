// !NOT IN USE

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

interface AdminHeaderProps {
    currentDateTime: Date;
    profileMenuOpen: boolean;
    setProfileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    setProfilePopupOpen: (open: boolean) => void;
    setLogoutModalOpen: (open: boolean) => void;
}

export default function AdminHeader({ currentDateTime }: AdminHeaderProps) {
    const pathname = usePathname();

    const formattedDateTime = `${currentDateTime
        .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        .replace(",", "")} - ${currentDateTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })}`;

    const getPageTitle = (path: string) => {
        switch (path) {
            case "/admin/home":
                return "Dashboard";
            case "/admin/system-logs":
                return "System Logs";
            case "/admin/policies":
                return "School Policies";
            default:
                return "";
        }
    };

    return (
        <header className="flex items-center justify-between bg-white shadow px-5 sm:px-7 md:px-9 py-2 sm:py-3 lg:py-4">
            <div className="flex-1 min-w-0 text-start">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-red-700 truncate">
                    {getPageTitle(pathname)}
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 truncate">
                    {formattedDateTime}
                </p>
            </div>{" "}
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                <Bell className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <div className="flex items-center">
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
        </header>
    );
}
