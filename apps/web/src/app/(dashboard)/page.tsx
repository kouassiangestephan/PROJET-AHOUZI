'use client';

import {
  TrendingUp, TrendingDown, Users, BedDouble, CalendarCheck,
  Wrench, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
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
  { name: 'Direct', value: 42 },
  { name: 'Site Web', value: 28 },
  { name: 'Téléphone', value: 15 },
  { name: 'Walk-in', value: 10 },
  { name: 'Agence', value: 5 },
];

const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

const recentReservations = [
  { code: 'RES-001', client: 'Konan Akissi', chambre: '201', checkin: '23/12/2024', statut: 'CHECKED_IN', montant: 150000 },
  { code: 'RES-002', client: 'Kouamé Yao', chambre: '305', checkin: '23/12/2024', statut: 'CONFIRMED', montant: 95000 },
  { code: 'RES-003', client: 'Adjoua Koffi', chambre: '102', checkin: '24/12/2024', statut: 'CONFIRMED', montant: 220000 },
  { code: 'RES-004', client: "N'Guessan Paul", chambre: '410', checkin: '24/12/2024', statut: 'PENDING', montant: 75000 },
  { code: 'RES-005', client: 'Fatou Diallo', chambre: '503', checkin: '25/12/2024', statut: 'CONFIRMED', montant: 180000 },
];

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PENDING:    { label: 'En attente',  dot: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  CONFIRMED:  { label: 'Confirmée',   dot: 'bg-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  CHECKED_IN: { label: 'En séjour',   dot: 'bg-emerald-400',bg: 'bg-emerald-50',text: 'text-emerald-700' },
  CHECKED_OUT:{ label: 'Terminée',    dot: 'bg-slate-300',  bg: 'bg-slate-50',  text: 'text-slate-600' },
  CANCELLED:  { label: 'Annulée',     dot: 'bg-red-400',    bg: 'bg-red-50',    text: 'text-red-700' },
};

const kpis = [
  {
    title: "Taux d'occupation",
    value: '78.4%',
    sub: '94 / 120 chambres',
    trend: +5.2,
    gradient: 'gradient-indigo',
    icon: BedDouble,
  },
  {
    title: 'Revenus du mois',
    value: formatCurrency(7100000),
    sub: 'Décembre 2024',
    trend: +12.5,
    gradient: 'gradient-amber',
    icon: DollarSign,
  },
  {
    title: 'Nouveaux clients',
    value: '142',
    sub: 'Ce mois-ci',
    trend: +7.8,
    gradient: 'gradient-purple',
    icon: Users,
  },
  {
    title: 'RevPAR',
    value: formatCurrency(55600),
    sub: 'Revenu par chambre dispo',
    trend: +8.3,
    gradient: 'gradient-teal',
    icon: Activity,
  },
  {
    title: 'Check-ins aujourd\'hui',
    value: '12',
    sub: '5 check-outs prévus',
    trend: undefined,
    gradient: 'gradient-blue',
    icon: CalendarCheck,
  },
  {
    title: 'Tickets maintenance',
    value: '8',
    sub: '3 urgents',
    trend: undefined,
    gradient: 'gradient-rose',
    icon: Wrench,
  },
  {
    title: 'Dépenses du mois',
    value: formatCurrency(2800000),
    sub: 'Décembre 2024',
    trend: -3.1,
    gradient: 'gradient-amber',
    icon: TrendingDown,
  },
  {
    title: 'Bénéfice net',
    value: formatCurrency(4300000),
    sub: 'Ce mois-ci',
    trend: +18.4,
    gradient: 'gradient-green',
    icon: TrendingUp,
  },
];

const activities = [
  { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', text: 'Check-in effectué — Chambre 201', time: 'il y a 5 min' },
  { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Ticket maintenance ouvert — Climatisation', time: 'il y a 12 min' },
  { icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-50', text: 'Paiement reçu — 150 000 XOF via Wave', time: 'il y a 28 min' },
  { icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', text: 'Nouveau client enregistré — Konan Akissi', time: 'il y a 1h' },
  { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', text: 'Réservation RES-006 confirmée', time: 'il y a 2h' },
];

function KPICard({ title, value, sub, trend, gradient, icon: Icon }: typeof kpis[0]) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-[22px] font-bold text-slate-900 leading-none">{value}</p>
          <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
        </div>
        <div className={`${gradient} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-[12px] font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          {positive
            ? <ArrowUpRight size={14} className="flex-shrink-0" />
            : <ArrowDownRight size={14} className="flex-shrink-0" />}
          <span>{Math.abs(trend)}% vs mois dernier</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : `${p.value}%`}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1440px]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-slate-500">Lundi 23 décembre 2024</p>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">Bonjour, Admin 👋</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            Décembre 2024
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white gradient-indigo rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            + Nouvelle réservation
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => <KPICard key={k.title} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue chart */}
        <div className="card lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-slate-800">Revenus vs Dépenses</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex gap-1">
              {['6M', '1A', 'Tout'].map(t => (
                <button key={t} className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${t === '6M' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#6366F1" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#F59E0B" strokeWidth={2} fill="url(#gDep)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking sources */}
        <div className="card p-6">
          <div className="mb-5">
            <h3 className="text-[14px] font-semibold text-slate-800">Sources de réservation</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Ce mois-ci</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                  <span className="text-[12px] text-slate-600">{s.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-slate-700">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: table + activity + occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent reservations */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-[14px] font-semibold text-slate-800">Réservations récentes</h3>
            <a href="/reservations" className="text-[12px] text-indigo-500 font-medium hover:text-indigo-700 transition-colors">Voir tout →</a>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Client</th>
                <th>Chambre</th>
                <th>Check-in</th>
                <th>Statut</th>
                <th className="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map(r => {
                const s = STATUS_CONFIG[r.statut];
                return (
                  <tr key={r.code} className="cursor-pointer">
                    <td><span className="font-mono text-[12px] text-indigo-600 font-semibold">{r.code}</span></td>
                    <td><span className="font-medium text-slate-800">{r.client}</span></td>
                    <td><span className="text-slate-500">{r.chambre}</span></td>
                    <td><span className="text-slate-500">{r.checkin}</span></td>
                    <td>
                      <span className={`badge-pill ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-slate-800">{formatCurrency(r.montant)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right column: Activity + Occupancy bar */}
        <div className="space-y-5">
          {/* Activity feed */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Activité récente</h3>
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <a.icon size={13} className={a.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly occupancy */}
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-slate-800 mb-4">Occupation mensuelle</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={occupancyData.slice(-6)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #f1f5f9' }} />
                <Bar dataKey="taux" name="Occupation" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
