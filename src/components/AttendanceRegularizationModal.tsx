'use client';

import { X, Info, FileText } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { requestRegularizationApi } from '@/services/attendanceApi';
import { toast } from 'sonner';
import { triggerAttendanceUpdate } from '@/utils/attendanceEvents';

interface AttendanceRegularizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    requests: any[]; // Pass all requests to calculate count
}

export default function AttendanceRegularizationModal({
    isOpen,
    onClose,
    date,
    requests = [],
}: AttendanceRegularizationModalProps) {
    // If no date provided, default to today
    const [targetDate, setTargetDate] = useState<Date>(date || new Date());
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculate limit
    const currentMonthRequests = requests.filter(r => {
        const d = new Date(r.requestedOn); // Use requestedOn date to count against the month made
        return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    });
    const monthlyCount = currentMonthRequests.length;
    const limit = 7;
    const remaining = Math.max(0, limit - monthlyCount);
    const isLimitReached = remaining <= 0;

    // Determine if we should update state when prop changes
    if (date && date.getTime() !== targetDate.getTime() && isOpen) {
       // setTargetDate(date); // This could cause too many re-renders if not handled
    }

    const handleSubmit = async () => {
        if (!note.trim()) {
            toast.error('Please provide a reason for the request');
            return;
        }

        setLoading(true);
        try {
            await requestRegularizationApi(targetDate.toISOString(), note);
            toast.success('Regularization request submitted successfully');
            triggerAttendanceUpdate();
            onClose();
            setNote('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-[#11375d]">Request Attendance Regularization</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Selected Date Card */}
                    <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
                        <div className="bg-white border border-gray-200 rounded-md px-4 py-2 text-center min-w-[80px]">
                            <div className="text-xs text-gray-500 uppercase font-bold">{format(targetDate, 'MMM')}</div>
                            <div className="text-xl font-bold text-gray-800">{format(targetDate, 'd')}</div>
                            <div className="text-xs text-gray-400 uppercase">{format(targetDate, 'EEE')}</div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-0.5">
                                Regularization Date
                            </label>
                            <div className="font-medium text-[#11375d] text-lg">
                                {format(targetDate, 'd MMMM yyyy')}
                            </div>
                        </div>

                        {/* Date Picker Overlay */}
                        <div className="absolute inset-0 opacity-0 cursor-pointer">
                            <input
                                type="date"
                                className="w-full h-full cursor-pointer"
                                value={format(targetDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    if (e.target.valueAsDate) setTargetDate(e.target.valueAsDate);
                                }}
                            />
                        </div>
                        <div className="mr-2 text-xs font-bold text-[#4c35de] border border-[#4c35de]/20 bg-[#4c35de]/5 px-3 py-1.5 rounded-md pointer-events-none">
                            CHANGE DATE
                        </div>
                    </div>

                    {/* Policy Selection */}
                    <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <input
                                    type="radio"
                                    checked
                                    readOnly
                                    className="w-4 h-4 text-[#4c35de] border-gray-300 focus:ring-[#4c35de]"
                                />
                            </div>
                            <div>
                                <span className="font-medium text-gray-900 block mb-1">Attendance Regularization</span>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Raise regularization request to exempt this day from penalization policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Information */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 relative">
                        <div className="p-2 bg-white rounded-full text-[#4c35de] shadow-sm">
                            <div className="p-2 bg-white rounded-full text-[#4c35de] shadow-sm">
                                <Info size={18} />
                            </div>
                        </div>
                        <span className="text-sm text-gray-600">
                            Remaining balance: <span className={`font-bold ${isLimitReached ? 'text-red-600' : 'text-gray-900'}`}>{remaining} requests</span>
                        </span>

                        <div className="ml-auto relative group">
                            <button className="text-xs font-semibold text-[#4c35de] hover:underline focus:outline-none">
                                View Details
                            </button>

                            {/* Popover */}
                            <div className="absolute bottom-full right-0 mb-3 w-[300px] hidden group-hover:block z-10">
                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-2 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {/* Arrow */}
                                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>

                                    <div className="grid grid-cols-2 gap-4 p-3 border-b border-gray-50 bg-gray-50/50 rounded-t-md">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Balance</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        <div className="text-sm font-medium text-gray-800">Monthly Window</div>
                                        <div className="text-sm text-gray-600 text-right">
                                            <span className="font-bold text-gray-900">{remaining}</span>/{limit} requests
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            Reason / Note
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Please provide a reason for this regularization request..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4c35de]/10 focus:border-[#4c35de] outline-none transition-all resize-none h-32 text-sm bg-gray-50 focus:bg-white"
                        />
                        {isLimitReached && (
                            <p className="text-xs text-red-500 font-bold mt-2">
                                You have used all {limit} regularization requests for this month. You cannot submit more.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || isLimitReached}
                        className="px-8 py-2.5 text-sm font-semibold text-white bg-[#4c35de] hover:bg-[#3b29b0] rounded-lg shadow-lg shadow-[#4c35de]/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
