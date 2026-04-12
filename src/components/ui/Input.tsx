import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`w-full border border-gray-300 px-3 py-2.5 rounded-lg shadow-sm
          focus:ring-red-500 focus:border-red-500 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
