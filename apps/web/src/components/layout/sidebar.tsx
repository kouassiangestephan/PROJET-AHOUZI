'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, CalendarDays, Users, Bed, Wrench,
  DollarSign, TrendingDown, UserCog, Package, ShoppingCart, UtensilsCrossed,
  Wine, ShoppingBag, BarChart3, Settings, ChevronDown, ChevronRight,
  Hotel, LogOut, Menu, X, Shirt,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Propriétés', href: '/properties', icon: Building2 },
  { label: 'Réservations', href: '/reservations', icon: CalendarDays },
  { label: 'Clients', href: '/customers', icon: Users },
  { label: 'Housekeeping', href: '/housekeeping', icon: Bed },
  { label: 'Maintenance', href: '/maintenance', icon: Wrench },
  {
    label: 'Finance',
    icon: DollarSign,
    children: [
      { label: 'Factures', href: '/finance/invoices', icon: DollarSign },
      { label: 'Paiements', href: '/finance/payments', icon: DollarSign },
      { label: 'Caisse', href: '/finance/cash', icon: DollarSign },
      { label: 'Comptabilité', href: '/finance/accounting', icon: DollarSign },
    ],
  },
  { label: 'Dépenses', href: '/expenses', icon: TrendingDown },
  {
    label: 'Ressources Humaines',
    icon: UserCog,
    children: [
      { label: 'Employés', href: '/hr/employees', icon: UserCog },
      { label: 'Présences', href: '/hr/attendance', icon: UserCog },
      { label: 'Congés', href: '/hr/leaves', icon: UserCog },
      { label: 'Paie', href: '/hr/payroll', icon: UserCog },
    ],
  },
  { label: 'Inventaire', href: '/inventory', icon: Package },
  { label: 'Blanchisserie', href: '/laundry', icon: Shirt },
  { label: 'Restaurant', href: '/restaurant', icon: UtensilsCrossed },
  { label: 'Bar', href: '/bar', icon: Wine },
  { label: 'Boutique', href: '/shop', icon: ShoppingBag },
  { label: 'Rapports', href: '/reports', icon: BarChart3 },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[#1B2B5E] text-white transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-[70px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="bg-amber-400 rounded-xl p-2 flex-shrink-0">
          <Hotel className="w-6 h-6 text-[#1B2B5E]" />
        </div>
        {!collapsed && (
          <div className="ml-3">
            <h1 className="font-bold text-lg leading-none">AHOUZI</h1>
            <p className="text-amber-300 text-xs">Villas</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/60 hover:text-white"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedItems.includes(item.label);
            const hasActiveChild = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    hasActiveChild
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </>
                  )}
                </button>
                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href!}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                          isActive(child.href)
                            ? 'bg-amber-400 text-[#1B2B5E] font-semibold'
                            : 'text-white/60 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-amber-400 text-[#1B2B5E] shadow-md'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center text-[#1B2B5E] font-bold text-sm flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/50 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-white/50 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-white/50 hover:text-red-400">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
