import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-[12px] font-semibold text-slate-600">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] text-slate-900 transition-all duration-150 appearance-none pr-9 cursor-pointer',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
