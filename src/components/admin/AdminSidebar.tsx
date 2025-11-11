'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, SquareStack, List, Scale } from 'lucide-react';
import Image from 'next/image';

interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden flex justify-between items-center bg-red-900 text-white px-3 sm:px-4 py-2 sm:py-3">
                <Image src="/assets/sjsfi_logo.svg" alt="SJSFI Logo" width={32} height={32} className="sm:w-10 sm:h-10" />
                <div className="text-base sm:text-lg font-bold">SJSFI-SIS</div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Menu">
                    {sidebarOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed z-20 top-0 left-0 h-full w-56 sm:w-64 bg-red-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex md:flex-col md:w-64 lg:w-64 md:h-auto`}>
                <div className="flex flex-col h-full justify-between">
                    {/* Navigation */}
                    <div>
                        <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-bold">
                            <Image src="/assets/sjsfi_logo.svg" alt="SJSFI Logo" width={70} height={70} className="sm:w-20 sm:h-20 lg:w-20 lg:h-20" />
                            <span className="mt-2">SJSFI-SIS</span>
                        </div>
                        <nav className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base px-4 sm:px-6 pt-2 sm:pt-4 md:pt-0">
                            <Link href="/admin/home" className={`flex items-center space-x-3 sm:space-x-4 lg:space-x-5 py-2 lg:py-3 rounded hover:bg-red-700 transition-colors ${pathname === '/admin/home' ? 'text-yellow-400' : ''}`}>
                                <SquareStack className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/admin/system-logs" className={`flex items-center space-x-3 sm:space-x-4 lg:space-x-5 py-2 lg:py-3 rounded hover:bg-red-700 transition-colors ${pathname === '/admin/system-logs' ? 'text-yellow-400' : ''}`}>
                                <List className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                                <span>System Logs</span>
                            </Link>
                            <Link href="/admin/policies" className={`flex items-center space-x-3 sm:space-x-4 lg:space-x-5 py-2 lg:py-3 rounded hover:bg-red-700 transition-colors ${pathname === '/admin/policies' ? 'text-yellow-400' : ''}`}>
                                <Scale className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                                <span>School Policies</span>
                            </Link>
                            {/* <Link href="/admin/settings" className={`flex items-center space-x-3 sm:space-x-4 lg:space-x-5 py-2 lg:py-3 rounded hover:bg-red-700 transition-colors ${pathname === '/admin/settings' ? 'text-yellow-400' : ''}`}>
                                <Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0" />
                                <span>System Config</span>
                            </Link> */}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile menu */}
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-10 bg-black opacity-30 md:hidden" />}
        </>
    );
}
