'use client';

import { Bell, Search, ChevronDown, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Tableau de bord',
  '/properties': 'Propriétés',
  '/reservations': 'Réservations',
  '/customers': 'Clients',
  '/housekeeping': 'Housekeeping',
  '/maintenance': 'Maintenance',
  '/finance': 'Finance',
  '/hr': 'Ressources Humaines',
  '/inventory': 'Inventaire',
  '/restaurant': 'Restaurant',
  '/bar': 'Bar',
  '/shop': 'Boutique',
  '/reports': 'Rapports & Analyses',
  '/settings': 'Paramètres',
};

const BREADCRUMBS: Record<string, { parent?: string; label: string }> = {
  '/': { label: 'Tableau de bord' },
  '/properties': { parent: 'Exploitation', label: 'Propriétés' },
  '/reservations': { parent: 'Exploitation', label: 'Réservations' },
  '/customers': { parent: 'Exploitation', label: 'Clients' },
  '/housekeeping': { parent: 'Exploitation', label: 'Housekeeping' },
  '/maintenance': { parent: 'Exploitation', label: 'Maintenance' },
  '/finance': { parent: 'Gestion', label: 'Finance' },
  '/hr': { parent: 'Gestion', label: 'RH' },
  '/inventory': { parent: 'Gestion', label: 'Inventaire' },
  '/restaurant': { parent: 'Services', label: 'Restaurant' },
  '/reports': { parent: 'Analyse', label: 'Rapports' },
  '/settings': { parent: 'Système', label: 'Paramètres' },
};

export function Header() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] ?? 'AHOUZI';
  const crumb = BREADCRUMBS[pathname];

  return (
    <header
      className="h-16 bg-white flex items-center px-6 gap-4 flex-shrink-0"
      style={{ boxShadow: '0 1px 0 #e2e8f0' }}
    >
      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        {crumb?.parent && (
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
            {crumb.parent} <span className="text-slate-300 mx-1">/</span> {crumb.label}
          </p>
        )}
        <h1 className="text-base font-semibold text-slate-800 leading-none">{title}</h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-56 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:bg-white transition-all">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent text-sm outline-none w-full text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* Notification */}
      <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
        <Bell size={18} className="text-slate-500" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-slate-200" />

      {/* User */}
      <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className="w-8 h-8 gradient-indigo rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {user ? getInitials(user.firstName, user.lastName) : 'AU'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[13px] font-semibold text-slate-800 leading-none">{user?.firstName} {user?.lastName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
        <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
      </button>
    </header>
  );
}
