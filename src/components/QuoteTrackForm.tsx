'use client';

import React, { useEffect, useState } from 'react';
import { useFormik, FormikErrors, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Edit3, PlusCircle, Trash2, Package, Weight, IndianRupee, Save } from 'lucide-react';
import { Product, QuoteLineItem } from '@/lib/types';
import { getProductDropdown, getProductById } from '@/services/catalogApi';
import { toast } from 'sonner';

import { FormikInput } from '@/components/shared/FormikInput';
import { FormikSelect } from '@/components/shared/FormikSelect';
import { FormikTextarea } from '@/components/shared/FormikTextarea';
import { Section } from '@/components/ui/Section';

interface LineItem extends QuoteLineItem { }

const emptyItem = (): LineItem => ({
  productId: '',
  name: '',
  weight: 0,
  qty: 1,
  price: 0,
  priceUSD: 0,
  totalWeight: 0,
  totalCost: 0,
  totalCostUSD: 0,
  shippingAmount: 0,
  shippingPercentage: 0,
  marginPercentage: 0,
  marginAmount: 0,
  unitShippingAmount: 0,
  unitPriceWithShipping: 0,
  sellingPrice: 0,
  totalSellingPrice: 0,
  grossMargin: 0,
  deepPrice: 0,
  manualShipping: false,
});

const convertToUSD = (inr: number, rate: number) => (rate > 0 ? inr / rate : 0);
const convertToINR = (usd: number, rate: number) => (rate > 0 ? usd * rate : 0);

const lineItemSchema = Yup.object().shape({
  productId: Yup.string().required('Select a product'),
  weight: Yup.number()
    .typeError('Enter valid weight')
    .min(0, 'Weight cannot be negative')
    .required('Weight required'),
  qty: Yup.number()
    .typeError('Enter valid quantity')
    .min(1, 'Qty must be at least 1')
    .required('Quantity required'),
  price: Yup.number()
    .typeError('Enter valid price')
    .min(0, 'Price cannot be negative')
    .required('Price required'),
  marginPercentage: Yup.number()
    .typeError('Enter valid margin')
    .min(0, 'Margin cannot be negative')
    .max(100, 'Margin cannot be over 100')
    .required('Margin required'),
});

const validationSchema = Yup.object().shape({
  clientName: Yup.string().required('Client name is required'),
  totalContainers: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .required('Required'),
  costPerContainer: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .required('Required'),
  marginPercentage: Yup.number()
    .typeError('Must be number')
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot be more than 100')
    .required('Required'),
  currency: Yup.string().required('Currency required'),
  exchangeRate: Yup.number()
    .typeError('Enter valid rate')
    .min(1, 'Rate must be > 0')
    .required('Exchange rate required'),
  items: Yup.array().of(lineItemSchema),
});

