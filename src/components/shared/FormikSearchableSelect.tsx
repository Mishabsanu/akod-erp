'use client';

import React from 'react';
import { useField, useFormikContext } from 'formik';
import SearchableSelect from './SearchableSelect';

interface FormikSearchableSelectProps {
  name: string;
  options: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const FormikSearchableSelect: React.FC<FormikSearchableSelectProps> = ({
  name,
  ...props
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  return (
    <SearchableSelect
      {...props}
      value={field.value}
      onChange={(val) => {
        setFieldValue(name, val);
        setFieldTouched(name, true);
      }}
      error={meta.error}
      touched={meta.touched}
    />
  );
};

export default FormikSearchableSelect;
