'use client';

import { useState } from 'react';
import AttendanceStats from '@/components/AttendanceStats';
import AttendanceLogSection from '@/components/AttendanceLogSection';
import AdminAttendanceDashboard from '@/components/AdminAttendanceDashboard';
import ListPageHeader from '@/components/shared/ListPageHeader';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutGrid, UserCheck } from 'lucide-react';

function AttendancePage() {
    const { user } = useAuth();
    const [view, setView] = useState<'my' | 'admin'>('my');

    // Only allow admin view if user has permission
    const canViewAll = user?.role && (typeof user.role === 'string' ? user.role === 'Admin' : user.role.name === 'Admin');

    return (
        <div className="min-h-screen w-full p-6 md:p-10 bg-[#f8f9fc]">
            <ListPageHeader
                eyebrow="Attendance Control"
                title={view === 'my' ? 'My' : 'Team'}
                highlight={view === 'my' ? 'Attendance' : 'Report'}
                description={view === 'my' ? 'Manage your daily logs and requests.' : 'Overview of staff presence and activity.'}
                actions={canViewAll && (
                    <>
                        <button
                            onClick={() => setView('my')}
                            className={`page-header-button ${view === 'my' ? '' : 'secondary'}`}
                        >
                            <UserCheck className="w-4 h-4" />
                            My Space
                        </button>
                        <button
                            onClick={() => setView('admin')}
                            className={`page-header-button ${view === 'admin' ? '' : 'secondary'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Team Report
                        </button>
                    </>
                )}
            />

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
