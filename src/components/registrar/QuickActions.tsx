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
            <div className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <p className="text-sm text-gray-600">Send notifications to students</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    Send Notification
                </button>
            </div>

            <SendNotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
