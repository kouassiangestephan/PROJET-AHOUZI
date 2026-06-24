import { cn } from '@/lib/utils';

const variants = {
  default:  'bg-slate-100 text-slate-600',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-600',
  info:     'bg-blue-50 text-blue-700',
  indigo:   'bg-indigo-50 text-indigo-700',
  ghost:    'bg-slate-50 text-slate-500',
  purple:   'bg-purple-50 text-purple-700',
};

const dots = {
  default:  'bg-slate-400',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  info:     'bg-blue-500',
  indigo:   'bg-indigo-500',
  ghost:    'bg-slate-300',
  purple:   'bg-purple-500',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'default', children, className, dot = true }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
      variants[variant],
      className,
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[variant])} />}
      {children}
    </span>
  );
}
