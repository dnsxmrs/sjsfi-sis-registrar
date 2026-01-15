"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    X,
    LayoutDashboard,
    PencilLine,
    BookMarked,
    Newspaper,
    Scale,
    Shield,
    FileUser,
    ChevronRight,
    CalendarCheck
} from "lucide-react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import NotificationBell from "@/components/registrar/NotificationBell";

const NAVIGATION_ITEMS = [
    { href: "/registrar/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/registrar/student-registration", label: "Student Registration", icon: PencilLine },
    { href: "/registrar/student-application", label: "Student Application", icon: FileUser },
    { href: "/registrar/student-information", label: "Student Information", icon: BookMarked },
    { href: "/registrar/schedule", label: "Schedule Management", icon: CalendarCheck },
    { href: "/registrar/code-logs", label: "Code Logs", icon: Newspaper },
    { href: "/registrar/policies", label: "Policies", icon: Scale },
    { href: "/registrar/system-logs", label: "System Logs", icon: Shield },
] as const;

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
            },
        },
    },
} as const;

export default function RegistrarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const pathname = usePathname();

    useEffect(() => {
        const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedDateTime = currentDateTime.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).replace(",", "") + " - " + currentDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const getBreadcrumbs = (path: string) => {
        const segments = path.split('/').filter(Boolean);

        // Handle dynamic student detail pages
        if (path.startsWith('/registrar/student-information/') && segments.length > 2) {
            return [
                { label: 'Student Information', href: '/registrar/student-information' },
                { label: segments[2], href: path, isActive: true },
            ];
        }

        // Default single page title
        const navItem = NAVIGATION_ITEMS.find((item) => item.href === path);
        return navItem ? [{ label: navItem.label, href: path, isActive: true }] : [{ label: '', href: path, isActive: true }];
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Top Bar */}
            <div className="md:hidden flex justify-between items-center bg-red-900 text-white px-4 py-3">
                <Image
                    src="/assets/sjsfi_logo.svg"
                    alt="SJSFI Logo"
                    width={40}
                    height={40}
                    priority
                />
                <div className="text-lg font-bold">SJSFI-SIS</div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle Menu"
                >
                    {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
            {/* Sidebar */}
            <aside
                className={`fixed z-20 top-0 left-0 h-full w-30 bg-[#800000] text-white transform ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex md:flex-col md:w-30 md:h-screen overflow-y-auto md:overflow-visible`}
            >
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex flex-col items-center justify-center py-6 text-xl font-bold">
                            <Image
                                src="/assets/sjsfi_logo.svg"
                                alt="SJSFI Logo"
                                width={60}
                                height={60}
                                priority
                            />
                            <span>SJSFI-SIS</span>
                        </div>

                        <nav className="space-y-4 text-sm px-6 pt-4 md:pt-0">
                            {NAVIGATION_ITEMS.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex flex-col items-center space-y-1 py-2 rounded hover:bg-red-700 ${
                                            pathname === item.href ? "text-yellow-400" : ""
                                        }`}
                                    >
                                        <IconComponent className="w-6 h-6" />
                                        <span className="text-center text-xs leading-tight">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </aside>
            {/* Overlay for mobile menu */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-10 bg-black opacity-30 md:hidden"
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Bar */}
                <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {getBreadcrumbs(pathname).map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    {crumb.isActive ? (
                                        <h1 className="text-xl font-semibold text-red-700">
                                            {crumb.label}
                                        </h1>
                                    ) : (
                                        <Link
                                            href={crumb.href}
                                            className="text-xl font-semibold text-gray-600 hover:text-red-700 transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500" suppressHydrationWarning>
                            {formattedDateTime}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        <UserButton {...USER_BUTTON_CONFIG} />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
