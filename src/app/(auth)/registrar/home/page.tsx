import StatsCards from '@/components/registrar/StatsCards';
import GradePieChart from '@/components/admin/PieChart';
import QuickActions from '@/components/registrar/QuickActions';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

export default function RegistrarHomePage() {
    return (
        <div className="min-h-screen p-4 lg:p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Welcome back! Here&apos;s what&apos;s happening today.</h1>
            </div>

            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 items-start">
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-md border-2 border-indigo-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-white border-b-2 border-indigo-200 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Student Distribution</h3>
                                    <p className="text-sm text-gray-600">Students enrolled per grade level</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <GradePieChart />
                        </div>
                    </div>

                    <QuickActions />
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-md border-2 border-amber-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pending Review</h3>
                                <p className="text-sm text-gray-600">Items requiring attention</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border-2 border-amber-200 hover:border-amber-300 transition-colors">
                                <div className="text-3xl font-bold text-amber-600 mb-1">
                                    <span id="pending-registrations">...</span>
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Registrations</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-orange-300 transition-colors">
                                <div className="text-3xl font-bold text-orange-600 mb-1">
                                    <span id="pending-applications">...</span>
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Applications</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Approved Since Today</h3>
                                <p className="text-sm text-gray-600">Successfully processed</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border-2 border-emerald-200 hover:border-emerald-300 transition-colors">
                                <div className="text-3xl font-bold text-emerald-600 mb-1">
                                    <span id="approved-registrations">...</span>
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Registrations</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-300 transition-colors">
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                    <span id="approved-applications">...</span>
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Applications</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border-2 border-violet-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <FileText className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                                <p className="text-sm text-gray-600">Current academic term</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white border-2 border-violet-200 rounded-lg p-3 hover:border-violet-300 transition-colors">
                                <span className="text-sm font-medium text-gray-700">Active Terms</span>
                                <span className="text-2xl font-bold text-violet-600" id="active-terms">...</span>
                            </div>
                            <div className="flex justify-between items-center bg-white border-2 border-violet-200 rounded-lg p-3 hover:border-violet-300 transition-colors">
                                <span className="text-sm font-medium text-gray-700">Active Year Levels</span>
                                <span className="text-2xl font-bold text-violet-600" id="active-courses">...</span>
                            </div>
                            <div className="flex justify-between items-center bg-white border-2 border-violet-200 rounded-lg p-3 hover:border-violet-300 transition-colors">
                                <span className="text-sm font-medium text-gray-700">Feedback Received</span>
                                <span className="text-2xl font-bold text-violet-600" id="feedback-count">...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}