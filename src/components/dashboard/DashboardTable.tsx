export default function DashboardTable({ data }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#11375d]/10 p-6">
      <h2 className="text-xl font-semibold text-[#11375d] mb-5">
        {data.role === 'admin' && "Today's Follow-ups (All Users)"}
        {data.role === 'sales' && 'My Follow-ups'}
        {data.role === 'finance' && 'Pending Quotes'}
      </h2>

      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-[#11375d] text-white text-sm uppercase tracking-wider">
            <tr>
              {data.role !== 'finance' ? (
                <>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Contact</th>
                  {data.role === 'admin' && <th className="px-6 py-3">Salesperson</th>}
                </>
              ) : (
                <>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Total Selling Price</th>
                  <th className="px-6 py-3">Status</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {data.role !== 'finance'
              ? data.followupList?.map((f: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-3">{f.name}</td>
                    <td className="px-6 py-3">{f.contactPersonMobile}</td>
                    {data.role === 'admin' && <td className="px-6 py-3">{f.user?.name || '-'}</td>}
                  </tr>
                ))
              : data.pendingQuotes?.map((q: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-3">{q.name}</td>
                    <td className="px-6 py-3">{q.totalSellingPrice}</td>
                    <td className="px-6 py-3">{q.status}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
