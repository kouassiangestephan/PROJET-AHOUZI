'use client';

import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, Users, BedDouble, CalendarCheck,
  Wrench, DollarSign, Activity,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const occupancyData = [
  { mois: 'Jan', taux: 62 }, { mois: 'Fév', taux: 75 }, { mois: 'Mar', taux: 68 },
  { mois: 'Avr', taux: 82 }, { mois: 'Mai', taux: 79 }, { mois: 'Jun', taux: 88 },
  { mois: 'Jul', taux: 91 }, { mois: 'Aoû', taux: 85 }, { mois: 'Sep', taux: 77 },
  { mois: 'Oct', taux: 83 }, { mois: 'Nov', taux: 71 }, { mois: 'Déc', taux: 94 },
];

const revenueData = [
  { mois: 'Jan', revenus: 4200000, depenses: 2100000 },
  { mois: 'Fév', revenus: 5100000, depenses: 2300000 },
  { mois: 'Mar', revenus: 4800000, depenses: 2200000 },
  { mois: 'Avr', revenus: 6200000, depenses: 2500000 },
  { mois: 'Mai', revenus: 5800000, depenses: 2400000 },
  { mois: 'Jun', revenus: 7100000, depenses: 2800000 },
];

const sourceData = [
  { name: 'Direct', value: 42, color: '#1B2B5E' },
  { name: 'Site Web', value: 28, color: '#D4A017' },
  { name: 'Téléphone', value: 15, color: '#10B981' },
  { name: 'Walk-in', value: 10, color: '#6366F1' },
  { name: 'Agence', value: 5, color: '#F59E0B' },
];

const recentReservations = [
  { code: 'RES-001', client: 'Konan Akissi', chambre: '201', checkin: '23/12/2024', statut: 'CHECKED_IN', montant: 150000 },
  { code: 'RES-002', client: 'Kouamé Yao', chambre: '305', checkin: '23/12/2024', statut: 'CONFIRMED', montant: 95000 },
  { code: 'RES-003', client: 'Adjoua Koffi', chambre: '102', checkin: '24/12/2024', statut: 'CONFIRMED', montant: 220000 },
  { code: 'RES-004', client: 'N\'Guessan Paul', chambre: '410', checkin: '24/12/2024', statut: 'PENDING', montant: 75000 },
  { code: 'RES-005', client: 'Fatou Diallo', chambre: '503', checkin: '25/12/2024', statut: 'CONFIRMED', montant: 180000 },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmée', className: 'bg-blue-100 text-blue-700' },
  CHECKED_IN: { label: 'En séjour', className: 'bg-green-100 text-green-700' },
  CHECKED_OUT: { label: 'Terminée', className: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
};

function KPICard({ title, value, subValue, trend, icon: Icon, color }: {
  title: string; value: string; subValue?: string; trend?: number;
  icon: React.ComponentType<any>; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
        </div>
        <div className={`${color} rounded-xl p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}% depuis le mois dernier</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const kpis = [
    { title: 'Taux d\'occupation', value: '78.4%', subValue: '94 / 120 chambres', trend: 5.2, icon: BedDouble, color: 'bg-[#1B2B5E]' },
    { title: 'Revenus du mois', value: formatCurrency(7100000), subValue: 'Décembre 2024', trend: 12.5, icon: DollarSign, color: 'bg-amber-500' },
    { title: 'Dépenses du mois', value: formatCurrency(2800000), subValue: 'Décembre 2024', trend: -3.1, icon: TrendingDown, color: 'bg-red-500' },
    { title: 'RevPAR', value: formatCurrency(55600), subValue: 'Revenu par chambre dispo', trend: 8.3, icon: Activity, color: 'bg-emerald-500' },
    { title: 'Nouveaux clients', value: '142', subValue: 'Ce mois-ci', trend: 7.8, icon: Users, color: 'bg-purple-500' },
    { title: 'Check-ins aujourd\'hui', value: '12', subValue: '5 check-outs prévus', icon: CalendarCheck, color: 'bg-blue-500' },
    { title: 'Tickets maintenance', value: '8', subValue: '3 urgents', icon: Wrench, color: 'bg-orange-500' },
    { title: 'Bénéfice net', value: formatCurrency(4300000), subValue: 'Ce mois-ci', trend: 18.4, icon: TrendingUp, color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenue sur la plateforme AHOUZI</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
          <CalendarCheck size={16} className="text-[#1B2B5E]" />
          <span>Décembre 2024</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution des revenus */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenus vs Dépenses (6 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B2B5E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B2B5E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="depenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), '']} />
              <Legend />
              <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#1B2B5E" fill="url(#revenus)" strokeWidth={2} />
              <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#EF4444" fill="url(#depenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sources de réservations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Sources de réservations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {sourceData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600">{s.name}</span>
                </div>
                <span className="font-medium text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Taux d'occupation mensuel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Taux d'occupation mensuel</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Taux d\'occupation']} />
            <Line type="monotone" dataKey="taux" stroke="#D4A017" strokeWidth={2.5} dot={{ fill: '#D4A017', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dernières réservations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Dernières réservations</h3>
          <a href="/reservations" className="text-sm text-[#1B2B5E] hover:text-amber-600 font-medium">
            Voir tout →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Chambre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Arrivée</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentReservations.map((r) => {
                const status = STATUS_CONFIG[r.statut];
                return (
                  <tr key={r.code} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-[#1B2B5E]">{r.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Chambre {r.chambre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.checkin}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(r.montant)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
