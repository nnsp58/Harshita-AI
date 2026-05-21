import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  className, 
  id, 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={twMerge(
          'input transition-all duration-200',
          error ? 'border-red-500 focus:border-red-500 ring-red-500' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
