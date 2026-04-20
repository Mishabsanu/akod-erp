'use client';

import formatDateToYYYYMMDD from '@/app/utils/formatDateToYYYYMMDD';
import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { DeliveryTicket, ReturnTicket } from '@/lib/types';
import { getCustomers } from '@/services/customerApi';
import {
  getDeliveryTicketByPo,
  GetNextReturnTicketNo,
  getPODropdown,
} from '@/services/returnTicketApi';
import { getRunningOrderById, getRunningOrdersDropdown } from '@/services/runningOrderApi';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { FilePlus } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import * as Yup from 'yup';
import { FormikPhoneInput } from './shared/FormikPhoneInput';
import ReturnTicketPreview from './return-ticket/ReturnTicketPreview';

const STAFF_LIST = [
  { name: 'MANSOOR', phone: '70814261' },
  { name: 'RASEEM', phone: '70814262' },
  { name: 'MUSTHAFA', phone: '70814263' },
  { name: 'THASHNEEB', phone: '70814264' },
  { name: 'BASIL', phone: '31214455' },
  { name: 'KARK', phone: '66069200' },
  { name: 'SHIFAN', phone: '71513931' },
];

const LOCATION_OPTIONS = [
  { value: 'Client Yard', label: 'Client Yard' },
  { value: 'Client Site', label: 'Client Site' },
  { value: 'Company Yard', label: 'Company Yard' },
  { value: 'Project Laydown Area', label: 'Project Laydown Area' },
  { value: 'Fabrication Yard', label: 'Fabrication Yard' },
  { value: 'Other', label: 'Manual Entry' },
];

const LineItemValidationSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  name: Yup.string().required('Product name is required'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string(),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .min(0, 'Min 0')
    .required('Quantity is required'),
  returnQty: Yup.number()
    .typeError('Return quantity must be a number')
    .min(0, 'Cannot be negative')
    .test(
      'is-less-than-available',
      'Return quantity cannot exceed balance quantity',
      function (value) {
        const { quantity, totalReturnedQty } = this.parent;
        const balanceQty = (quantity || 0) - (totalReturnedQty || 0);
        return value !== undefined && value !== null && value <= balanceQty;
      }
    ),
});

const validationSchema = Yup.object().shape({
  returnDate: Yup.string().required('Return date is required'),
  subject: Yup.string().required('Subject is required'),
  projectLocation: Yup.string().required('Project location is required'),
  noteCategory: Yup.string().required('Note category is required'),
  vehicleNo: Yup.string(),

  items: Yup.array()
    .of(LineItemValidationSchema)
    .min(1, 'At least one item is required'),

  deliveredBy: Yup.object().shape({
    deliveredByName: Yup.string().required('Delivered by name is required'),
    deliveredByMobile: Yup.string()
      .matches(/^\+?\d{8,15}$/, 'Invalid mobile number')
      .required('Delivered by mobile is required'),
    deliveredDate: Yup.date().nullable().required('Delivered date is required'),
  }),
  receivedBy: Yup.object().shape({
    receivedByName: Yup.string().required('Received by name is required'),
    receivedByMobile: Yup.string()
      .matches(/^\+?\d{8,15}$/, 'Invalid mobile number')
      .required('Received by mobile is required'),
    qatarId: Yup.string(),
    receivedDate: Yup.date().nullable().required('Received date is required'),
  }),
});

const ReturnTicketForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  backendErrors = {},
  isLoading = false,
}: {
  initialData?: Partial<ReturnTicket>;
  onSubmit: (
    ticket: Partial<ReturnTicket>,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  backendErrors?: { [key: string]: string };
  isLoading?: boolean;
}) => {
  const [customers, setCustomers] = useState<
    { value: string; label: string }[]
  >([]);
  const [purchaseOrders, setPurchaseOrders] = useState<
    { value: string; label: string }[]
  >([]);
  const [runningOrders, setRunningOrders] = useState<any[]>([]);
  const [isPoSelected, setIsPoSelected] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [customerRes, roRes] = await Promise.all([
          getCustomers({}, 1, 9999),
          getRunningOrdersDropdown(),
        ]);

        if (customerRes?.customers) {
          setCustomers(
            customerRes.customers.map((c) => ({ value: c._id!, label: c.name }))
          );
        }

        if (roRes) {
          setRunningOrders(roRes.map((ro: any) => ({
            ...ro,
            label: ro.invoice_number || ro.order_number,
            value: ro._id
          })));

          setPurchaseOrders(roRes.map((ro: any) => ({ value: ro.po_number, label: ro.po_number })));
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);


  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: initialData?.customerId || '',
      runningOrderId: initialData?.runningOrderId || '',
      customerName: initialData?.customerName || '',
      parentTicketNo: initialData?.parentTicketNo,
      returnDate: formatDateToYYYYMMDD(initialData?.returnDate || new Date()),
      ticketType: initialData?.ticketType || 'Return Note',
      ticketNo: initialData?.ticketNo,
      poNo: initialData?.poNo || '',
      invoiceNo: initialData?.invoiceNo || '',
      referenceNo: initialData?.referenceNo || '',
      subject: initialData?.subject || '',
      projectLocation: initialData?.projectLocation || '',
      noteCategory: initialData?.noteCategory || 'Sale',
      vehicleNo: initialData?.vehicleNo || '',
      items:
        initialData?.items && initialData.items.length > 0
          ? initialData.items.map((item) => ({
            ...item,
            returnQty: item.returnQty || 0,
          }))
          : [
            {
              productId: '',
              name: '',
              unit: '',
              description: '',
              quantity: 0,
              totalReturnedQty: 0,
              returnQty: 0,
            },
          ],
      deliveredBy: {
        deliveredByName: initialData?.deliveredBy?.deliveredByName || '',
        deliveredByMobile: initialData?.deliveredBy?.deliveredByMobile || '',
        deliveredDate: formatDateToYYYYMMDD(
          initialData?.deliveredBy?.deliveredDate || new Date()
        ),
      },
      receivedBy: {
        receivedByName: initialData?.receivedBy?.receivedByName || '',
        receivedByMobile: initialData?.receivedBy?.receivedByMobile || '',
        qatarId: initialData?.receivedBy?.qatarId || '',
        receivedDate: formatDateToYYYYMMDD(
          initialData?.receivedBy?.receivedDate || new Date()
        ),
      },
    },
    validationSchema,
    onSubmit: (values, { setErrors, setSubmitting }) => {
      const selectedCustomer = customers.find(
        (c) => c.value === values.customerId
      );
      const customerName = selectedCustomer
        ? selectedCustomer.label
        : values.customerName;

      const payload: Partial<ReturnTicket> = {
        ...values,
        returnDate: new Date(values.returnDate).toISOString(),
        deliveredBy: {
          ...values.deliveredBy,
          deliveredDate: new Date(
            values.deliveredBy.deliveredDate
          ).toISOString(),
        },
        receivedBy: {
          ...values.receivedBy,
          receivedDate: new Date(values.receivedBy.receivedDate).toISOString(),
        },
        customerName: customerName,
        items: values.items.map((r: any) => ({
          productId: r.productId,
          name: r.name,
          itemCode: r.itemCode,
          unit: r.unit,
          description: r.description,
          returnQty: Number(r.returnQty) || 0,
          quantity: Number(r.quantity) || 0,
        })),
      };
      onSubmit(payload, { setErrors, setSubmitting });
    },
  });

  const filteredRunningOrders = useMemo(() => {
    if (!formik.values.customerId) return runningOrders;

    const customer = customers.find(c => c.value === formik.values.customerId);
    if (customer) {
      const filtered = runningOrders.filter(ro =>
        (ro.company_name && ro.company_name === customer.label) ||
        (ro.client_name && ro.client_name === customer.label)
      );
      // If no invoices found for this specific customer, show all to avoid "empty dropdown" confusion
      return filtered.length > 0 ? filtered : runningOrders;
    }
    return runningOrders;
  }, [formik.values.customerId, runningOrders, customers]);

  /* ---------------- PREVIEW STATE ---------------- */
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePreview = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      setIsPreviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      if (errors.items && Array.isArray(errors.items)) {
        formik.setFieldTouched('items', true);
      }
    }
  };

  useEffect(() => {
    const autoFillFromPO = async () => {
      // Define a base empty/default state for the form
      const baseEmptyFormState = {
        customerId: formik.values.customerId || '',
        customerName: formik.values.customerName || '',
        runningOrderId: formik.values.runningOrderId || '',
        returnDate: new Date().toISOString().slice(0, 10), // Default to today
        reason: '',
        ticketType: 'Return Note',
        ticketNo: formik.values.ticketNo || '',
        poNo: formik.values.poNo || '',
        invoiceNo: formik.values.invoiceNo || '',
        referenceNo: '',
        subject: formik.values.subject || '',
        projectLocation: formik.values.projectLocation || '',
        noteCategory: formik.values.noteCategory || '',
        vehicleNo: '',
        items: [
          {
            productId: '',
            name: '',
            itemCode: '',
            unit: '',
            description: '',
            quantity: 0,
            totalReturnedQty: 0,
            returnQty: 0,
          },
        ],
        deliveredBy: {
          deliveredByName: '',
          deliveredByMobile: '',
          deliveredDate: new Date().toISOString().slice(0, 10),
        },
        receivedBy: {
          receivedByName: '',
          receivedByMobile: '',
          qatarId: '',
          receivedDate: new Date().toISOString().slice(0, 10),
        },
      };

      if (formik.values.poNo) {
        // PO is selected: fetch and populate
        try {
          const deliveryTicket: any = await getDeliveryTicketByPo(formik.values.poNo);

          if (deliveryTicket) {
            // EDIT MODE: Merge stats only, do NOT reset form
            if (isEditMode && formik.values.poNo === initialData?.poNo) {
              const updatedItems = formik.values.items.map((currentItem: any) => {
                const poItem = deliveryTicket.items.find(
                  (i: any) => i.itemCode === currentItem.itemCode
                );
                if (!poItem) return currentItem;

                // Calculate Previously Returned (Total - Current Saved Return)
                const initialItem = initialData?.items?.find(
                  (i) => i.itemCode === currentItem.itemCode
                );
                const thisTicketInitialReturn = Number(initialItem?.returnQty) || 0;
                const totalReturnedSoFar = Number(poItem.returnedQty) || 0;
                const previouslyReturned = Math.max(
                  0,
                  totalReturnedSoFar - thisTicketInitialReturn
                );

                return {
                  ...currentItem,
                  quantity: Number(poItem.quantity) || 0, // Update Delivered Qty
                  totalReturnedQty: previouslyReturned, // Update Previously Returned
                };
              });

              formik.setFieldValue('items', updatedItems);
              setIsPoSelected(true);
              return;
            }

            // NEW MODE: Full Auto-fill
            const mappedItems = (deliveryTicket.items || []).map((item: any) => {
              const deliveredQty = Number(item.quantity) || 0;
              const returnedQty = Number(item.returnedQty) || 0;
              const availableQty = Math.max(deliveredQty - returnedQty, 0);

              return {
                productId: item.productId || item.product?._id || '',
                name: item.name || item.product?.name || '',
                itemCode: item.itemCode || item.product?.itemCode || '',
                unit: item.unit || item.product?.unit || '',
                description: item.description || '',
                quantity: deliveredQty,
                totalReturnedQty: returnedQty,
                returnQty: availableQty,
              };
            });

            formik.setValues({
              ...baseEmptyFormState,
              poNo: formik.values.poNo,
              customerId: deliveryTicket.customerId || formik.values.customerId,
              customerName: deliveryTicket.customerName || formik.values.customerName,
              parentTicketNo: deliveryTicket.ticketNo,
              subject: deliveryTicket.subject || formik.values.subject,
              projectLocation: deliveryTicket.projectLocation || formik.values.projectLocation,
              noteCategory: deliveryTicket.noteCategory || formik.values.noteCategory,
              vehicleNo: deliveryTicket.vehicleNo || formik.values.vehicleNo,
              invoiceNo: deliveryTicket.invoiceNo || formik.values.invoiceNo,
              referenceNo: deliveryTicket.referenceNo || formik.values.referenceNo,
              items: mappedItems.length > 0 ? mappedItems : baseEmptyFormState.items,
              reason: '',
            } as any);
            setIsPoSelected(true);
          }
        } catch (error) {
          console.error('Failed to fetch delivery ticket details:', error);
          setIsPoSelected(false);
        }
      } else if (!isEditMode) {
        // PO is deselected and not in edit mode: reset to empty form state
        // formik.setValues(baseEmptyFormState as any);
        setIsPoSelected(false);
      }
    };
    autoFillFromPO();
  }, [formik.values.poNo, formik.setValues]);

  useEffect(() => {
    if (backendErrors) {
      Object.keys(backendErrors).forEach((key) => {
        formik.setFieldError(key, backendErrors[key]);
      });
    }
  }, [backendErrors]);

  useEffect(() => {
    if (isEditMode) return;
    const fetchTicketNo = async () => {
      try {
        const res = await GetNextReturnTicketNo();

        if (res?.success && res.data) {
          console.log('GetNextReturnTicketNo response:', res);
          formik.setFieldValue('ticketNo', res.data);
        }
      } catch (error) {
        console.error('Failed to fetch ticket number', error);
      }
    };
    fetchTicketNo();
  }, [isEditMode]);

  if (isPreviewMode) {
    return (
      <ReturnTicketPreview
        data={formik.values}
        onBack={() => setIsPreviewMode(false)}
        onConfirm={formik.submitForm}
        isSubmitting={isLoading || formik.isSubmitting}
      />
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Logistics Management</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Initialize'} <span className="gradient-text">Return Ticket</span>
          </h1>
          <p className="page-header-description">
            {isEditMode
              ? 'Update the details of this return authorization. Ensure the returned quantities are verified against the original delivery.'
              : 'Initialize a new return process. Select the original PO to auto-fill delivered quantities and track returns.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 1. SELECT COMPANY FIRST */}
              <FormikSelect
                label="Company Name"
                name="customerId"
                options={customers}
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  const product = availableProducts.find((p) => {
                    const pId = (p.productId?._id || p.productId)?.toString();
                    const targetId = (e.target.value?._id || e.target.value)?.toString();
                    return pId && targetId && pId === targetId;
                  });
                  const selected = customers.find(c => c.value === e.target.value);
                  if (selected) {
                    formik.setFieldValue('customerName', selected.label);
                  }
                  // RESET Invoice selection when Company changes
                  formik.setFieldValue('runningOrderId', '');
                  formik.setFieldValue('poNo', '');
                  formik.setFieldValue('invoiceNo', '');
                  setIsPoSelected(false);
                }}
              />

              {/* 2. SELECT ORDER (Filtered by Company) */}
              <FormikSelect
                label="Invoice Number"
                name="runningOrderId"
                options={formik.values.customerId ? filteredRunningOrders : []}
                disabled={!formik.values.customerId}
                required
                onChange={async (e) => {
                  formik.handleChange(e);
                  const selected = runningOrders.find(ro => ro.value === e.target.value);
                  if (selected) {
                    // Populate basic fields immediately
                    formik.setFieldValue('poNo', selected.po_number || '');
                    formik.setFieldValue('invoiceNo', selected.invoice_number);
                    formik.setFieldValue('subject', selected.location_from || '');
                    formik.setFieldValue('projectLocation', selected.location_to || '');
                    formik.setFieldValue('noteCategory', selected.transaction_type || 'Sale');

                    // This poNo update will trigger the autoFillFromPO useEffect for products
                    setIsPoSelected(true);
                  } else {
                    setIsPoSelected(false);
                  }
                }}
              />

              <FormikInput label="PO Number" name="poNo" readOnly required />

              <FormikInput
                label="Return Date"
                name='returnDate'
                type="date"
                required
              />

              <FormikInput label="Ticket No" name="ticketNo" readOnly />

              <FormikInput
                label="Reference No"
                name="referenceNo"
                disabled={isPoSelected}
              />
              <FormikInput
                label="Subject"
                name="subject"
                required
                disabled={isPoSelected}
              />
              <FormikInput
                label="Project Location"
                name="projectLocation"
                required
                disabled={isPoSelected}
              />
              <FormikSelect
                label="Category"
                name="noteCategory"
                options={[
                  { value: 'Sale', label: 'Sale' },
                  { value: 'Hire', label: 'Hire' },
                  { value: 'Off Hire', label: 'Off Hire' },
                  { value: 'Contract', label: 'Contract' },
                ]}
                required
                disabled={isPoSelected}
              />
              <FormikInput
                label="Vehicle No"
                name="vehicleNo"
                disabled={isPoSelected}
              />
            </div>
          </Section>

          <Section title="Items">
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="overflow-x-auto">
                  <table className="akod-table">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-200">S.No</th>
                        <th className="p-2 border border-gray-200">Product Info</th>
                        <th className="p-2 border border-gray-200 w-24">Item Code</th>
                        <th className="p-2 border border-gray-200 w-20">Unit</th>
                        <th className="p-2 border border-gray-200 w-44">Delivered Qty</th>
                        <th className="p-2 border border-gray-200 w-32 font-black text-teal-800 text-center">Return Qty</th>
                        <th className="p-2 border border-gray-200">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.items.map((row: any, idx: number) => {
                        const deliveredQty = Number(row.quantity) || 0;
                        const previouslyReturned = Number(row.totalReturnedQty) || 0;
                        const balanceAvailable = Math.max(0, deliveredQty - previouslyReturned);

                        return (
                          <tr key={idx}>
                            <td className="p-2 text-center border border-gray-200 text-xs text-gray-500 font-medium">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.name`}
                                readOnly
                                className="font-bold border-none bg-transparent h-auto py-0 shadow-none mb-0 text-sm"
                              />
                            </td>
                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.itemCode`}
                                readOnly
                                className="border-none bg-transparent h-auto py-0 shadow-none mb-0 text-xs text-gray-500"
                              />
                            </td>
                            <td className="p-2 border border-gray-200">
                              <div className="flex justify-center uppercase text-xs font-bold text-gray-400">
                                {row.unit}
                              </div>
                            </td>

                            <td className="p-2 border border-gray-200">
                              <div className="flex flex-col">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.quantity`}
                                  type="number"
                                  readOnly
                                  className="text-center font-bold bg-gray-50"
                                />
                                <div className="flex justify-center mt-1">
                                  <span className="text-[9px] font-black px-1.5 rounded border bg-slate-50 text-slate-500 border-slate-200 uppercase tracking-tighter whitespace-nowrap">
                                    prev. Return: {previouslyReturned}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border border-gray-300 bg-teal-50/20">
                              <div className="flex flex-col">
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.returnQty`}
                                  type="number"
                                  min={0}
                                  className="text-center font-black text-teal-800 border-teal-200 focus:border-teal-500"
                                />
                                <div className="flex justify-center mt-1">
                                  <span className={`text-[9px] font-black px-1.5 rounded border uppercase tracking-tighter whitespace-nowrap ${balanceAvailable > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    Balance to Return: {balanceAvailable}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 border border-gray-200 ">
                              <FormikInput
                                label=""
                                name={`items.${idx}.description`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {formik.values.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-4 text-center text-gray-500"
                          >
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </FieldArray>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Section title="Delivered Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikSelect
                  label="Delivered By (Staff)"
                  name="deliveredBy.deliveredByName"
                  options={STAFF_LIST.map(s => ({ value: s.name, label: s.name }))}
                  required
                  onChange={(e) => {
                    formik.handleChange(e);
                    const staff = STAFF_LIST.find(s => s.name === e.target.value);
                    if (staff) {
                      const phone = staff.phone.startsWith('+') ? staff.phone : `+974${staff.phone}`;
                      formik.setFieldValue('deliveredBy.deliveredByMobile', phone);
                    }
                  }}
                />
                <FormikPhoneInput
                  label="Delivered By Mobile"
                  name="deliveredBy.deliveredByMobile"
                  required
                />
                <FormikInput
                  label="Delivered Date"
                  name="deliveredBy.deliveredDate"
                  type="date"
                  required
                />
              </div>
            </Section>

            <Section title="Receiving Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormikInput
                  label="Received By"
                  name="receivedBy.receivedByName"
                  required
                />
                <FormikPhoneInput
                  label="Received By Mobile"
                  name="receivedBy.receivedByMobile"
                  required
                />
                <FormikInput
                  label="Received Date"
                  name="receivedBy.receivedDate"
                  type="date"
                  required
                />
                <FormikInput label="Qatar ID" name="receivedBy.qatarId" />
              </div>
            </Section>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={isLoading || formik.isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${isLoading || formik.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700'
                }`}
            >
              Preview Return Ticket
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default ReturnTicketForm;
