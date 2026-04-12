import { ReturnTicket } from '@/lib/types';

interface ReturnTicketPreviewProps {
    data: Partial<ReturnTicket>;
    onBack: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

const ReturnTicketPreview = ({
    data,
    onBack,
    onConfirm,
    isSubmitting,
}: ReturnTicketPreviewProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Format: DD-Mon-YYYY
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    // Fill empty rows to maintain A4 height
    const MAX_ROWS = 10;
    const filledRows = [...(data.items || [])];
    const emptyRowsCount = Math.max(0, MAX_ROWS - filledRows.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    const totalReturnQty = data.items?.reduce((acc, curr) => acc + (Number(curr.returnQty) || 0), 0) || 0;

    return (
        <div className="w-full min-h-screen bg-gray-200 py-8 px-4 flex flex-col items-center print:bg-white print:py-0 print:px-0">
            {/* Action Bar */}
            <div className="mb-6 flex gap-4 print:hidden w-full max-w-[210mm] justify-between items-center">
                <div className="text-sm text-gray-600 font-medium">
                    Preview Mode - {filledRows.length} Items (Max 10 per page)
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition font-medium text-sm"
                    >
                        Back to Edit
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className={`px-6 py-2 text-white rounded shadow-md transition font-bold flex items-center gap-2 text-sm ${isSubmitting ? 'bg-gray-400' : 'bg-red-700 hover:bg-red-800'
                            }`}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm & Create'}
                    </button>
                </div>
            </div>

            {/* A4 Container */}
            <div className="bg-white text-black shadow-2xl w-[210mm] min-h-[297mm] px-10 py-8 relative print:shadow-none print:w-full print:h-auto overflow-hidden font-sans text-[10pt]">

                {/* 1. Header Section */}
                <div className="flex justify-between items-start mb-6">
                    {/* Left: English Contact */}
                    <div className="text-[8pt] text-gray-600 space-y-0.5 pt-2">
                        <p>Tel: +974 44161483</p>
                        <p>+974 55299893</p>
                        <p>Doha - Qatar</p>
                        <p className="text-blue-900">info@akodgroup.com</p>
                        <p className="text-blue-900">chooseakod.com</p>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex flex-col items-center">
                        {/* Logo Icon (Triangle) */}
                        <div className="mb-1">
                            <svg width="60" height="50" viewBox="0 0 100 80">
                                {/* Triangle Shape - Red */}
                                <path d="M50 5 L90 75 L10 75 Z" fill="none" stroke="#dc2626" strokeWidth="8" />
                                <path d="M50 25 L75 65 L25 65 Z" fill="#dc2626" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-wider">AKOD</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-[#dc2626] -mt-1">Group</p>
                        <p className="text-[7pt] text-gray-500 mt-1">The Strongest in the Industry</p>
                        <h2 className="text-lg font-bold uppercase mt-2 text-red-700 underline decoration-2 underline-offset-4">Return Note</h2>
                    </div>

                    {/* Right: Arabic Contact */}
                    <div className="text-[8pt] text-gray-600 space-y-0.5 pt-2 text-right font-arabic" style={{ direction: 'rtl' }}>
                        <p>هاتف: ٤٤١٦١٤٨٣ ٩٧٤+</p>
                        <p>٩٧٤ ٥٥٢٩٩٨٩٣+</p>
                        <p>الدوحة، قطر</p>
                        <p className="text-blue-900">info@akodgroup.com</p>
                        <p className="text-blue-900">chooseakod.com</p>
                    </div>
                </div>

                {/* 2. Grid Section - "AFFIX" Layout */}
                <div className="border border-gray-400 mb-6 text-sm">
                    <div className="flex border-b border-gray-400">
                        {/* Top Left: Customer Details */}
                        <div className="w-[60%] border-r border-gray-400 p-2 h-24">
                            <p className="bg-gray-200 inline-block px-1 mb-1 text-xs font-bold text-gray-700 rounded-sm">Customer Details.</p>
                            <p className="font-bold uppercase text-lg text-gray-900 ml-2 mt-1">{data.customerName}</p>
                            {data.referenceNo && <p className="text-xs text-gray-500 ml-2">Ref: {data.referenceNo}</p>}
                        </div>

                        {/* Top Right: RN Details */}
                        <div className="w-[40%] text-xs">
                            <div className="flex border-b border-gray-400">
                                <div className="w-24 p-1 border-r border-gray-400 bg-gray-50 font-semibold">Return Note No.</div>
                                <div className="flex-grow p-1 font-bold pl-2 text-red-700">{data.ticketNo}</div>
                            </div>
                            <div className="flex border-b border-gray-400">
                                <div className="w-24 p-1 border-r border-gray-400 bg-gray-50 font-semibold">Dated</div>
                                <div className="flex-grow p-1 pl-2">{formatDate(data.returnDate)}</div>
                            </div>
                            <div className="flex border-b border-gray-400">
                                <div className="w-24 p-1 border-r border-gray-400 bg-gray-50 font-semibold">Reason</div>
                                <div className="flex-grow p-1 pl-2 font-medium capitalize">{data.reason}</div>
                            </div>
                            <div className="flex">
                                <div className="w-24 p-1 border-r border-gray-400 bg-gray-50 font-semibold">Vehicle Name</div>
                                <div className="flex-grow p-1 pl-2 uppercase">{data.vehicleNo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row */}
                    <div className="flex">
                        {/* Middle Left: Location */}
                        <div className="w-[60%] border-r border-gray-400">
                            <div className="flex border-b border-gray-400">
                                <div className="w-32 p-1 border-r border-gray-400 font-semibold text-xs text-gray-500 pl-2">Project Location</div>
                                <div className="flex-grow p-1 pl-2 font-medium uppercase">{data.projectLocation}</div>
                            </div>
                            <div className="flex border-b border-gray-400">
                                <div className="w-32 p-1 border-r border-gray-400 font-semibold text-xs text-gray-500 pl-2">Subject</div>
                                <div className="flex-grow p-1 pl-2 font-medium uppercase">{data.subject}</div>
                            </div>
                            <div className="flex">
                                <div className="w-32 p-1 border-r border-gray-400 font-semibold text-xs text-gray-500 pl-2">Contact Person No</div>
                                <div className="flex-grow p-1 pl-2 font-medium">{data.deliveredBy?.deliveredByMobile}</div>
                            </div>
                        </div>

                        {/* Middle Right: Driver (or empty in ref) */}
                        <div className="w-[40%] text-xs">
                            <div className="flex h-full">
                                <div className="w-24 p-1 border-r border-gray-400 bg-gray-50 font-semibold">Driver Name</div>
                                <div className="flex-grow p-1 pl-2 uppercase font-medium">{data.deliveredBy?.deliveredByName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Items Table - New Columns */}
                <div className="border border-gray-400 mb-2 min-h-[400px] flex flex-col">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-400 bg-gray-100/50">
                                <th className="w-12 border-r border-gray-400 py-1 font-semibold text-gray-700">Sl No</th>
                                <th className="border-r border-gray-400 py-1 font-semibold text-gray-700 text-left pl-2">Description of Goods</th>
                                <th className="w-24 border-r border-gray-400 py-1 font-semibold text-gray-700">Code</th>
                                <th className="w-16 border-r border-gray-400 py-1 font-semibold text-gray-700">Prev Ret</th>
                                <th className="w-16 border-r border-gray-400 py-1 font-semibold text-gray-700">Ret Qty</th>
                                <th className="w-16 border-r border-gray-400 py-1 font-semibold text-gray-700">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400">
                            {filledRows.map((item, idx) => (
                                <tr key={idx} className="h-10">
                                    <td className="border-r border-gray-400 text-center text-gray-600 align-middle">{idx + 1}</td>
                                    <td className="border-r border-gray-400 px-2 font-medium text-gray-900 uppercase align-middle">
                                        <div className="flex flex-col justify-center">
                                            <span>{item.name}</span>
                                            {item.description && <span className="text-[8pt] text-gray-500 italic font-normal">{item.description}</span>}
                                        </div>
                                    </td>
                                    <td className="border-r border-gray-400 text-center text-gray-600 align-middle">{item.itemCode || '-'}</td>
                                    <td className="border-r border-gray-400 text-center text-gray-500 align-middle">{item.totalReturnedQty ?? '-'}</td>
                                    <td className="border-r border-gray-400 text-center font-bold text-red-700 align-middle">{item.returnQty}</td>
                                    <td className="border-r border-gray-400 text-center text-gray-600 uppercase align-middle">{item.unit}</td>
                                </tr>
                            ))}
                            {/* Empty Filler Rows */}
                            {emptyRows.map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-10">
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-auto border-t border-gray-400 flex text-xs font-bold h-8 items-center bg-gray-50">
                        <div className="flex-grow text-right pr-4 border-r border-gray-400 h-full flex items-center justify-end">Total Returned</div>
                        <div className="w-20 text-center h-full flex items-center justify-center bg-white text-red-700 text-sm">{totalReturnQty}</div>
                        <div className="w-[160px] h-full bg-white"></div>
                    </div>
                </div>
                <div className="text-right text-[8pt] font-bold italic mb-6">E & O.E</div>


                {/* 4. Footer Signatures - PROSERVE Style Dotted */}
                <div className="mt-auto pt-6 pb-2">
                    <div className="flex justify-between gap-12 font-bold text-xs text-gray-800 uppercase tracking-tight">
                        {/* Left: Delivered By (Customer Returning) */}
                        <div className="w-1/2 flex flex-col gap-3">
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">DELIVERED BY:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2 text-blue-900">{data.deliveredBy?.deliveredByName}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">MOB NO:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2">{data.deliveredBy?.deliveredByMobile}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">DATE:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2">{formatDate(data.deliveredBy?.deliveredDate)}</span>
                            </div>
                            <div className="flex items-end mt-2">
                                <span className="w-28 flex-shrink-0">SIGNATURE:</span>
                                <div className="flex-grow border-b border-dotted border-gray-600 h-8"></div>
                            </div>
                        </div>

                        {/* Right: Received By (AKOD) */}
                        <div className="w-1/2 flex flex-col gap-3">
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">RECEIVED BY:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2 text-blue-900">{data.receivedBy?.receivedByName}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">MOB NO:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2">{data.receivedBy?.receivedByMobile}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-28 flex-shrink-0">DATE:</span>
                                <span className="flex-grow border-b border-dotted border-gray-600 px-2">{formatDate(data.receivedBy?.receivedDate)}</span>
                            </div>
                            <div className="flex items-end mt-2">
                                <span className="w-28 flex-shrink-0">SIGNATURE:</span>
                                <div className="flex-grow border-b border-dotted border-gray-600 h-8"></div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 text-[7pt] text-gray-500 text-center">
                        RECEIVED ABOVE ITEMS IN GOOD CONDITION.
                    </div>
                </div>

                {/* 5. Company Footer - Solid Red Bar */}
                <div className="mt-2 text-center text-white font-sans bg-[#dc2626] py-2 -mx-10 px-10 mb-[-32px]">
                    <div className="flex flex-col gap-1 text-[8pt] font-medium leading-tight">
                        <div>
                            Mob: +974 5016 4817 | Tel: +974 4416 1483 | E-mail: info@akodgroup.com | chooseakod.com
                        </div>
                        <div className="border-t border-red-400 pt-1 mt-0.5 opacity-90 text-[7pt]">
                            C.R.No: 147701 | P.O.Box: 9044 | Doha - Qatar
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReturnTicketPreview;
