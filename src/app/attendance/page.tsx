'use client';

import { useState } from 'react';
import AttendanceStats from '@/components/AttendanceStats';
import AttendanceLogSection from '@/components/AttendanceLogSection';
import AdminAttendanceDashboard from '@/components/AdminAttendanceDashboard';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, RefreshCw,
    Users,
    UserCheck
} from 'lucide-react';

function AttendancePage() {
    const { user, can } = useAuth();
    const [view, setView] = useState<'my' | 'admin'>('my');

    // Only allow admin view if user has permission
    const canViewAll = user?.role && (typeof user.role === 'string' ? user.role === 'Admin' : user.role.name === 'Admin');

    return (
        <div className="min-h-screen w-full p-6 md:p-10 bg-[#f8f9fc]">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-[5px] h-12 bg-[#cc1518] rounded-full shadow-sm" />
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#11375d] tracking-tight">
                            {view === 'my' ? 'My Attendance' : 'Team Report'}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm mt-1">
                            {view === 'my' ? 'Manage your daily logs and requests' : 'Overview of staff presence and activity'}
                        </p>
                    </div>
                </div>

                {canViewAll && (
                    <div className="flex p-1.5 bg-white border border-gray-100 rounded-xl shadow-sm self-start md:self-auto ring-1 ring-black/5">
                        <button
                            onClick={() => setView('my')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black tracking-tight transition-all duration-300 ${view === 'my'
                                ? 'bg-[#11375d] text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <UserCheck size={18} />
                            My Space
                        </button>
                        <button
                            onClick={() => setView('admin')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black tracking-tight transition-all duration-300 ${view === 'admin'
                                ? 'bg-[#11375d] text-white shadow-lg'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            Team Report
                        </button>
                    </div>
                )}
            </div>

            <div className="relative">
                {view === 'my' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Stats/Timings Section */}
                        <AttendanceStats />

                        {/* Logs Section */}
                        <AttendanceLogSection />
                    </div>
                ) : (
                    <AdminAttendanceDashboard />
                )}
            </div>
        </div>
    );
}

export default withAuth(AttendancePage, [{ module: 'attendance', action: 'view' }]);
