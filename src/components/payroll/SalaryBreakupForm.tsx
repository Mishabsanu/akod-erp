'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Save, ArrowLeft, PieChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Section } from '@/components/ui/Section';
import { FormikInput } from '@/components/shared/FormikInput';

interface SalaryBreakupFormProps {
  initialData?: any;
  userName: string;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const validationSchema = Yup.object().shape({
  basic: Yup.number().min(0).required('Required'),
  hra: Yup.number().min(0).required('Required'),
  conveyance: Yup.number().min(0),
  specialAllowance: Yup.number().min(0),
  pf: Yup.number().min(0),
  esi: Yup.number().min(0),
  tds: Yup.number().min(0),
  otherDeductions: Yup.number().min(0),
});

export const SalaryBreakupForm: React.FC<SalaryBreakupFormProps> = ({
  initialData,
  userName,
  onSubmit,
  loading,
}) => {
  const router = useRouter();
  
  const initialValues = {
    basic: initialData?.basic || 0,
    hra: initialData?.hra || 0,
    conveyance: initialData?.conveyance || 0,
    specialAllowance: initialData?.specialAllowance || 0,
    pf: initialData?.pf || 0,
    esi: initialData?.esi || 0,
    tds: initialData?.tds || 0,
    otherDeductions: initialData?.otherDeductions || 0,
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-8 py-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <PieChart className="text-red-600 w-6 h-6" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Configure Salary: <span className="text-red-600">{userName}</span>
          </h2>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Earnings Section */}
              <Section title="Earnings Components">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikInput label="Basic Salary" name="basic" type="number" required />
                  <FormikInput label="HRA" name="hra" type="number" required />
                  <FormikInput label="Conveyance" name="conveyance" type="number" />
                  <FormikInput label="Special Allowance" name="specialAllowance" type="number" />
                </div>
              </Section>

              {/* Deductions Section */}
              <Section title="Deductions Components">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikInput label="PF (Provident Fund)" name="pf" type="number" />
                  <FormikInput label="ESI (Insurance)" name="esi" type="number" />
                  <FormikInput label="TDS (Income Tax)" name="tds" type="number" />
                  <FormikInput label="Other Deductions" name="otherDeductions" type="number" />
                </div>
              </Section>
            </div>

            {/* Summary Block */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Earnings</p>
                    <p className="text-xl font-bold text-gray-800">
                      ₹{(Number(values.basic) + Number(values.hra) + Number(values.conveyance) + Number(values.specialAllowance)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Deductions</p>
                    <p className="text-xl font-bold text-gray-800">
                      ₹{(Number(values.pf) + Number(values.esi) + Number(values.tds) + Number(values.otherDeductions)).toLocaleString()}
                    </p>
                  </div>
                  <div className="md:border-l border-gray-200 md:pl-8">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Net Monthly Take Home</p>
                    <p className="text-3xl font-black text-[#11375d]">
                      ₹{(
                        (Number(values.basic) + Number(values.hra) + Number(values.conveyance) + Number(values.specialAllowance)) -
                        (Number(values.pf) + Number(values.esi) + Number(values.tds) + Number(values.otherDeductions))
                      ).toLocaleString()}
                    </p>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-white font-semibold shadow-sm transition ${
                  loading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading || isSubmitting ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Configuration
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
