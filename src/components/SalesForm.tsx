'use client';

import { FollowUpEntry, Sale } from '@/lib/types';
import { getLastEnquiries, getNextTicketNo } from '@/services/salesApi';
import { FormikProvider, useFormik } from 'formik';
import { ClipboardList, Edit3, UserPlus, Upload, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikPhoneInput } from '@/components/shared/FormikPhoneInput';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';
import { getFileUrl } from '@/app/utils/fileUtils';

const toISODate = (value?: string) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

const SaleValidationSchema = Yup.object({
  companyName: Yup.string().trim().required('Company name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  contactPersonMobile: Yup.string()
    .matches(/^\+?[1-9]\d{6,14}$/, 'Enter valid mobile number')
    .required('Mobile number is required'),
  contactThrough: Yup.string()
    .oneOf(['Email', 'Phone', 'WhatsApp', 'Both', 'Other'])
    .required(),
  referenceNo: Yup.string().trim().required('Reference number is required'),
  position: Yup.string().trim().required('Position is required'),
  name: Yup.string().trim().required('Name is required'),
  location: Yup.string().trim().required('Location is required'),
  date: Yup.string().required('Date is required'),
  followUpDate: Yup.string().optional(),
  remarks: Yup.string().optional(),
  businessType: Yup.string().required('Business type is required'),
  contactedBy: Yup.string().required('Contacted by is required'),
  status: Yup.string().required('Status is required'),
});

interface SalesFormProps {
  initialData?: Sale;
  onSubmit?: (salesData: FormData) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
  isLoading: boolean;
}

const SalesForm: React.FC<SalesFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  isLoading,
}) => {
  const [lastEnquiries, setLastEnquiries] = useState<Sale[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const formik = useFormik({
    initialValues: {
      ticketNo: initialData?.ticketNo || '',
      companyName: initialData?.companyName || '',
      position: initialData?.position || '',
      email: initialData?.email || '',
      contactPersonMobile: initialData?.contactPersonMobile || '',
      contactThrough: initialData?.contactThrough || 'Other',
      referenceNo: initialData?.referenceNo || '',
      name: initialData?.name || '',
      location: initialData?.location || '',
      date: toISODate(initialData?.date) || today,
      followUpDate: toISODate(initialData?.nextFollowUpDate) || '',
      remarks: initialData?.remarks || '',
      businessType: initialData?.businessType || '',
      contactedBy: initialData?.contactedBy || '',
      status: initialData?.status || 'New Lead',
      attachments: initialData?.attachments || [],
      attachmentPreview:
        initialData?.attachments?.map((url) => ({
          name: url.split('/').pop() || 'attachment',
          url,
          isNew: false,
        })) || [],
    },
    validationSchema: SaleValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!onSubmit) return;
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'attachments' && key !== 'attachmentPreview' && key !== 'removed_op_attachments') {
            formData.append(key, value as string);
          }
        });
        if (Array.isArray(values.attachments)) {
          values.attachments.forEach((file) => {
            if (typeof file !== 'string') formData.append('attachments', file);
          });
        }
        if (removedAttachments.length > 0) {
          formData.append('removed_op_attachments', JSON.stringify(removedAttachments));
        }
        await onSubmit(formData);
      } catch (error) {
        toast.error('Failed to submit form.');
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const fetchTicket = async () => {
      if (!isEditMode) {
        try {
          const nextNo = await getNextTicketNo();
          formik.setFieldValue('ticketNo', nextNo);
        } catch (err) {
          toast.error('Failed to fetch ticket number.');
        }
      }
    };
    fetchTicket();
  }, [isEditMode]);

  useEffect(() => {
    const fetchLastEnquiries = async () => {
      if (isEditMode) return;
      const searchKey =
        formik.values.companyName ||
        formik.values.name ||
        formik.values.contactPersonMobile;

      if (!searchKey || searchKey.length < 3) return;
      try {
        setLoadingEnquiries(true);
        const response = await getLastEnquiries(searchKey);
        setLastEnquiries(response || []);
      } catch (err) {
        toast.error('Failed to fetch last enquiries.');
        setLastEnquiries([]);
      } finally {
        setLoadingEnquiries(false);
      }
    };

    const timer = setTimeout(fetchLastEnquiries, 600);
    return () => clearTimeout(timer);
  }, [
    isEditMode,
    formik.values.companyName,
    formik.values.name,
    formik.values.contactPersonMobile,
  ]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-2 py-4 rounded-lg">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Business Development</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Register'} <span className="gradient-text">Enquiry</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? `Refining details for Ticket #${formik.values.ticketNo}. Ensure follow-up strategies are updated to maintain lead momentum.`
              : 'Capture a new commercial opportunity. Define client needs, communication strategy, and initial contact parameters.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10" autoComplete="off">
          <Section eyebrow="Account Setup" title="Client" highlight="Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikInput
                label="Company Name"
                name="companyName"
                placeholder="e.g. Acme Corporation"
                required
              />
              <FormikInput
                label="Contact Person"
                name="name"
                placeholder="e.g. John Doe"
                required
              />
              <FormikInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="e.g. john.doe@example.com"
                required
              />
              <FormikInput
                label="Position / Designation"
                name="position"
                placeholder="e.g. Purchase Manager"
                required
              />
              <FormikPhoneInput
                label="Mobile Number"
                name="contactPersonMobile"
                required
              />
              <FormikInput
                label="Location"
                name="location"
                placeholder="e.g. Mumbai"
                required
              />
              <FormikInput
                label="Business Type"
                name="businessType"
                placeholder="e.g. Scaffolding, Construction"
                required
              />

            </div>
          </Section>

          <Section eyebrow="Lead Intake" title="Enquiry" highlight="Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikInput
                label="Ticket No"
                name="ticketNo"
                readOnly
                required
              />
              <FormikInput
                label="Enquiry Date"
                name="date"
                type="date"
                required
              />
              <FormikSelect
                label="Enquiry Status"
                name="status"
                options={[
                  { value: 'New Lead', label: 'New Lead' },
                  { value: 'Call Required', label: 'Call Required' },
                  { value: 'Contacted', label: 'Contacted' },
                  { value: 'Follow-Up', label: 'Follow-Up' },
                  { value: 'Quotation Sent', label: 'Quotation Sent' },
                  { value: 'Negotiation', label: 'Negotiation' },
                  { value: 'Interested', label: 'Interested' },
                  { value: 'Not Interested', label: 'Not Interested' },
                  { value: 'On Hold', label: 'On Hold' },
                  { value: 'PO Received', label: 'PO Received' },
                  { value: 'Payment Pending', label: 'Payment Pending' },
                  { value: 'Processing', label: 'Processing' },
                  { value: 'Shipped', label: 'Shipped' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Request to Developer', label: 'Request to Developer' },
                ]}
                required
              />
              <FormikSelect
                label="Contact Method"
                name="contactThrough"
                options={[
                  { value: 'Email', label: 'Email' },
                  { value: 'Phone', label: 'Phone' },
                  { value: 'WhatsApp', label: 'WhatsApp' },
                  { value: 'Both', label: 'Both' },
                  { value: 'Other', label: 'Other' },
                ]}
                required
              />
              <FormikInput
                label="Reference Number"
                name="referenceNo"
                placeholder="e.g. ENQ-2024-123"
                required
              />
              <FormikInput
                label="Contacted By"
                name="contactedBy"
                placeholder="e.g. Sales Team / Name"
                required
              />
            </div>
            <div className="mt-8">
              <FormikTextarea
                label="Remarks / Notes"
                name="remarks"
                placeholder="Add any additional notes or details about the enquiry..."
                rows={4}
              />
            </div>
          </Section>

          <Section eyebrow="Engagement Registry" title="Follow Up" highlight="History">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white/50 backdrop-blur-sm 
                     flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 
                     hover:bg-teal-50/5 transition-all group"
              onClick={() => document.getElementById('attachmentsInput')?.click()}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-gray-700 text-sm font-bold tracking-tight">
                Click to upload attachments
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                PDF, DOC, XLS, JPG, PNG allowed (Multiple)
              </p>
              <input
                id="attachmentsInput"
                type="file"
                hidden
                multiple
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  const newPreviews = newFiles.map((file) => ({
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    isNew: true,
                    file: file,
                    url: URL.createObjectURL(file),
                  }));
                  formik.setFieldValue('attachments', [
                    ...formik.values.attachments,
                    ...newFiles,
                  ]);
                  formik.setFieldValue('attachmentPreview', [
                    ...formik.values.attachmentPreview,
                    ...newPreviews,
                  ]);
                }}
              />
            </div>

            {formik.values.attachmentPreview?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Selected Files
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formik.values.attachmentPreview.map(
                    (
                      file: {
                        name: string;
                        size?: string;
                        url: string;
                        isNew: boolean;
                      },
                      idx: number
                    ) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-3 
                                 border border-gray-100 shadow-sm hover:border-teal-100 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <ClipboardList className="w-5 h-5 text-teal-500" />
                          </div>
                          <div className="min-w-0">
                            <a
                              href={getFileUrl(file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-gray-800 hover:text-teal-700 truncate block"
                            >
                              {file.name}
                            </a>
                            <p className="text-[10px] text-gray-400 font-medium">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const itemToRemove = formik.values.attachmentPreview[idx];
                            const updatedPreviews = formik.values.attachmentPreview.filter(
                              (_: any, i: number) => i !== idx
                            );
                            formik.setFieldValue('attachmentPreview', updatedPreviews);

                            if (itemToRemove.isNew) {
                              const updatedFiles = formik.values.attachments.filter((f: any) => {
                                if (f instanceof File) return f.name !== itemToRemove.name;
                                return true;
                              });
                              formik.setFieldValue('attachments', updatedFiles);
                            } else {
                              setRemovedAttachments([...removedAttachments, itemToRemove.url]);
                              const updatedFiles = formik.values.attachments.filter((url: any) => url !== itemToRemove.url);
                              formik.setFieldValue('attachments', updatedFiles);
                            }
                          }}
                          className="p-2 hover:bg-teal-50 rounded-lg text-gray-300 hover:text-teal-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className={`px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 ${formik.isSubmitting || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800'
                }`}
            >
              {isEditMode ? 'Update Enquiry' : 'Save Enquiry'}
            </button>
          </div>
        </form>
      </FormikProvider>

      {!isEditMode && (
        <div className="mt-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-6 h-6 text-teal-700" />
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">
              Last Enquiry Details
            </h3>
          </div>
          {loadingEnquiries ? (
            <p className="text-sm text-gray-400 italic font-medium">
              Searching for similar records...
            </p>
          ) : lastEnquiries.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="akod-table text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-widest text-center">
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Company</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Mobile</th>
                    <th className="py-4 px-4">Ref No</th>
                    <th className="py-4 px-4">Contacted By</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Follow-Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lastEnquiries.map((enq, idx) => (
                    <tr
                      key={idx}
                      className="text-[13px] text-gray-700 hover:bg-gray-50 transition group cursor-default text-center"
                    >
                      <td className="py-4 px-4 font-bold text-gray-900">{enq.name}</td>
                      <td className="py-4 px-4">{enq.companyName}</td>
                      <td className="py-4 px-4 text-sky-600 font-medium">{enq.email}</td>
                      <td className="py-4 px-4 font-mono">{enq.contactPersonMobile}</td>
                      <td className="py-4 px-4 group-hover:text-teal-700 font-bold transition-colors">{enq.referenceNo}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-gray-600">
                          {enq.contactedBy || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded border border-sky-100 bg-sky-50 text-sky-600">
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-500 italic">
                        {enq.nextFollowUpDate || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic font-medium">
              No previous enquiries found matching current details.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesForm;
