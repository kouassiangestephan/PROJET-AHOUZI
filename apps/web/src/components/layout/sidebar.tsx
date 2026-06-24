'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, CalendarDays, Users, Bed, Wrench,
  DollarSign, TrendingDown, UserCog, Package, UtensilsCrossed,
  Wine, ShoppingBag, BarChart3, Settings, ChevronDown,
  Hotel, LogOut, Menu, Shirt,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
  badge?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard, section: 'PRINCIPAL' },
  { label: 'Propriétés', href: '/properties', icon: Building2, section: 'EXPLOITATION' },
  { label: 'Réservations', href: '/reservations', icon: CalendarDays },
  { label: 'Clients', href: '/customers', icon: Users },
  { label: 'Housekeeping', href: '/housekeeping', icon: Bed },
  { label: 'Maintenance', href: '/maintenance', icon: Wrench },
  {
    label: 'Finance', icon: DollarSign, section: 'GESTION',
    children: [
      { label: 'Factures & Paiements', href: '/finance', icon: DollarSign },
      { label: 'Dépenses', href: '/expenses', icon: TrendingDown },
    ],
  },
  {
    label: 'Ressources Humaines', icon: UserCog,
    children: [
      { label: 'Employés', href: '/hr', icon: UserCog },
    ],
  },
  { label: 'Inventaire', href: '/inventory', icon: Package },
  { label: 'Blanchisserie', href: '/laundry', icon: Shirt, section: 'SERVICES' },
  { label: 'Restaurant', href: '/restaurant', icon: UtensilsCrossed },
  { label: 'Bar', href: '/bar', icon: Wine },
  { label: 'Boutique', href: '/shop', icon: ShoppingBag },
  { label: 'Rapports', href: '/reports', icon: BarChart3, section: 'ANALYSE' },
  { label: 'Paramètres', href: '/settings', icon: Settings, section: 'SYSTÈME' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Finance']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const hasActiveChild = (item: NavItem) =>
    item.children?.some(c => isActive(c.href)) ?? false;

  let lastSection = '';

  return (
    <aside
      style={{ boxShadow: '1px 0 0 #e2e8f0' }}
      className={cn(
        'flex flex-col h-screen bg-white transition-all duration-300 flex-shrink-0 z-30',
        collapsed ? 'w-[72px]' : 'w-[270px]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-100 flex-shrink-0',
        collapsed ? 'px-3 justify-center' : 'px-4'
      )}>
        <div className="gradient-indigo rounded-xl p-2 flex-shrink-0 shadow-sm">
          <Hotel className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3 flex-1">
            <h1 className="font-bold text-base text-slate-800 leading-none">AHOUZI</h1>
            <p className="text-[11px] text-indigo-500 font-medium mt-0.5">Gestion Hôtelière</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors',
            collapsed && 'hidden'
          )}
        >
          <Menu size={16} />
        </button>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute left-16 top-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-md text-white"
          >
            <Menu size={12} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          if (item.children) {
            const expanded = expandedItems.includes(item.label);
            const active = hasActiveChild(item);
            return (
              <div key={item.label}>
                {showSection && (
                  <p className="nav-section-label">{item.section}</p>
                )}
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    'sidebar-link w-full',
                    active && 'active'
                  )}
                >
                  <span className="icon-wrap">
                    <item.icon size={16} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-slate-700">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'text-slate-400 transition-transform duration-200',
                          expanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && expanded && (
                  <div className="ml-11 mt-0.5 mb-1 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-all',
                          isActive(child.href)
                            ? 'text-indigo-600 font-semibold bg-indigo-50'
                            : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'
                        )}
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          isActive(child.href) ? 'bg-indigo-500' : 'bg-slate-300'
                        )} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.href}>
              {showSection && (
                <p className="nav-section-label">{item.section}</p>
              )}
              <Link
                href={item.href!}
                className={cn('sidebar-link', isActive(item.href) && 'active')}
                title={collapsed ? item.label : undefined}
              >
                <span className="icon-wrap">
                  <item.icon size={16} />
                </span>
                {!collapsed && (
                  <span className="text-slate-700">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 gradient-indigo rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
