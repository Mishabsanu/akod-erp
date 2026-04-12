'use client';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import { DeliveryTicket, PODropdownItem } from '@/lib/types';
import { getCustomers } from '@/services/customerApi';
import { GetNextDeliveryTicketNo } from '@/services/deliveryTicketApi';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import { FilePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { FormikPhoneInput } from './shared/FormikPhoneInput';
import { getAvailableProducts } from '@/services/inventoryApi';

/* ---------------- VALIDATION ---------------- */
const LineItemValidationSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  name: Yup.string().required('Product name is required'),
  itemCode: Yup.string().required('Item code is required'),
  unit: Yup.string().required('Unit is required'),
  description: Yup.string(),
  quantity: Yup.number()
    .typeError('Quantity must be a number')
    .min(1, 'Min 1')
    .required('Quantity is required'),
  requiredQty: Yup.number()
    .typeError('Required Quantity must be a number')
    .min(1, 'Min 1')
    .required('Required Quantity is required'),
});

const validationSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  deliveryDate: Yup.date().nullable().required('Delivery date is required'),
  subject: Yup.string().required('Subject is required'),
  projectLocation: Yup.string().required('Project location is required'),
  poNo: Yup.string().required('Purchase Order No is required'),
  invoiceNo: Yup.string().required('Invoice No is required'),
  noteCategory: Yup.string().required('Note category is required'),
  vehicleNo: Yup.string(),

  items: Yup.array()
    .of(LineItemValidationSchema)
    .min(1, 'At least one item is required')
    .required('At least one item is required'),

  deliveredBy: Yup.object().shape({
    deliveredByName: Yup.string().required('Delivered by name is required'),
    deliveredByMobile: Yup.string()
      .matches(/^\+?[1-9]\d{6,14}$/, 'Invalid mobile number')
      .required('Delivered by mobile is required'),
    deliveredDate: Yup.date().nullable().required('Delivered date is required'),
  }),

  receivedBy: Yup.object().shape({
    receivedByName: Yup.string().required('Received by name is required'),
    receivedByMobile: Yup.string()
      .matches(/^\+?[1-9]\d{6,14}$/, 'Invalid mobile number')
      .required('Received by mobile is required'),
    qatarId: Yup.string(),
    receivedDate: Yup.date().nullable().required('Received date is required'),
  }),
});

