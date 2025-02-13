import React from 'react';

const Input = React.forwardRef(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseStyles = 'w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const borderStyles = error
      ? 'border-red-500 focus-visible:ring-red-500'
      : 'border-gray-300 hover:border-gray-400';

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium leading-none text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`${baseStyles} ${borderStyles} ${className}`}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 