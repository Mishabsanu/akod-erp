'use client';

export default function DashboardHeader({ role }: { role: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-10 w-1 bg-[#cc1518] rounded-full"></div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#11375d]">
        {role === 'admin'
          ? 'Admin Dashboard'
          : role === 'sales'
          ? 'Sales Dashboard'
          : 'Finance Dashboard'}
      </h1>
    </div>
  );
}
