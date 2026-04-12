'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeliveryTicketFilter } from '@/lib/types';
import { Filter, ToggleLeft, CalendarDays, XCircle } from 'lucide-react';
import { FilterChip } from '@/components/shared/FilterChip';

const PRIMARY = '#11375d';

interface DeliveryTicketFilterBarProps {
  onStatusChange: (status: DeliveryTicketFilter['status']) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  onClearFilters: () => void;
  initialStatus?: DeliveryTicketFilter['status'];
  initialStartDate?: string;
  initialEndDate?: string;
}

export const DeliveryTicketFilterBar: React.FC<DeliveryTicketFilterBarProps> = ({
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  initialStatus = undefined,
  initialStartDate = undefined,
  initialEndDate = undefined,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  useEffect(() => {
    onStatusChange(selectedStatus === '' ? undefined : (selectedStatus as DeliveryTicketFilter['status']));
  }, [selectedStatus, onStatusChange]);

  useEffect(() => {
    onStartDateChange(startDate === '' ? undefined : startDate);
  }, [startDate, onStartDateChange]);

  useEffect(() => {
    onEndDateChange(endDate === '' ? undefined : endDate);
  }, [endDate, onEndDateChange]);


  const handleClear = () => {
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-gray-700">
        <Filter className="w-5 h-5" />
        <h3 className="text-sm font-semibold">Filters</h3>
      </div>

      {/* Active Filter Chips */}
      {(selectedStatus || startDate || endDate) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatus && (
            <FilterChip
              label="Status"
              value={selectedStatus}
              onRemove={() => setSelectedStatus('')}
              color="green"
            />
          )}
          {startDate && (
            <FilterChip
              label="From"
              value={startDate}
              onRemove={() => setStartDate('')}
              color="blue"
            />
          )}
          {endDate && (
            <FilterChip
              label="To"
              value={endDate}
              onRemove={() => setEndDate('')}
              color="blue"
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Status
            </label>
            <div className="relative">
              <ToggleLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-56">
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">
                From
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-56">
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">
                To
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        {(selectedStatus || startDate || endDate) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:bg-gray-50"
            style={{ borderColor: PRIMARY, color: PRIMARY }}
          >
            <XCircle className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};
