'use client';

import React from 'react';
import { useField } from 'formik';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Label } from '@/components/ui/Label';

interface FormikPhoneInputProps {
  label: string;
  name: string;
  placeholder?: string;
  country?: string;
  required?: boolean;
}

export const FormikPhoneInput: React.FC<FormikPhoneInputProps> = ({
  label,
  name,
  placeholder,
  country = 'qa',
  required = false,
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div className="mb-4">
      <Label className="mb-1">
        {label}
        {required && <span className="text-teal-500 ml-1">*</span>}
      </Label>

      <PhoneInput
        country={country}
        value={field.value || ''}
        onChange={(value) => helpers.setValue('+' + value)}
        onBlur={() => helpers.setTouched(true)}
        placeholder={placeholder}
        containerClass="!w-full"
        inputClass={`!w-full !h-[44px] !pl-14 !pr-3 !rounded-lg !border ${
          meta.touched && meta.error ? '!border-teal-500' : '!border-gray-300'
        } focus:!border-teal-500 focus:!ring-2 focus:!ring-teal-500/30`}
        buttonClass="!border-gray-300 !rounded-l-lg"
      />

      {meta.touched && meta.error && (
        <p className="mt-1 text-xs text-teal-500">{meta.error}</p>
      )}
    </div>
  );
};
