'use client';

import { FormikProvider, useFormik } from 'formik';
import { PackagePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { Section } from '@/components/ui/Section';
import {
  InventoryFormData,
  PODropdownItem,
  Product,
  Vendor,
} from '@/lib/types';
import { LabeledInput } from './shared/LabeledInput';

import { getProductDropdown } from '@/services/catalogApi';
import { getVendorDropdown } from '@/services/vendorApi';

/* ---------------- VALIDATION ---------------- */
const InventoryItemSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  stock: Yup.number()
    .min(1, 'Stock must be at least 1')
    .required('Stock is required'),
});

const InventoryFormSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  poNo: Yup.string().required('PO Number is required'),
  vendor: Yup.string().required('Vendor is required'),
  items: Yup.array()
    .of(InventoryItemSchema)
    .min(1, 'At least one item is required'),
});

interface InventoryFormProps {
  onSubmit: (
    payload: any,
    formikHelpers: {
      setErrors: (errors: any) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
  initialData?: InventoryFormData;
}

/* ---------------- COMPONENT ---------------- */
const InventoryForm: React.FC<InventoryFormProps> = ({
  onSubmit,
  onCancel,
  isEditMode = false,
  isLoading,
  initialData,
}) => {
  const [products, setProducts] = useState<PODropdownItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorMobile, setVendorMobile] = useState('');
  const [vendorCompany, setVendorCompany] = useState('');

  /* ---------------- FETCH DROPDOWNS ---------------- */
  useEffect(() => {
    const loadData = async () => {
      const [pRes, vRes] = await Promise.all([
        getProductDropdown(),
        getVendorDropdown(),
      ]);

      if (pRes) setProducts(pRes);
      if (vRes?.success) setVendors(vRes.data);
    };

    loadData();
  }, []);

  /* ---------------- FORMIK ---------------- */

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      date: initialData?.date || new Date().toISOString().split('T')[0],
      reference: initialData?.reference || '',
      poNo: initialData?.poNo || '',
      vendor:
        typeof initialData?.vendor === 'object'
          ? (initialData.vendor as any)._id
          : initialData?.vendor || '',

      items: initialData?.items?.length
        ? initialData.items.map((item: any) => ({
          id: item.id || Date.now().toString(),
          productId: item.productId || '',
          itemCode: item.itemCode || '',
          unit: item.unit || '',
          stock: item.stock ?? 1,
        }))
        : [
          {
            id: Date.now().toString(),
            productId: '',
            itemCode: '',
            unit: '',
            stock: '',
          },
        ],
    },

    validationSchema: InventoryFormSchema,

