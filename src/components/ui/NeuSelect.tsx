import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface NeuSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  containerClassName?: string;
}

export const NeuSelect = React.forwardRef<HTMLSelectElement, NeuSelectProps>(
  ({ label, error, options, className = '', containerClassName = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-xl neu-inset px-3.5 py-2.5 pr-9 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-none transition-all duration-150 focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
              error ? 'border border-rose-500/50' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#eaf0f6] dark:bg-[#141720] text-slate-800 dark:text-slate-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 text-slate-400 dark:text-slate-500">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);

NeuSelect.displayName = 'NeuSelect';
