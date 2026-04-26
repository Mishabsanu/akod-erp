import { DeliveryTicket } from '@/lib/types';
import html2pdf from 'html2pdf.js';

interface DeliveryTicketPreviewProps {
    data: Partial<DeliveryTicket>;
    onBack?: () => void;
    onConfirm?: () => void;
    onEdit?: () => void;
    isSubmitting?: boolean;
    mode?: 'create' | 'view';
}

const DeliveryTicketPreview = ({
    data,
    onBack,
    onConfirm,
    onEdit,
    isSubmitting = false,
    mode = 'create',
}: DeliveryTicketPreviewProps) => {
    // Force A4 print styles
    const printStyles = `
        @page {
            size: A4;
            margin: 0mm;
        }
        @media print {
            /* 1. Global Reset */
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                height: 297mm !important;
                width: 210mm !important;
                overflow: visible !important;
                background: white !important;
            }

            /* 2. Hide everything by default */
            body * {
                visibility: hidden !important;
            }

            /* 3. Show only the document container and its contents */
            .a4-container, .a4-container * {
                visibility: visible !important;
            }

            /* 4. Position the container at the very top of the print page */
            .a4-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                margin: 0 !important;
                padding: 10mm !important;
                width: 210mm !important;
                height: 297mm !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                display: block !important;
            }

            /* 5. Ensure colors and backgrounds print correctly */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* 6. Hide action bars and other specifically marked items */
            .print\\:hidden, button, .mb-6 {
                display: none !important;
                visibility: hidden !important;
            }
        }
    `;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Format: DD-Mon-YYYY (e.g. 29-Nov-2025)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const handleDownload = () => {
        const element = document.querySelector('.a4-container') as HTMLElement;
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `DeliveryNote_${data.ticketNo || 'Draft'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        html2pdf().from(element).set(opt).save();
    };

    // Fill empty rows to maintain document height
    const MAX_ROWS = 15;
    const filledRows = [...(data.items || [])];
    const emptyRowsCount = Math.max(0, MAX_ROWS - filledRows.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    const totalQuantity = data.items?.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0) || 0;

    return (
        <div className="w-full min-h-screen bg-gray-200 py-8 px-4 flex flex-col items-center print:bg-white print:py-0 print:px-0">
            <style>{printStyles}</style>
            {/* Action Bar */}
            <div className="mb-6 flex gap-4 print:hidden w-full max-w-[210mm] justify-between items-center">
                <div className="text-sm text-gray-600 font-medium">
                    {mode === 'create' ? `Preview Mode - ${filledRows.length} Items` : 'Document Viewer'}
                </div>
                <div className="flex gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition font-medium text-sm"
                        >
                            {mode === 'create' ? 'Back' : 'Go Back'}
                        </button>
                    )}
                    {mode === 'view' && onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition font-bold text-sm"
                        >
                            Edit Ticket
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition font-bold flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition font-bold flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download PDF
                    </button>
                    {mode === 'create' && onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-white rounded shadow-md transition font-bold flex items-center gap-2 text-sm ${isSubmitting ? 'bg-gray-400' : 'bg-sky-700 hover:bg-sky-800'
                                }`}
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm & Create'}
                        </button>
                    )}
                </div>
            </div>

            {/* A4 Container */}
            <div className="bg-white text-black shadow-2xl w-[210mm] min-h-[297mm] px-10 py-8 relative print:shadow-none print:w-[210mm] print:h-[297mm] overflow-hidden font-sans text-[10pt] a4-container">

                {/* 1. Header Section */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-[#0f766e] pb-4">
                    {/* Left: Contact Info */}
                    <div className="w-[35%] text-[8pt] text-gray-700 space-y-0.5 pt-2">
                        <p className="font-bold text-[10pt] mb-1 text-[#0f766e]">PROSERVE TRADING & SERVICES WLL</p>
                        <p>Mob: +974 3030 3613</p>
                        <p>Tel: +974 4421 4042</p>
                        <p>E-mail: info@proservets.com</p>
                        <p>Website: www.proservets.com</p>
                    </div>

                    {/* Center: Logo & Title */}
                    <div className="w-[30%] flex flex-col items-center">
                        <div className="w-56 h-24 mb-2">
                            <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xl font-black uppercase text-gray-800 tracking-wider underline decoration-2 underline-offset-8 decoration-[#0f766e]">Delivery Note</h2>
                    </div>

                    {/* Right: Address Info */}
                    <div className="w-[35%] text-[8pt] text-gray-700 space-y-0.5 pt-2 text-right">
                        <p>C.R. No: 147701</p>
                        <p>P.O. Box: 9044</p>
                        <p>Building No: 64</p>
                        <p>Street: 3083</p>
                        <p>Zone: 91</p>
                        <p className="font-semibold text-slate-800">Doha - Qatar</p>
                    </div>
                </div>

                {/* 2. Grid Section - "AFFIX" Layout */}
                <div className="border border-gray-400 mb-6 text-sm">
                    {/* Row 1 - Customer and DN Details */}
                    <div className="flex border-b border-gray-400 items-stretch">
                        {/* Top Left: Customer Details */}
                        <div className="w-[50%] border-r border-gray-400 p-4 flex flex-col justify-center bg-teal-50/50 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600"></div>
                            <p className="text-[#0f766e] inline-block mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Company Name</p>
                            <p className="font-black uppercase text-xl text-slate-900 leading-none drop-shadow-sm">{data.customerName}</p>
                        </div>

                        {/* Top Right: DN Details */}
                        <div className="w-[50%] text-[10px] flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Delivery Note No.</div>
                                <div className="flex-grow p-1 font-black pl-3 text-red-600 text-[12pt] break-words flex items-center">{data.ticketNo}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Date</div>
                                <div className="flex-grow p-1 pl-3 font-black text-[10pt] break-words flex items-center">{formatDate(data.deliveryDate)}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Invoice Number</div>
                                <div className="flex-grow p-1 pl-3 font-black text-emerald-600 text-[11pt] break-words flex items-center">{data.invoiceNo || 'N/A'}</div>
                            </div>
                            <div className="flex border-b border-gray-400 min-h-[28px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Service Type</div>
                                <div className="flex-grow p-1 pl-3 font-black uppercase text-[10pt] break-words flex items-center">{data.noteCategory}</div>
                            </div>
                            <div className="flex min-h-[28px] items-stretch">
                                <div className="w-32 p-1 bg-gray-100/80 font-bold flex items-center border-r border-gray-400 px-2 uppercase text-[8px]">LPO NO.</div>
                                <div className="flex-grow p-1 pl-3 font-black uppercase text-[10pt] break-words flex items-center">{data.poNo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row */}
                    <div className="flex items-stretch border-b border-gray-400">
                        {/* Middle Left: Location */}
                        <div className="w-[50%] border-r border-gray-400 flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[32px] items-stretch flex-1">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Delivered From</div>
                                <div className="flex-grow p-1 pl-4 font-medium text-slate-800 text-[11pt] break-words leading-tight flex items-center">{data.subject}</div>
                            </div>
                            <div className="flex min-h-[32px] items-stretch flex-1">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-100/80 font-bold flex items-center px-2 uppercase text-[8px]">Delivery Location</div>
                                <div className="flex-grow p-1 pl-4 font-medium text-slate-800 text-[11pt] break-words leading-tight flex items-center">{data.projectLocation}</div>
                            </div>
                        </div>

                        {/* Middle Right: Vehicle & Driver */}
                        <div className="w-[50%] text-[10px] flex flex-col">
                            <div className="flex border-b border-gray-400 min-h-[32px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[8px]">Vehicle No</div>
                                <div className="flex-grow p-1 pl-3 uppercase font-black text-gray-900 text-[10pt] break-words flex items-center">{data.vehicleNo}</div>
                            </div>
                            <div className="flex min-h-[48px] items-stretch">
                                <div className="w-32 p-1 border-r border-gray-400 bg-gray-50 font-bold flex items-center px-2 uppercase text-[8px]">Driver Name</div>
                                <div className="flex-grow p-1 pl-3 uppercase font-black text-[10pt] break-words leading-tight flex items-center">{data.driverName || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Items Table - Updated Columns */}
                <div className="border border-gray-400 mb-2 min-h-[450px] flex flex-col">
                    <table className="w-full text-xs table-fixed">
                        <thead>
                            <tr className="border-b border-gray-400 bg-gray-200">
                                <th className="w-12 border-r border-gray-400 py-2 font-black text-black uppercase text-[9px] tracking-widest">S.No</th>
                                <th className="w-64 border-r border-gray-400 py-2 font-black text-black uppercase text-[9px] tracking-widest text-left pl-3">Item Name</th>
                                <th className="w-22 border-r border-gray-400 py-2 font-black text-black uppercase text-[9px] tracking-widest">Qty</th>
                                <th className="w-64 border-r border-gray-400 py-2 font-black text-black uppercase text-[9px] tracking-widest text-left pl-3">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {filledRows.map((item, idx) => (
                                <tr key={idx} className="min-h-12 align-top">
                                    <td className="border-r border-gray-400 text-center text-gray-600 py-3">{idx + 1}</td>
                                    <td className="border-r border-gray-400 px-3 py-3 text-gray-800 uppercase leading-snug">
                                        <div className="font-black text-[9pt] mb-0.5">{item.name}</div>
                                        {item.itemCode && <div className="text-[9px] font-bold text-gray-500">Item Code: {item.itemCode}</div>}
                                    </td>
                                    <td className="border-r border-gray-400 text-center py-3">
                                        <div className="font-black text-[9pt] leading-none mb-1">{item.quantity}</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">{item.unit}</div>
                                    </td>
                                    <td className="border-r border-gray-400 px-3 py-3 text-gray-700 text-[8.5pt] font-medium normal-case break-words leading-snug">
                                        {item.description || ''}
                                    </td>
                                </tr>
                            ))}
                            {/* Empty Filler Rows */}
                            {emptyRows.map((_, idx) => (
                                <tr key={`empty-${idx}`} className="h-10">
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                    <td className="border-r border-gray-400"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-auto border-t border-gray-400 flex text-xs font-black h-12 items-center bg-gray-50 uppercase tracking-widest">
                        <div className="flex-grow text-right pr-6 border-r border-gray-400 h-full flex items-center justify-end text-gray-500">Total Delivery Volume</div>
                        <div className="w-[110px] h-full bg-white flex items-center justify-center">
                            <div className="w-24 text-center text-[#0f766e] text-lg tabular-nums font-black">{totalQuantity}</div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-10 px-2 mt-4">
                    <div className="text-[9pt] font-black uppercase text-gray-800 tracking-tight">Received above items in good condition</div>
                    <div className="text-right text-[8pt] font-bold italic tracking-widest text-gray-400">E & O.E</div>
                </div>

                {/* 4. Footer Signatures - PROSERVE Style Dotted */}
                <div className="mt-auto pt-4 pb-2">
                    <div className="flex justify-between gap-16 font-bold text-xs text-gray-800 uppercase tracking-tight">
                        {/* Left: Delivered By */}
                        <div className="w-1/2 flex flex-col gap-4">
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black">DELIVERED BY:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2 text-slate-900 font-black">{data.deliveredBy?.deliveredByName || ''}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black">MOB NO:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2">{data.deliveredBy?.deliveredByMobile}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black">DATE:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2">{formatDate(data.deliveredBy?.deliveredDate)}</span>
                            </div>
                            <div className="flex items-end mt-2">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">SIGNATURE:</span>
                                <div className="flex-grow border-b border-dotted border-gray-400 h-6"></div>
                            </div>
                        </div>

                        {/* Right: Received By */}
                        <div className="w-1/2 flex flex-col gap-3">
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">RECEIVED BY:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2 text-slate-900 font-black truncate">{data.receivedBy?.receivedByName}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">MOB NO:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2 font-black">{data.receivedBy?.receivedByMobile}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">QID:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2 font-black">{data.receivedBy?.qatarId || ''}</span>
                            </div>
                            <div className="flex items-end">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">DATE:</span>
                                <span className="flex-grow border-b border-dotted border-gray-400 px-2">{formatDate(data.receivedBy?.receivedDate)}</span>
                            </div>
                            <div className="flex items-end mt-2">
                                <span className="w-32 flex-shrink-0 text-gray-400 text-[9px] font-black uppercase">SIGNATURE:</span>
                                <div className="flex-grow border-b border-dotted border-gray-400 h-6"></div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Bottom Note */}
                    <div className="text-center text-[7pt] text-gray-400 font-bold uppercase tracking-[0.3em] mt-16 mb-4">
                        This is a Computer Generated Document.
                    </div>
                </div>

                {/* 6. Company Footer - Solid Green Bar */}
                <div className="mt-4 text-center text-white font-sans bg-[#0f766e] py-4 -mx-10 px-10 mb-[-32px]">
                    <div className="flex flex-col gap-1.5 text-[8.5pt] font-bold leading-tight tracking-wide">
                        <div className="flex items-center justify-center gap-4">
                            <span>Mob: +974 3030 3613</span>
                            <span className="w-1 h-1 bg-teal-400 rounded-full" />
                            <span>Tel: +974 4421 4042</span>
                            <span className="w-1 h-1 bg-teal-400 rounded-full" />
                            <span>E-mail: info@proservets.com</span>
                            <span className="w-1 h-1 bg-teal-400 rounded-full" />
                            <span>Website: www.proservets.com</span>
                        </div>
                        <div className="border-t border-teal-400/30 pt-2 mt-1 opacity-90 text-[7pt] font-black uppercase tracking-widest flex items-center justify-center gap-6">
                            <span>C.R. No: 147701</span>
                            <span>P.O. Box: 9044</span>
                            <span>Bldg No: 64, Street: 3083, Zone: 91</span>
                            <span>Doha - State of Qatar</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    );

};

export default DeliveryTicketPreview;
