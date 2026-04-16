'use client';

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
    Truck, 
    Briefcase, 
    User, 
    Calendar, 
    FileText, 
    IndianRupee, 
    DollarSign, 
    Info, 
    CheckCircle,
    ArrowRight,
    Ship
} from 'lucide-react';
import { RunningOrder } from '@/lib/types';

interface RunningOrderFormProps {
    initialData?: Partial<RunningOrder> & { _id?: string };
    onSubmit: (values: any) => void;
    onCancel: () => void;
    isEditMode: boolean;
    isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
    company_name: Yup.string().required('Required'),
    client_name: Yup.string().required('Required'),
    invoice_number: Yup.string().required('Required'),
    po_number: Yup.string().required('Required'),
    invoice_amount: Yup.number().typeError('Must be a number').required('Required'),
    advance_payment: Yup.number().typeError('Must be a number').required('Required'),
    currency: Yup.string().required('Required'),
    ordered_date: Yup.string().required('Required'),
});

const RunningOrderForm: React.FC<RunningOrderFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEditMode,
    isLoading
}) => {

    const formik = useFormik({
        initialValues: {
            company_name: initialData?.company_name || '',
            client_name: initialData?.client_name || '',
            ordered_date: initialData?.ordered_date ? new Date(initialData.ordered_date).toISOString().split('T')[0] : '',
            invoice_number: initialData?.invoice_number || '',
            po_number: initialData?.po_number || '',
            invoice_amount: initialData?.invoice_amount || 0,
            advance_payment: initialData?.advance_payment || 0,
            balance_due: initialData?.balance_due || 0,
            currency: initialData?.currency || 'INR',
            etd: initialData?.etd ? new Date(initialData.etd).toISOString().split('T')[0] : '',
            eta: initialData?.eta ? new Date(initialData.eta).toISOString().split('T')[0] : '',
            remarks: initialData?.remarks || '',
            status: initialData?.status || 'Pending',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            // Auto calc balance due before submit
            const val = {
                ...values,
                balance_due: Number(values.invoice_amount) - Number(values.advance_payment)
            };
            onSubmit(val);
        },
    });

    // Auto calculate balance due locally
    const balanceDue = Number(formik.values.invoice_amount) - Number(formik.values.advance_payment);

    return (
        <div className="w-full max-w-5xl mx-auto font-sans pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f766e]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#0f766e] flex items-center justify-center text-white shadow-lg rotate-3">
                        <Truck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#0f766e] tracking-tight">
                            {isEditMode ? 'Edit Tracking' : 'New Order Tracking'}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm mt-1">Manage manufacturing & delivery timelines</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={() => formik.handleSubmit()}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-[#0f766e] text-white font-bold shadow-lg shadow-[#0f766e]/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                        {isLoading ? 'Saving...' : isEditMode ? 'Update Record' : 'Create Record'}
                        {!isLoading && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-10">
                
                {/* General Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 overflow-hidden">
                    <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                        <Briefcase size={14} className="text-[#0f766e]" />
                        Client & Assignment
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField
                            label="Company Name"
                            name="company_name"
                            value={formik.values.company_name}
                            onChange={formik.handleChange}
                            error={formik.touched.company_name && formik.errors.company_name}
                            placeholder="e.g. Acme Corp"
                            icon={Briefcase}
                        />
                        <InputField
                            label="Client Contact Name"
                            name="client_name"
                            value={formik.values.client_name}
                            onChange={formik.handleChange}
                            error={formik.touched.client_name && formik.errors.client_name}
                            placeholder="e.g. John Doe"
                            icon={User}
                        />
                        <InputField
                            label="Invoice Number"
                            name="invoice_number"
                            value={formik.values.invoice_number}
                            onChange={formik.handleChange}
                            error={formik.touched.invoice_number && formik.errors.invoice_number}
                            placeholder="INV-0000"
                            icon={FileText}
                        />
                        <InputField
                            label="PO Number"
                            name="po_number"
                            value={formik.values.po_number}
                            onChange={formik.handleChange}
                            error={formik.touched.po_number && formik.errors.po_number}
                            placeholder="PO-0000"
                            icon={FileText}
                        />
                    </div>
                </div>

                {/* Logistics & Timelines */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 overflow-hidden">
                    <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                        <Calendar size={14} className="text-[#0f766e]" />
                        Logistics & Timelines
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InputField
                            label="Order Date"
                            name="ordered_date"
                            type="date"
                            value={formik.values.ordered_date}
                            onChange={formik.handleChange}
                            error={formik.touched.ordered_date && formik.errors.ordered_date}
                            icon={Calendar}
                        />
                        <InputField
                            label="ETD (Estimated Delivery)"
                            name="etd"
                            type="date"
                            value={formik.values.etd}
                            onChange={formik.handleChange}
                            icon={Truck}
                        />
                        <InputField
                            label="ETA (Arrival)"
                            name="eta"
                            type="date"
                            value={formik.values.eta}
                            onChange={formik.handleChange}
                            icon={Ship}
                        />
                    </div>
                </div>

                {/* Financial Tracking */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 overflow-hidden">
                    <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                        <IndianRupee size={14} className="text-[#0f766e]" />
                        Financial Tracking
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                            <div className="flex bg-[#f9fafb] rounded-2xl p-1 border-2 border-[#f9fafb]">
                                <button type="button" onClick={() => formik.setFieldValue('currency', 'INR')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formik.values.currency === 'INR' ? 'bg-[#0f766e] text-white shadow-md' : 'text-gray-400'}`}>INR (₹)</button>
                                <button type="button" onClick={() => formik.setFieldValue('currency', 'USD')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formik.values.currency === 'USD' ? 'bg-[#0f766e] text-white shadow-md' : 'text-gray-400'}`}>USD ($)</button>
                            </div>
                        </div>

                        <InputField
                            label={`Invoice Amount (${formik.values.currency})`}
                            name="invoice_amount"
                            type="number"
                            value={formik.values.invoice_amount}
                            onChange={formik.handleChange}
                            error={formik.touched.invoice_amount && formik.errors.invoice_amount}
                            icon={formik.values.currency === 'USD' ? DollarSign : IndianRupee}
                        />
                        <InputField
                            label={`Advance Payment (${formik.values.currency})`}
                            name="advance_payment"
                            type="number"
                            value={formik.values.advance_payment}
                            onChange={formik.handleChange}
                            error={formik.touched.advance_payment && formik.errors.advance_payment}
                            icon={CheckCircle}
                        />
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Calculated Balance Due</p>
                             <p className={`text-4xl font-black tracking-tighter ${balanceDue > 0 ? 'text-[#0f766e]' : 'text-emerald-500'}`}>
                                {formik.values.currency === 'USD' ? '$' : '₹'}{balanceDue.toLocaleString()}
                             </p>
                        </div>
                        
                        <div className="flex-1 w-full md:w-auto">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2 mb-2">
                                <Info size={12} className="text-[#0f766e]" />
                                Remarks / Notes
                            </label>
                            <textarea
                                name="remarks"
                                value={formik.values.remarks}
                                onChange={formik.handleChange}
                                placeholder="Any additional details..."
                                className="w-full h-24 px-5 py-4 bg-[#f9fafb] border-2 border-[#f9fafb] rounded-2xl text-[#0f766e] font-bold transition-all outline-none focus:bg-white focus:border-[#0f766e] focus:shadow-md resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 overflow-hidden">
                    <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-6">Workflow Status</h2>
                    <div className="flex flex-wrap gap-3">
                        {['Pending', 'Production', 'Shipped', 'Delivered', 'Closed'].map(st => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => formik.setFieldValue('status', st)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formik.values.status === st ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-lg shadow-[#0f766e]/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    );
};

const InputField: React.FC<{ label: string; name: string; value: any; onChange: any; placeholder?: string; required?: boolean; error?: any; type?: string; icon?: any }> = ({ label, name, value, onChange, placeholder, error, type = 'text', icon: Icon }) => (
    <div className="space-y-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            {Icon && <Icon size={12} className="text-[#0f766e]" />}
            {label}
        </label>
        <div className="relative group">
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full h-[56px] px-5 py-4 bg-[#f9fafb] border-2 rounded-2xl text-[#0f766e] font-bold transition-all outline-none 
                            ${error ? 'border-teal-100 bg-teal-50/5 focus:border-[#0f766e]' : 'border-[#f9fafb] focus:bg-white focus:border-[#0f766e] focus:shadow-md'}`}
            />
        </div>
        {error && <p className="text-[#0f766e] text-[9px] font-black mt-1 ml-1 uppercase">{error}</p>}
    </div>
);

export default RunningOrderForm;
