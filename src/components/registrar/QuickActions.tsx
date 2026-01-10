'use client';

import { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import SendNotificationModal from './SendNotificationModal';

interface QuickActionsProps {
    className?: string;
}

export default function QuickActions({ className = '' }: QuickActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className={`bg-white rounded-2xl shadow-md border-2 border-blue-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
                <div className="bg-white border-b-2 border-blue-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            <p className="text-sm text-gray-600">Send notifications to students</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send Notification
                    </button>
                </div>
            </div>

            <SendNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
