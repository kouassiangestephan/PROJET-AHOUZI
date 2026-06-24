import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-semibold text-slate-600">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all duration-150',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-400',
            icon && 'pl-10',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
