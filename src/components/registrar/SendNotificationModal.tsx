'use client';

import { useState, useEffect } from 'react';
import { X, Send, Loader2, Search, Users, User } from 'lucide-react';
import { sendNotification } from '@/app/_actions/sendDynamicNotification';
import { searchStudents } from '@/app/_actions/searchStudents';
import toast from 'react-hot-toast';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Student {
    id: number;
    studentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
}

type UserRole = 'STUDENT' | 'REGISTRAR' | 'ADMIN';
type NotificationType = 'info' | 'warning' | 'system';
// type NotificationScope = 'GENERAL' | 'GROUP' | 'USER';

export default function SendNotificationModal({ isOpen, onClose }: SendNotificationModalProps) {
    const [step, setStep] = useState<'scope' | 'details'>('scope');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Form state
    const [scope, setScope] = useState<'GROUPS' | 'USER'>('GROUPS');
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notificationType, setNotificationType] = useState<NotificationType>('info');

    // Search and selection
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('scope');
                setScope('GROUPS');
                setSelectedRoles([]);
                setTitle('');
                setDescription('');
                setNotificationType('info');
                setSearchQuery('');
                setSearchResults([]);
                setSelectedStudents([]);
                setIsClosing(false);
            }, 300);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const toggleRoleSelection = (role: UserRole) => {
        setSelectedRoles(prev => {
            if (prev.includes(role)) {
                return prev.filter(r => r !== role);
            } else {
                return [...prev, role];
            }
        });
    };

    const toggleAllRoles = () => {
        const allRoles: UserRole[] = ['STUDENT', 'REGISTRAR', 'ADMIN'];
        if (selectedRoles.length === allRoles.length) {
            setSelectedRoles([]);
        } else {
            setSelectedRoles(allRoles);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            const results = await searchStudents(searchQuery);
            if (results.success && results.students) {
                setSearchResults(results.students);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const toggleStudentSelection = (student: Student) => {
        setSelectedStudents(prev => {
            const isSelected = prev.some(s => s.id === student.id);
            if (isSelected) {
                return prev.filter(s => s.id !== student.id);
            } else {
                return [...prev, student];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast.error('Title and description are required');
            return;
        }

        if (scope === 'GROUPS' && selectedRoles.length === 0) {
            toast.error('Please select at least one group');
            return;
        }

        if (scope === 'USER' && selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setLoading(true);

        try {
            const allRoles: UserRole[] = ['STUDENT', 'REGISTRAR', 'ADMIN'];
            const isGeneral = scope === 'GROUPS' && selectedRoles.length === allRoles.length;

            const response = await sendNotification({
                title,
                description,
                type: notificationType,
                scope: scope === 'USER' ? 'USER' : (isGeneral ? 'GENERAL' : 'GROUP'),
                groupTypes: scope === 'GROUPS' && !isGeneral ? selectedRoles : undefined,
                recipientIds: scope === 'USER' ? selectedStudents.map(s => s.id) : undefined,
            });

            if (response.success) {
                toast.success(response.message);
                handleClose();
            } else {
                toast.error(response.message);
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
                        isClosing ? 'opacity-0' : 'opacity-100'
                    }`}
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className={`relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
                    isClosing ? 'opacity-0 scale-95 -translate-y-5' : 'opacity-100 scale-100 translate-y-0'
                }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Send Notification</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {step === 'scope' ? (
                                <div className="space-y-4 text-black">
                                    <h3 className="text-lg font-medium text-gray-900">Select Recipients</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setScope('GROUPS')}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${scope === 'GROUPS'
                                                    ? 'border-blue-600 bg-blue-50 scale-105'
                                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                                }`}
                                        >
                                            <Users className={`w-8 h-8 mx-auto mb-2 transition-colors duration-200 ${scope === 'GROUPS' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-center">All Users / Groups</p>
                                            <p className="text-xs text-gray-500 text-center mt-1">Select user groups</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setScope('USER')}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${scope === 'USER'
                                                    ? 'border-blue-600 bg-blue-50 scale-105'
                                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                                }`}
                                        >
                                            <User className={`w-8 h-8 mx-auto mb-2 transition-colors duration-200 ${scope === 'USER' ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-center">Specific Users</p>
                                            <p className="text-xs text-gray-500 text-center mt-1">Select individuals</p>
                                        </button>
                                    </div>

                                    {scope === 'GROUPS' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Select Groups (check all that apply)
                                            </label>

                                            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoles.length === 3}
                                                        onChange={toggleAllRoles}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">All Users</p>
                                                        <p className="text-xs text-gray-500">Send to everyone (Students, Registrars, Admins)</p>
                                                    </div>
                                                </label>

                                                <div className="border-t border-gray-200 pt-3 space-y-2">
                                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRoles.includes('STUDENT')}
                                                            onChange={() => toggleRoleSelection('STUDENT')}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">Students</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRoles.includes('REGISTRAR')}
                                                            onChange={() => toggleRoleSelection('REGISTRAR')}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">Registrars</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRoles.includes('ADMIN')}
                                                            onChange={() => toggleRoleSelection('ADMIN')}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">Administrators</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {selectedRoles.length > 0 && (
                                                <div className="bg-blue-50 rounded-lg p-3 animate-in fade-in slide-in-from-top-3 duration-300">
                                                    <p className="text-sm text-blue-900">
                                                        <span className="font-medium">Selected:</span>{' '}
                                                        {selectedRoles.length === 3 
                                                            ? 'All Users' 
                                                            : selectedRoles.map(role => {
                                                                if (role === 'STUDENT') return 'Students';
                                                                if (role === 'REGISTRAR') return 'Registrars';
                                                                return 'Administrators';
                                                            }).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {scope === 'USER' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Search Students
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                                    placeholder="Search by name or student number..."
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSearch}
                                                    disabled={searchLoading}
                                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {searchResults.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-300">
                                                    {searchResults.map((student) => (
                                                        <div
                                                            key={student.id}
                                                            onClick={() => toggleStudentSelection(student)}
                                                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {student.firstName} {student.lastName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{student.studentNumber}</p>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStudents.some(s => s.id === student.id)}
                                                                onChange={() => { }}
                                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedStudents.length > 0 && (
                                                <div className="bg-blue-50 rounded-lg p-3 animate-in fade-in slide-in-from-top-3 duration-300">
                                                    <p className="text-sm font-medium text-blue-900 mb-2">
                                                        Selected ({selectedStudents.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedStudents.map((student) => (
                                                            <span
                                                                key={student.id}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                            >
                                                                {student.firstName} {student.lastName}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleStudentSelection(student)}
                                                                    className="hover:text-blue-900"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Next: Message Details
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setStep('scope')}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                    >
                                        ← Back to Recipients
                                    </button>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter notification title"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter notification message"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                            Notification Type
                                        </label>
                                        <select
                                            value={notificationType}
                                            onChange={(e) => setNotificationType(e.target.value as NotificationType)}
                                            className="cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="info">Information</option>
                                            <option value="warning">Warning</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Notification
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
