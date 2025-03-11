import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  as?: 'input' | 'textarea';
  leftIcon?: React.ReactNode;
  rows?: number;
}

const Input: React.FC<InputProps> = ({ label, error, as = 'input', className = '', ...props }) => {
  const Component = as;
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Component
        {...props}
        className={`
          block w-full px-3 py-2 rounded-lg
          border border-gray-300 shadow-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 