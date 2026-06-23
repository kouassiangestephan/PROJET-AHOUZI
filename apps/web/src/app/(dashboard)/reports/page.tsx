'use client';

import { useState } from 'react';
import { useList } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Users, Hotel, Download } from 'lucide-react';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const COLORS = ['#1B2B5E', '#D4A017', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [propertyFilter, setPropertyFilter] = useState('');

  const { data: statsData, isLoading, refetch } = useList('/reports/overview', { period, propertyId: propertyFilter || undefined });
  const { data: revenueData } = useList('/reports/revenue', { period, propertyId: propertyFilter || undefined });
  const { data: occupancyData } = useList('/reports/occupancy', { period, propertyId: propertyFilter || undefined });
  const { data: sourceData } = useList('/reports/booking-sources', { period, propertyId: propertyFilter || undefined });
  const { data: propertiesData } = useList('/properties', { limit: 100 });

  const stats = (statsData as any)?.data ?? {};
  const revenue = (revenueData as any)?.data ?? [];
  const occupancy = (occupancyData as any)?.data ?? [];
  const sources = (sourceData as any)?.data ?? [];
  const properties = (propertiesData as any)?.data ?? [];

  const kpis = [
    { label: 'Chiffre d\'affaires', value: formatXOF(stats.totalRevenue ?? 0), change: stats.revenueChange ?? 0, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'Taux d\'occupation', value: `${stats.occupancyRate ?? 0}%`, change: stats.occupancyChange ?? 0, icon: Hotel, color: 'text-[#1B2B5E] bg-blue-50' },
    { label: 'Nouveaux clients', value: stats.newCustomers ?? 0, change: stats.customersChange ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Réservations', value: stats.totalReservations ?? 0, change: stats.reservationsChange ?? 0, icon: TrendingDown, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-sm text-gray-500 mt-1">Indicateurs de performance et statistiques</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button variant="outline"><Download size={16} className="mr-2" />Exporter PDF</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Select
          options={[
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
            { value: 'quarter', label: 'Ce trimestre' },
            { value: 'year', label: 'Cette année' },
          ]}
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="w-44"
        />
        <Select
          options={[{ value: '', label: 'Tous les établissements' }, ...properties.map((p: any) => ({ value: p.id, label: p.name }))]}
          value={propertyFilter}
          onChange={e => setPropertyFilter(e.target.value)}
          className="w-56"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className={`inline-flex p-2 rounded-xl ${kpi.color} mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{kpi.value}</p>
            {kpi.change !== 0 && (
              <p className={`text-xs mt-1 font-medium ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}% vs période précédente
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Chiffre d&apos;affaires</h2>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue.length > 0 ? revenue : MONTHS.map((m, i) => ({ month: m, revenue: 0, expenses: 0 }))}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B2B5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A017" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip formatter={(v: number) => formatXOF(v)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Recettes" stroke="#1B2B5E" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenses" name="Dépenses" stroke="#D4A017" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Sources de réservation</h2>
          {isLoading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sources.length > 0 ? sources : [{ name: 'Direct', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(sources.length > 0 ? sources : [{ name: 'Direct', value: 1 }]).map((_: any, idx: number) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Taux d&apos;occupation mensuel (%)</h2>
        {isLoading ? (
          <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={occupancy.length > 0 ? occupancy : MONTHS.map(m => ({ month: m, rate: 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" name="Occupation" fill="#1B2B5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
