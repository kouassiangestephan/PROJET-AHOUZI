import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

const variants = {
  primary:  'gradient-indigo text-white shadow-sm hover:opacity-90 disabled:opacity-50',
  secondary:'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50',
  danger:   'bg-red-500 text-white hover:bg-red-600 shadow-sm disabled:opacity-50',
  ghost:    'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
  outline:  'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-50',
};

const sizes = {
  sm:  'px-3 py-1.5 text-[12px] rounded-lg gap-1.5',
  md:  'px-4 py-2 text-[13px] rounded-xl gap-2',
  lg:  'px-5 py-2.5 text-sm rounded-xl gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 size={13} className="animate-spin flex-shrink-0" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
