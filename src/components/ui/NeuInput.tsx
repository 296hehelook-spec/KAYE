import React from 'react';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, error, icon, className = '', containerClassName = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl neu-inset px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-500/30 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border border-rose-500/50' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