    onSubmit: (values, { setSubmitting, setErrors }) => {
      if (isEditMode) {
        onSubmit(
          {
            orderedQty: values.items[0].stock,
            reference: values.reference,
            poNo: values.poNo,
            vendor: values.vendor,
            itemCode: values.items[0].itemCode,
            product: values.items[0].productId,
          },
          { setErrors, setSubmitting }
        );
        return;
      }

      // CREATE MODE
      onSubmit(
        {
          date: values.date,
          reference: values.reference,
          poNo: values.poNo,
          vendor: values.vendor,
          items: values.items.map((item: any) => ({
            productId: item.productId,
            itemCode: item.itemCode,
            quantity: item.stock,
          })),
        },
        { setErrors, setSubmitting }
      );
    },
  });

  /* ---------------- VENDOR AUTO FILL ---------------- */
  useEffect(() => {
    const vendor = vendors.find((v) => v._id === formik.values.vendor);
    setVendorMobile(vendor?.mobile || '');
    setVendorCompany(vendor?.company || '');
  }, [formik.values.vendor, vendors]);

  /* ---------------- PRODUCT CHANGE ---------------- */
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find((p) => p._id === productId);
    formik.setFieldValue(`items[${index}].productId`, productId);
    formik.setFieldValue(`items[${index}].itemCode`, product?.itemCode || '');
    formik.setFieldValue(`items[${index}].unit`, product?.unit || '');
  };

  /* ---------------- ADD / REMOVE ROW ---------------- */
  const addRow = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      {
        id: Date.now().toString(),
        productId: '',
        itemCode: '',
        unit: '',
        stock: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    const updated = [...formik.values.items];
    updated.splice(index, 1);
    formik.setFieldValue('items', updated);
  };
  const totalItems = formik.values.items.length;

  const totalStock = formik.values.items.reduce(
    (sum, item) => sum + (Number(item.stock) || 0),
    0
  );
  return (
    <div className="w-full bg-gray-50 px-8 py-6 rounded-lg">
      <form onSubmit={formik.handleSubmit}>
        <div className="page-header mb-12">
          <div>
            <div className="page-header-eyebrow">
              <div className="page-header-marker" />
              <span>Stock Management</span>
            </div>
            <h1 className="page-header-title">
              {isEditMode ? 'Modify' : 'Register'} <span className="gradient-text">Inventory</span>
            </h1>
            <p className="page-header-description">
              {isEditMode 
                ? 'Update inventory levels and historical reference points for this stock entry.' 
                : 'Account for incoming stock and link items to their associated purchase orders.'}
            </p>
          </div>
        </div>

        <FormikProvider value={formik}>
          {/* GENERAL INFO */}
          <Section eyebrow="Stock Management" title="Item" highlight="Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormikInput label="Date" name="date" type="date" required />
              <FormikInput label="Reference" name="reference" />
              <FormikInput label="PO Number" name="poNo" required />
              <FormikSelect
                label="Vendor"
                name="vendor"
                options={vendors.map((v) => ({
                  value: v._id!,
                  label: v.name,
                }))}
                required
              />
              <LabeledInput
                label="Vendor Mobile"
                value={vendorMobile}
                readOnly
              />
              <LabeledInput
                label="Vendor Company"
                value={vendorCompany}
                readOnly
              />
            </div>
          </Section>

          {/* ITEMS TABLE */}
          <Section title="Inventory Items" className="mt-8">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 ">
              <div className="overflow-x-auto">
                <table className="akod-table table-fixed">
                  {/* HEADER */}
                  <thead>
                    <tr
                      className="text-white text-sm uppercase tracking-wider"
                      style={{ backgroundColor: '#0f766e' }}
                    >
                      <th className="py-3 px-4 text-center w-12 !text-white">#</th>
                      <th className="w-[260px] py-2 px-3 text-left !text-white">
                        Product <span className="text-red-500">*</span>
                      </th>
                      <th className="w-[160px] py-2 px-3 text-left !text-white">
                        Item Code
                      </th>
                      <th className="w-[100px] py-2 px-3 text-left !text-white">Unit</th>
                      <th className="w-[120px] py-2 px-3 text-right !text-white">
                        Stock <span className="text-red-500">*</span>
                      </th>
                      {!isEditMode && (
                        <th className="w-[70px] py-2 px-2 text-center !text-white">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {formik.values.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500 text-sm italic"
                        >
                          No inventory items added yet.
                        </td>
                      </tr>
                    ) : (
                      formik.values.items.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="text-center text-gray-600 text-sm">
                            {idx + 1}
                          </td>

                          {/* PRODUCT */}
                          <td className="px-3 py-1">
                            <FormikSelect
                              label=""
                              name={`items[${idx}].productId`}
                              options={products.map((p) => ({
                                value: p._id!,
                                label: p.name,
                              }))}
                              disabled={isEditMode} // 🔒 lock product
                              onChange={(e) =>
                                handleProductChange(e.target.value, idx)
                              }
                              wrapperClassName="mb-0"
                              className="h-8 text-sm"
                            />
                          </td>

                          {/* ITEM CODE */}
                          <td className="px-3 py-2 text-sm text-gray-700 truncate">
                            {item.itemCode || '—'}
                          </td>

                          {/* UNIT */}
                          <td className="px-3 py-2 text-sm text-gray-700">
                            {item.unit || '—'}
                          </td>

                          <td className="px-3 py-1">
                            <FormikInput
                              name={`items[${idx}].stock`}
                              type="number"
                              min={1}
                              wrapperClassName="mb-0"
                              className="h-8 text-sm text-right"
                            />
                          </td>

                          {/* ACTION */}
                          {!isEditMode && (
                            <td className="text-center">
                              <button
                                type="button"
                                onClick={() => removeRow(idx)}
                                className="p-1 rounded text-teal-700 hover:bg-teal-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER TOTALS */}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
                <div className="flex gap-6 text-sm text-gray-700">
                  <span>
                    Total Items:{' '}
                    <strong className="text-gray-900">{totalItems}</strong>
                  </span>
                  <span>
                    Total Stock:{' '}
                    <strong className="text-gray-900">{totalStock}</strong>
                  </span>
                </div>

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-[#0f766e] text-white px-3 py-1.5 text-sm rounded-md"
                  >
                    + Add Row
                  </button>
                )}
              </div>
            </div>
          </Section>
        </FormikProvider>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="border px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formik.isValid || isLoading}
            className="bg-teal-700 text-white px-6 py-2 rounded-lg"
          >
            Save Inventory
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