const QuoteTrackForm: React.FC<any> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  isLoading,
}) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductDropdown();
        setProducts(data);
      } catch {
        toast.error('Failed to load products');
      }
    })();
  }, []);

  const formik = useFormik({
    initialValues: {
      clientName: initialData?.clientName || '',
      companyName: initialData?.companyName || '',
      totalContainers: initialData?.totalContainers || 1,
      costPerContainer: initialData?.costPerContainer || 0,
      marginPercentage: initialData?.marginPercentage || 10,
      deepPrice: initialData?.deepPrice || 0,
      currency: initialData?.currency || 'INR',
      exchangeRate: initialData?.exchangeRate || 80,
      items: initialData?.items || [emptyItem()],
      status: initialData?.status || 'Pending',
      remarks: initialData?.remarks || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const totals = React.useMemo(() => {
    let totalWeight = 0;
    let totalItemCost = 0;
    let totalItemCostUSD = 0;
    let totalQty = 0;

    formik.values.items.forEach((it: any) => {
      totalWeight += Number(it.totalWeight || 0);
      totalItemCost += Number(it.totalCost || 0);
      totalItemCostUSD += Number(it.totalCostUSD || 0);
      totalQty += Number(it.qty || 0);
    });

    const totalShippingCost =
      formik.values.totalContainers * formik.values.costPerContainer;

    const itemsTotalSelling = formik.values.items.reduce(
      (acc: number, it: any) => acc + (it.totalSellingPrice || 0),
      0
    );
    const itemsGrossMargin = formik.values.items.reduce(
      (acc: number, it: any) => acc + (it.grossMargin || 0),
      0
    );

    return {
      totalWeight,
      totalItemCost,
      totalItemCostUSD,
      totalQty,
      totalShippingCost,
      totalSellingPrice: itemsTotalSelling,
      totalGrossMargin: itemsGrossMargin,
    };
  }, [formik.values.items, formik.values.costPerContainer, formik.values.totalContainers]);

  const updateLineItem = async (index: number, field: string, value: any) => {
    const items = [...formik.values.items];
    const it = { ...items[index] };

    (it as any)[field] = value;

    if (field === 'productId' && value) {
      try {
        const prod = await getProductById(value);
        it.name = prod.name;
        it.price = prod.price || 0;
        it.weight = Number(prod.weight) || 0;
      } catch {
        toast.error('Failed to fetch product details');
      }
    }

    const { exchangeRate } = formik.values;
    it.totalWeight = it.weight * it.qty;
    it.totalCost = it.price * it.qty;
    it.totalCostUSD = convertToUSD(it.totalCost, exchangeRate);
    it.priceUSD = convertToUSD(it.price, exchangeRate);

    items[index] = it;
    formik.setFieldValue('items', items);
  };

  useEffect(() => {
    const { totalContainers, costPerContainer, items } = formik.values;
    let totalWeight = 0;
    items.forEach((it: any) => (totalWeight += Number(it.totalWeight || 0)));

    const totalShipping = totalContainers * costPerContainer;
    const shippingPerKg = totalWeight > 0 ? totalShipping / totalWeight : 0;

    const updatedItems = items.map((it: any) => {
      const unitShipping = it.weight * shippingPerKg;
      const marginAmt = it.price * (it.marginPercentage / 100);
      const sPrice = it.price + unitShipping + marginAmt;

      return {
        ...it,
        unitShippingAmount: unitShipping,
        unitPriceWithShipping: it.price + unitShipping,
        marginAmount: marginAmt,
        sellingPrice: sPrice,
        totalSellingPrice: sPrice * it.qty,
        grossMargin: marginAmt * it.qty,
      };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      formik.setFieldValue('items', updatedItems);
    }
  }, [formik.values.totalContainers, formik.values.costPerContainer, formik.values.items]);

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 py-6 rounded-lg font-sans">
      <div className="page-header mb-12">
        <div>
          <div className="page-header-eyebrow">
            <div className="page-header-marker" />
            <span>Commercial Intelligence</span>
          </div>
          <h1 className="page-header-title">
            {isEditMode ? 'Modify' : 'Initialize'} <span className="gradient-text">Quote Tracking</span>
          </h1>
          <p className="page-header-description">
            {isEditMode 
              ? 'Adjust commercial variables and item specs. Real-time margin calculations will update automatically as you refine the data.' 
              : 'Initiate a new commercial tracking funnel. Define shipping costs, exchange rates, and line items to calculate target margins.'}
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormikInput label="Client Name" name="clientName" required />
              <FormikInput label="Company Name" name="companyName" />
              <FormikSelect
                label="Currency"
                name="currency"
                options={[
                  { value: 'INR', label: 'INR' },
                  { value: 'USD', label: 'USD' },
                ]}
                required
              />
              <FormikInput
                label="Exchange Rate (1 USD = ? INR)"
                name="exchangeRate"
                type="number"
                required
              />
            </div>
          </Section>

          <Section title="Container & Shipping Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormikInput
                label="Total Containers"
                name="totalContainers"
                type="number"
                required
              />
              <FormikInput
                label="Cost Per Container (INR)"
                name="costPerContainer"
                type="number"
                required
              />
              <div className="bg-[#0f766e]/5 p-4 rounded-xl border border-[#0f766e]/10 flex flex-col justify-center">
                <span className="text-xs font-bold text-[#0f766e] uppercase mb-1">Total Shipping</span>
                <span className="text-xl font-bold text-[#0f766e]">
                  ₹{totals.totalShippingCost.toLocaleString()}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Quote Items">
            <div className="overflow-x-auto">
              <table className="akod-table whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-widest text-center">
                    <th className="p-3 border-r border-gray-100 w-12 text-center">S.No</th>
                    <th className="p-3 border-r border-gray-100 min-w-[220px] text-left">Product <span className="text-red-500">*</span></th>
                    <th className="p-3 border-r border-gray-100 w-24 text-center">WT (kg)</th>
                    <th className="p-3 border-r border-gray-100 w-24 text-center">Qty</th>
                    <th className="p-3 border-r border-gray-100 w-32 text-center">Base Rate ({formik.values.currency})</th>
                    <th className="p-3 border-r border-gray-100 w-24 text-center">Margin %</th>
                    <th className="p-3 border-r border-gray-100 w-32 text-center">Unit Sell</th>
                    <th className="p-3 border-r border-gray-100 w-32 text-center">Total Sell</th>
                    <th className="p-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {formik.values.items.map((item: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 text-center border-r border-gray-100 font-bold text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="p-3 border-r border-gray-100">
                        <select
                          className="w-full text-[13px] border-gray-200 rounded-lg focus:ring-[#0f766e] focus:border-[#0f766e] disabled:bg-gray-50"
                          value={item.productId}
                          onChange={(e) => updateLineItem(idx, 'productId', e.target.value)}
                        >
                          <option value="">Select Product...</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.itemCode})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border-r border-gray-100">
                        <input
                          type="number"
                          className="w-full text-[13px] border-gray-200 rounded-lg text-center font-medium"
                          value={item.weight}
                          onChange={(e) => updateLineItem(idx, 'weight', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 border-r border-gray-100">
                        <input
                          type="number"
                          className="w-full text-[13px] border-gray-200 rounded-lg text-center font-bold text-[#0f766e]"
                          value={item.qty}
                          onChange={(e) => updateLineItem(idx, 'qty', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 border-r border-gray-100">
                        <input
                          type="number"
                          className="w-full text-[13px] border-gray-200 rounded-lg text-center font-semibold bg-sky-50/30"
                          value={item.price}
                          onChange={(e) => updateLineItem(idx, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 border-r border-gray-100">
                        <input
                          type="number"
                          className="w-full text-[13px] border-gray-200 rounded-lg text-center text-green-600 font-black"
                          value={item.marginPercentage}
                          onChange={(e) => updateLineItem(idx, 'marginPercentage', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 border-r border-gray-100 text-center">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-700">
                                {formik.values.currency === 'USD' ? '$' : '₹'}{item.sellingPrice?.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Incl. Ship + Margin</span>
                        </div>
                      </td>
                      <td className="p-3 border-r border-gray-100 text-center bg-gray-50/30">
                        <span className="text-[13px] font-black text-[#0f766e]">
                            {formik.values.currency === 'USD' ? '$' : '₹'}{item.totalSellingPrice?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = formik.values.items.filter((_: any, i: number) => i !== idx);
                            formik.setFieldValue('items', newItems.length ? newItems : [emptyItem()]);
                          }}
                          className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-teal-500 transition-all flex items-center justify-center mx-auto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/50 border-t-2 border-gray-100">
                  <tr className="text-sm font-black text-[#0f766e]">
                    <td colSpan={3} className="py-4 px-3 text-right text-[10px] uppercase tracking-widest text-gray-400">Grand Summary</td>
                    <td className="py-4 px-3 text-center border-r border-gray-100 bg-white">{totals.totalQty} Units</td>
                    <td className="py-4 px-3 text-center border-r border-gray-100 bg-white">--</td>
                    <td className="py-4 px-3 text-center border-r border-gray-100 bg-white">--</td>
                    <td className="py-4 px-3 text-center border-r border-gray-100 bg-white">--</td>
                    <td className="py-4 px-3 text-center text-teal-700 text-lg bg-teal-50/30">
                      {formik.values.currency === 'USD' ? '$' : '₹'}{totals.totalSellingPrice.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-dashed border-gray-300">
                <button
                    type="button"
                    onClick={() => formik.setFieldValue('items', [...formik.values.items, emptyItem()])}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0f766e] text-white text-xs font-black uppercase tracking-widest hover:bg-[#134e4a] transition-all shadow-md"
                >
                    <PlusCircle size={14} />
                    Add More Item
                </button>
                <div className="flex gap-8 px-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Weight</p>
                        <p className="text-sm font-bold text-[#0f766e]">{totals.totalWeight.toFixed(2)} KG</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Cost</p>
                        <p className="text-sm font-bold text-[#0f766e]">₹{totals.totalItemCost.toLocaleString()}</p>
                    </div>
                </div>
            </div>
          </Section>

          <Section title="Additional Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormikSelect
                label="Status"
                name="status"
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Quoted', label: 'Quoted' },
                  { value: 'Accepted', label: 'Accepted' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
                required
              />
              <FormikTextarea label="Remarks" name="remarks" placeholder="Internal notes or comments..." rows={4} />
            </div>
          </Section>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Weight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Weight</p>
                <p className="text-lg font-bold text-gray-800">{totals.totalWeight.toFixed(2)} kg</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Item Cost</p>
                <p className="text-lg font-bold text-gray-800">₹{totals.totalItemCost.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Units</p>
                <p className="text-lg font-bold text-gray-800">{totals.totalQty} Units</p>
              </div>
            </div>
            <div className="bg-teal-700 p-5 rounded-2xl shadow-lg shadow-teal-700/20 flex flex-col justify-center">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Final Total Profit</p>
              <p className="text-2xl font-black text-white">₹{totals.totalGrossMargin.toLocaleString()}</p>
            </div>
          </div>

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
              className={`flex items-center gap-2 px-10 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-teal-700/10 transition-all active:scale-95 ${formik.isSubmitting || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800'
                }`}
            >
              <Save className="w-4 h-4" />
              {isEditMode ? 'Update Quote Track' : 'Create Quote Track'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default QuoteTrackForm;