/* ================= COMPONENT ================= */
const DeliveryTicketForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  backendErrors = {},
  isLoading = false,
}: {
  initialData?: Partial<DeliveryTicket>;
  onSubmit: (
    ticket: Partial<DeliveryTicket>,
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
  const [availableProducts, setAvailableProducts] = useState<PODropdownItem[]>(
    []
  );
  const [customers, setCustomers] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchProductsAndCustomers = async () => {
      try {
        const productRes = await getAvailableProducts();
        if (productRes) {
          setAvailableProducts(productRes);
        }
        const customerRes = await getCustomers({}, 1, 9999);

        if (customerRes?.customers) {
          setCustomers(
            customerRes.customers.map((c) => ({ value: c._id!, label: c.name }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch products or customers:', error);
      }
    };
    fetchProductsAndCustomers();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: initialData?.customerId || '',
      customerName: initialData?.customerName || '',
      deliveryDate:
        initialData?.deliveryDate || new Date().toISOString().slice(0, 10),
      ticketType: initialData?.ticketType || 'Delivery Note',
      ticketNo: initialData?.ticketNo,
      poNo: initialData?.poNo || '',
      invoiceNo: initialData?.invoiceNo || '',
      referenceNo: initialData?.referenceNo || '',
      subject: initialData?.subject || '',
      projectLocation: initialData?.projectLocation || '',
      noteCategory: initialData?.noteCategory || 'Sale',
      vehicleNo: initialData?.vehicleNo || '',

      items: initialData?.items?.length
        ? initialData.items.map((item: any) => ({
          productId: item.productId || item.product?._id || '', // Handle population
          name: item.name || item.product?.name || '',
          itemCode: item.itemCode || '',
          unit: item.unit || '',
          availableQty: item.availableQty || '',
          requiredQty: item.requiredQty || '',
          quantity: item.quantity || '',
          description: item.description || '', // Ensure description is mapped
        }))
        : [
          {
            productId: '',
            name: '',
            itemCode: '',
            unit: '',
            availableQty: '',
            requiredQty: '',
            quantity: '',
            description: '',
          },
        ],
      deliveredBy: {
        deliveredByName: initialData?.deliveredBy?.deliveredByName || '',
        deliveredByMobile: initialData?.deliveredBy?.deliveredByMobile || '',
        deliveredDate: initialData?.deliveredBy?.deliveredDate
          ? new Date(initialData.deliveredBy.deliveredDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      },
      receivedBy: {
        receivedByName: initialData?.receivedBy?.receivedByName || '',
        receivedByMobile: initialData?.receivedBy?.receivedByMobile || '',
        qatarId: initialData?.receivedBy?.qatarId || '',
        receivedDate: initialData?.receivedBy?.receivedDate
          ? new Date(initialData.receivedBy.receivedDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
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

      const payload: Partial<DeliveryTicket> = {
        ...values,
        customerName: customerName,
        items: values.items.map((r) => ({
          productId: r.productId,
          name: r.name,
          itemCode: r.itemCode,
          unit: r.unit,
          quantity: Number(r.quantity) || 0,
          requiredQty: Number(r.requiredQty) || 0,
          description: r.description || '', // Ensure description is sent
        })),
      };
      onSubmit(payload, { setErrors, setSubmitting });
    },
  });

  /* ---------------- PREVIEW STATE ---------------- */
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Set customerName based on selected customerId
  useEffect(() => {
    // console.log(formik.values.customerId);

    if (formik.values.customerId) {
      const customer = customers.find(
        (c) => c.value === formik.values.customerId
      );
      if (customer) {
        formik.setFieldValue('customerName', customer.label);
      }
    } else {
      formik.setFieldValue('customerName', '');
    }
  }, [formik.values.customerId, customers]);

  /* ---------------- APPLY BACKEND ERRORS ---------------- */
  useEffect(() => {
    if (backendErrors) {
      Object.keys(backendErrors).forEach((key) => {
        formik.setFieldError(key, backendErrors[key]);
      });
    }
  }, [backendErrors]);

  const handleProductSelection = (index: number, productId: string) => {
    const product = availableProducts.find((p) => p._id === productId);
    if (product) {
      formik.setFieldValue(`items.${index}.productId`, product._id);
      formik.setFieldValue(`items.${index}.name`, product.name);
      formik.setFieldValue(`items.${index}.itemCode`, product.itemCode);
      formik.setFieldValue(`items.${index}.unit`, product.unit);
      formik.setFieldValue(`items.${index}.availableQty`, product.availableQty);
    }
  };

  useEffect(() => {
    if (isEditMode) return;
    const fetchTicketNo = async () => {
      try {
        const res = await GetNextDeliveryTicketNo();

        if (res?.success && res.data) {
          formik.setFieldValue('ticketNo', res.data);
        }
      } catch (error) {
        console.error('Failed to fetch ticket number', error);
      }
    };
    fetchTicketNo();
  }, [isEditMode]);

  useEffect(() => {
    if (!availableProducts.length || !formik.values.items.length) return;

    formik.values.items.forEach((item, index) => {
      if (item.productId && !item.availableQty) {
        const product = availableProducts.find((p) => p._id === item.productId);

        if (product) {
          formik.setFieldValue(
            `items.${index}.availableQty`,
            product.availableQty
          );
        }
      }
    });
  }, [availableProducts]);

  const handlePreview = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      setIsPreviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      // Also touch nested fields if any (like items array)
      if (errors.items && Array.isArray(errors.items)) {
        const touchedItems = errors.items.map(() => true); // Simplified touch for array
        formik.setFieldTouched('items', true);
      }
    }
  };

  if (isPreviewMode) {
    // Import dynamically or use the imported component if at top level. 
    // Since I can't easily add top-level imports with replace_file_content in a clean way if not careful, 
    // I will assume I need to add the import at the top separately or rely on user to auto-import (but as agent I must do it).
    // I will use a separate edit to add the import, or include it if I replace the whole file. 
    // Wait, I am replacing a chunk. I need to make sure I add the import.
    // Actually, I can use require or just rely on the component being there if I add the import in a previous step? 
    // No, I should do a multi-replace or just adding the import at top first is safer.
    // For now, let's assume I will add the import in a separate tool call immediately after this one or before.
    // Actually, I'll return the component usage here and fix import in next step.
    const DeliveryTicketPreview = require('./delivery-ticket/DeliveryTicketPreview').default;
    return (
      <DeliveryTicketPreview
        data={formik.values}
        onBack={() => setIsPreviewMode(false)}
        onConfirm={formik.submitForm}
        isSubmitting={isLoading || formik.isSubmitting}
      />
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 px-8 py-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <FilePlus className="text-red-600 w-6 h-6" />
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Delivery Ticket' : 'Add Delivery Ticket'}
          </h2>
        </div>
        <span className="text-sm text-gray-500 italic">
          Fill all required fields to create a delivery ticket
        </span>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="space-y-10">
          {/* 🧱 BASIC INFO */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormikSelect
                label="Customer Name"
                name="customerId"
                options={customers}
                required
                onChange={(e) => {
                  formik.handleChange(e);
                  // Update customerName based on selection
                  const selectedCustomer = customers.find(
                    (c) => c.value === e.target.value
                  );
                  if (selectedCustomer) {
                    formik.setFieldValue(
                      'customerName',
                      selectedCustomer.label
                    );
                  }
                }}
              />

              <FormikInput
                label="Ticket Type"
                name="ticketType"
                readOnly // Assuming this is fixed
                required
              />

              <FormikInput
                label="Ticket No"
                name="ticketNo"
                readOnly // Assuming this is auto-generated
                required
              />

              <FormikInput
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                required
              />

              <FormikInput label="PO No" name="poNo" required />
              <FormikInput label="Invoice No" name="invoiceNo" required />
              <FormikInput label="Reference No" name="referenceNo" />

              <FormikInput label="Subject" name="subject" required />
              <FormikInput
                label="Project Location"
                name="projectLocation"
                required
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
              />
              <FormikInput label="Vehicle No" name="vehicleNo" />
            </div>
          </Section>

          {/*  ITEMS TABLE */}
          <Section title="Items">
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 rounded-lg text-sm whitespace-nowrap">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border border-gray-200">S.No</th>
                        <th className="p-2 border border-gray-200 min-w-[250px]">
                          Product <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[120px]">
                          Item Code <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[80px]">Unit <span className="text-red-500">*</span></th>
                        <th className="p-2 border border-gray-200 min-w-[100px]">
                          Required Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[120px]">
                          Delivery Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="p-2 border border-gray-200 min-w-[200px]">
                          Description
                        </th>
                        <th className="p-2 border border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.items.map((row: any, idx: number) => {
                        const item = formik.values.items[idx];
                        const availableQty = item.availableQty ?? '';

                        return (
                          <tr key={idx}>
                            <td className="p-2 text-center border border-gray-200">
                              {idx + 1}
                            </td>

                            <td className="p-2 border border-gray-200">
                              <FormikSelect
                                label=""
                                name={`items.${idx}.productId`}
                                options={availableProducts.map((p) => ({
                                  value: p._id!,
                                  label: p.name,
                                }))}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                  handleProductSelection(idx, e.target.value);
                                }}
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
                                name={`items.${idx}.requiredQty`}
                                type="number"
                                min={1}

                              />
                            </td>
                            <td className="p-2 border border-gray-200 align-top">
                              <div className="flex flex-col gap-1.5">
                                {/* Quantity Input */}
                                <FormikInput
                                  label=""
                                  name={`items.${idx}.quantity`}
                                  type="number"
                                  min={1}
                                  max={availableQty}

                                />

                                {/* Available Qty Badge */}
                                {availableQty !== '' && (
                                  <div className="flex justify-end">
                                    <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 rounded border border-green-100">
                                      Available: {availableQty} {item.unit || ''}
                                    </span>
                                  </div>
                                )}

                                {/* Validation */}
                                {item.quantity > availableQty && (
                                  <div className="flex items-center gap-1 text-xs text-red-600">
                                    ⚠ Qty exceeds stock
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-2 border border-gray-200">
                              <FormikInput
                                label=""
                                name={`items.${idx}.description`}
                              />
                            </td>

                            <td className="p-2 text-center border border-gray-200">
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="text-red-600 hover:text-red-800 transition"
                              >
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {formik.values.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-4 text-center text-gray-500"
                          >
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex flex-col items-start mt-4">
                    <button
                      type="button"
                      disabled={formik.values.items.length >= 15}
                      onClick={() => {
                        if (formik.values.items.length >= 15) return;
                        push({
                          productId: '',
                          name: '',
                          unit: '',
                          description: '',
                          quantity: 0,
                        });
                      }}
                      className={`px-4 py-2 text-white rounded-lg transition ${formik.values.items.length >= 15
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                      Add Item
                    </button>
                    {formik.values.items.length >= 15 && (
                      <span className="text-sm text-gray-500 italic mt-2">
                        Cannot add more than 15 items per ticket for single-page printing.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </FieldArray>
          </Section>

          {/* 🚚 DELIVERY INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Section title="Delivery Details">
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

          {/* Buttons */}
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
              onClick={handlePreview} // Change type to button to prevent default submission, handled by onClick
              disabled={isLoading || formik.isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${isLoading || formik.isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              Preview Delivery Ticket
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default DeliveryTicketForm;
