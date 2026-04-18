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
      'Return quantity cannot exceed available quantity',
      function (value) {
        const { quantity, totalReturnedQty } = this.parent;
        const availableQty = (quantity || 0) - (totalReturnedQty || 0);
        return value !== undefined && value !== null && value <= availableQty;
      }
    ),
});

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  returnDate: Yup.string().required('Return date is required'),
  reason: Yup.string().required('Reason for return is required'),
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
            label: `${ro.invoice_number} (PO: ${ro.po_number || 'N/A'})`,
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
      reason: initialData?.reason || '',
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
    const customer = customers.find(c => c.value === formik.values.customerId);
    if (customer) {
      return runningOrders.filter(ro => 
        (ro.company_name && ro.company_name === customer.label) || 
        (ro.client_name && ro.client_name === customer.label)
      );
    }
    return [];
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
        customerId: '',
        customerName: '',
        returnDate: new Date().toISOString().slice(0, 10), // Default to today
        reason: '',
        ticketType: 'Return Note',
        ticketNo: formik.values.ticketNo || '',
        poNo: '',
        invoiceNo: '',
        referenceNo: '',
        subject: '',
        projectLocation: '',
        noteCategory: '',
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
          const deliveryTicket: DeliveryTicket | null =
            await getDeliveryTicketByPo(formik.values.poNo);

          if (deliveryTicket) {
            // EDIT MODE: Merge stats only, do NOT reset form
            if (isEditMode && formik.values.poNo === initialData?.poNo) {
              const updatedItems = formik.values.items.map((currentItem: any) => {
                const poItem = deliveryTicket.items.find(
                  (i) => i.itemCode === currentItem.itemCode
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
            formik.setValues({
              ...baseEmptyFormState, // Start with empty state to clear all previous autofilled data
              poNo: formik.values.poNo, // Keep the selected PO number
              ticketNo: formik.values.ticketNo,
              customerId: deliveryTicket.customerId,
              customerName: deliveryTicket.customerName,
              parentTicketNo: deliveryTicket.ticketNo,
              subject: deliveryTicket.subject,
              projectLocation: deliveryTicket.projectLocation,
              noteCategory: deliveryTicket.noteCategory,
              vehicleNo: deliveryTicket.vehicleNo,
              invoiceNo: deliveryTicket.invoiceNo,
              referenceNo: deliveryTicket.referenceNo,
              items: deliveryTicket.items.map((item) => {
                const deliveredQty = Number(item.quantity) || 0;
                const returnedQty = Number(item.returnedQty) || 0;
                const availableQty = Math.max(deliveredQty - returnedQty, 0);

                return {
                  productId: item.productId,
                  name: item.name,
                  itemCode: item.itemCode,
                  unit: item.unit,
                  quantity: deliveredQty, // Delivered Qty
                  totalReturnedQty: returnedQty, // UI field
                  returnQty: availableQty, // Editable default
                };
              }),

              reason: deliveryTicket.reason,
              returnDate: baseEmptyFormState.returnDate, // Reset return date to default
            } as any); // Cast to any to bypass strict type checking temporarily
            setIsPoSelected(true);
          }
        } catch (error) {
          console.error('Failed to fetch delivery ticket details:', error);
          // If fetch fails, reset to empty state and de-select PO
          formik.setValues(baseEmptyFormState as any);
          setIsPoSelected(false);
        }
      } else {
        // PO is deselected: reset to empty form state
        formik.setValues(baseEmptyFormState as any);
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
              <FormikSelect
                label="Invoice Number"
                name="runningOrderId"
                options={filteredRunningOrders}
                onChange={(e) => {
                  formik.handleChange(e);
                  const selected = runningOrders.find(ro => ro.value === e.target.value);
                  if (selected) {
                    formik.setFieldValue('poNo', selected.po_number || '');
                    formik.setFieldValue('invoiceNo', selected.invoice_number);
                    
                    // Try to link customer by name
                    const customer = customers.find((c) => c.label === selected.company_name);
                    if (customer) {
                      formik.setFieldValue('customerId', customer.value);
                      formik.setFieldValue('customerName', customer.label);
                      setIsPoSelected(true);
                    }
                  }
                }}
                required
                disabled={!formik.values.customerId}
              />
              <FormikInput label="PO Number" name="poNo" readOnly required />
              <FormikSelect
                label="Company Name"
                name="customerId"
                options={customers}
                required
                disabled={isPoSelected}
                onChange={(e) => {
                  formik.handleChange(e);
                  const selected = customers.find(c => c.value === e.target.value);
                  if (selected) {
                    formik.setFieldValue('customerName', selected.label);
                  }
                  // Reset PO selection when Company changes
                  formik.setFieldValue('runningOrderId', '');
                  formik.setFieldValue('poNo', '');
                  setIsPoSelected(false);
                }}
              />
              <FormikInput
                label="Return Date"
                name="returnDate"
                type="date"
                required
              />
              <FormikInput label="Reason for Return" name="reason" required />
              <FormikInput label="Ticket Type" name="ticketType" readOnly />
              <FormikInput label="Ticket No" name="ticketNo" readOnly />
              <FormikInput
                label="Invoice No"
                name="invoiceNo"
                disabled={isPoSelected}
              />
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
                        <th className="p-2 border border-gray-200">Product</th>
                        <th className="p-2 border border-gray-200">
                          Item Code
                        </th>
                        <th className="p-2 border border-gray-200">Unit</th>

                        <th className="p-2 border border-gray-200">
                          Delivered Qty
                        </th>
                        <th className="p-2 border border-gray-200">
                          Previously Returned
                        </th>
                        <th className="p-2 border border-gray-200">
                          Return Qty
                        </th>
                        <th className="p-2 border border-gray-200">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.items.map((row: any, idx: number) => {
                        return (
                          <tr key={idx}>
                            <td className="p-2 text-center border border-gray-200">
                              {idx + 1}
                            </td>
                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.name`}
                                readOnly
                              />
                            </td>
                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.itemCode`}
                                readOnly
                              />
                            </td>
                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.unit`}
                                readOnly
                              />
                            </td>

                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.quantity`}
                                type="number"
                                readOnly
                              />
                            </td>
                            <td className="p-2 border border-gray-200 bg-sky-50">
                              <FormikInput
                                label=""
                                name={`items.${idx}.totalReturnedQty`}
                                type="number"
                                readOnly
                                className="text-sky-700 font-semibold text-center"
                              />
                            </td>

                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.returnQty`}
                                type="number"
                                min={0}
                              />
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
                <FormikInput
                  label="Delivered By"
                  name="deliveredBy.deliveredByName"
                  required
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
