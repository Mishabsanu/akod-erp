import React from 'react';
import { useField } from 'formik';
import { Textarea, TextareaProps } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

interface FormikTextareaProps extends TextareaProps {
  label?: string;
  name: string;
  required?: boolean;
  wrapperClassName?: string;
}

export const FormikTextarea: React.FC<FormikTextareaProps> = ({
  label,
  name,
  required = false,
  wrapperClassName,
  ...props
}) => {
  const [field, meta] = useField(name);

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <Label htmlFor={name} className="mb-1">
        {label}
        {required && <span className="text-teal-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        {...field}
        {...props}
        className={`${meta.touched && meta.error ? 'border-teal-500' : ''}`}
      />
      {meta.touched && meta.error ? (
        <div className="mt-1 text-xs text-teal-500">{meta.error}</div>
      ) : null}
    </div>
  );
};
