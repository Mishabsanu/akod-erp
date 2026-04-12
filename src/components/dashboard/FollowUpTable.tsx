// components/dashboard/FollowUpTable.tsx
"use client";
import React from "react";

export default function FollowUpTable({ followups, role }: any) {
  if (!followups || followups.length === 0)
    return null; // caller controls conditional display

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <h3 className="text-lg font-semibold text-[#11375d] mb-4">
        {role === "admin" ? "Today's Follow-ups (All Users)" : "Today's Follow-ups"}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#11375d] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Contact</th>
              {role === "admin" && <th className="px-4 py-2 text-left">Salesperson</th>}
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Follow-ups Count</th>
              <th className="px-4 py-2 text-left">Next Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((f: any, i: number) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2 font-medium">{f.companyName || f.name}</td>
                <td className="px-4 py-2">{f.contactPersonMobile || "-"}</td>
                {role === "admin" && <td className="px-4 py-2">{f.userName || "-"}</td>}
                <td className="px-4 py-2">{f.status}</td>
                <td className="px-4 py-2">{f.followUpCount ?? 0}</td>
                <td className="px-4 py-2">{f.nextFollowUpDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
