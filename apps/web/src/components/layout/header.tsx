'use client';

import { Bell, Search, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Tableau de bord' }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-2 w-64">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder:text-gray-400"
        />
      </div>

      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell size={20} className="text-gray-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Settings size={20} className="text-gray-600" />
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
        <div className="w-8 h-8 bg-[#1B2B5E] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user ? getInitials(user.firstName, user.lastName) : 'AU'}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
