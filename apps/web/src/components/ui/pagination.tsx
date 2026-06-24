'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
      <p className="text-[12px] text-slate-500">
        <span className="font-semibold text-slate-700">{from}–{to}</span> sur <span className="font-semibold text-slate-700">{total}</span> résultats
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all',
              page === p
                ? 'gradient-indigo text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-transparent hover:border-slate-200"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
