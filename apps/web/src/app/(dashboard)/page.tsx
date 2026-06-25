'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BedDouble, CalendarCheck, Wrench, TrendingUp, TrendingDown,
  ArrowUpRight, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  PENDING:     { label: 'En attente',  dot: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  CONFIRMED:   { label: 'Confirmée',   dot: 'bg-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  CHECKED_IN:  { label: 'En séjour',   dot: 'bg-emerald-400',bg: 'bg-emerald-50',text: 'text-emerald-700' },
  CHECKED_OUT: { label: 'Terminée',    dot: 'bg-slate-400',  bg: 'bg-slate-100', text: 'text-slate-600' },
  CANCELLED:   { label: 'Annulée',     dot: 'bg-red-400',    bg: 'bg-red-50',    text: 'text-red-700' },
};

function KPICard({ title, value, sub, icon: Icon, gradient, trend, trendLabel }: any) {
  const up = trend === undefined ? null : trend >= 0;
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 truncate">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
          {trendLabel && (
            <p className={`mt-1 text-xs font-medium flex items-center gap-0.5 ${up === null ? 'text-slate-400' : up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up !== null && (up ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />)}
              {trendLabel}
            </p>
          )}
        </div>
        <div className={`icon-wrap w-12 h-12 flex-shrink-0 ${gradient}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="kpi-card animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
          <div className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle size={40} className="text-red-400" />
      <p className="text-slate-600 font-medium">{message}</p>
      <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        <RefreshCw size={14} />
        Réessayer
      </button>
    </div>
  );
}

const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function buildMonthlyRevenue(payments: any[]): any[] {
  const byMonth: Record<number, { revenus: number; depenses: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    byMonth[d.getMonth()] = { revenus: 0, depenses: 0 };
  }
  (payments || []).forEach((p: any) => {
    const m = new Date(p.processedAt).getMonth();
    if (byMonth[m] !== undefined) byMonth[m].revenus += Number(p.amount);
  });
  return Object.entries(byMonth).map(([m, v]) => ({
    mois: MONTH_LABELS[Number(m)],
    ...v,
  }));
}

export default function DashboardPage() {
  const { data: dashData, isLoading, isError, error, refetch } = useQuery<any>({
    queryKey: ['reports/dashboard'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data;
    },
    staleTime: 60_000,
    retry: 2,
  });

  const { data: recentRes } = useQuery<any>({
    queryKey: ['reservations', { limit: 6 }],
    queryFn: async () => {
      const res = await api.get('/reservations', { params: { limit: 6, page: 1 } });
      return res.data;
    },
    staleTime: 30_000,
  });

  const { data: roomsData } = useQuery<any>({
    queryKey: ['rooms', { limit: 100 }],
    queryFn: async () => {
      const res = await api.get('/rooms', { params: { limit: 100 } });
      return res.data;
    },
  });

  if (isLoading) return <LoadingGrid />;
  if (isError) {
    const msg = (error as any)?.response?.status === 401
      ? 'Session expirée. Veuillez vous reconnecter.'
      : 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.';
    return <ErrorState message={msg} onRetry={refetch} />;
  }

  const kpis = dashData?.data?.kpis ?? {};
  const reservations: any[] = recentRes?.data ?? [];
  const rooms: any[] = roomsData?.data ?? [];

  const roomStatusCount = rooms.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(roomStatusCount).map(([name, value]) => ({ name, value }));
  const roomStatusLabel: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Occupée',
    MAINTENANCE: 'Maintenance',
    CLEANING: 'Ménage',
    OUT_OF_ORDER: 'Hors service',
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">Vue d'ensemble en temps réel de votre établissement</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Taux d'occupation"
          value={`${kpis.occupancyRate?.toFixed(1) ?? 0}%`}
          sub={`${kpis.occupiedRooms ?? 0} / ${kpis.totalRooms ?? 0} chambres`}
          icon={BedDouble}
          gradient="gradient-indigo"
          trendLabel={kpis.occupancyRate > 70 ? 'Bonne performance' : 'À améliorer'}
          trend={kpis.occupancyRate > 70 ? 1 : -1}
        />
        <KPICard
          title="Réservations actives"
          value={kpis.confirmedReservations ?? 0}
          sub="Confirmées + En séjour"
          icon={CalendarCheck}
          gradient="gradient-blue"
        />
        <KPICard
          title="Revenus du mois"
          value={formatCurrency(kpis.monthRevenue ?? 0)}
          sub={`Dépenses: ${formatCurrency(kpis.monthExpenses ?? 0)}`}
          icon={TrendingUp}
          gradient="gradient-green"
          trendLabel={kpis.netProfit >= 0 ? `Bénéfice net: ${formatCurrency(kpis.netProfit ?? 0)}` : `Déficit: ${formatCurrency(Math.abs(kpis.netProfit ?? 0))}`}
          trend={kpis.netProfit >= 0 ? 1 : -1}
        />
        <KPICard
          title="Maintenance en attente"
          value={kpis.pendingMaintenance ?? 0}
          sub="Tickets ouverts"
          icon={Wrench}
          gradient={kpis.pendingMaintenance > 5 ? 'gradient-rose' : 'gradient-amber'}
          trendLabel={kpis.pendingMaintenance > 5 ? 'Attention requise' : 'Sous contrôle'}
          trend={kpis.pendingMaintenance > 5 ? -1 : 1}
        />
        <KPICard
          title="ADR (Prix moyen)"
          value={formatCurrency(kpis.adr ?? 0)}
          sub="Par chambre occupée"
          icon={TrendingUp}
          gradient="gradient-purple"
        />
        <KPICard
          title="RevPAR"
          value={formatCurrency(kpis.revpar ?? 0)}
          sub="Revenu par chambre disponible"
          icon={TrendingUp}
          gradient="gradient-teal"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenus 6 mois */}
        <div className="card xl:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenus vs Dépenses (6 derniers mois)</h3>
          {kpis.monthRevenue === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Aucune donnée financière pour la période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={buildMonthlyRevenue([])} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
                <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#6366F1" fill="url(#colorRev)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#F59E0B" fill="url(#colorDep)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Statut des chambres */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Statut des chambres</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Aucune chambre enregistrée
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, name: string) => [v, roomStatusLabel[name] ?? name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {pieData.map((entry: any, i: number) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{roomStatusLabel[entry.name] ?? entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{entry.value as number}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Réservations récentes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Réservations récentes</h3>
          <a href="/reservations" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Voir tout <ArrowUpRight size={12} />
          </a>
        </div>
        {reservations.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <CalendarCheck size={32} className="mx-auto mb-2 opacity-30" />
            Aucune réservation enregistrée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Chambre</th>
                  <th>Arrivée</th>
                  <th>Statut</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r: any) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-xs text-slate-500">{r.bookingCode ?? r.id?.slice(0,8)}</td>
                      <td className="font-medium text-slate-700">
                        {r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : '—'}
                      </td>
                      <td>{r.room?.number ?? '—'}</td>
                      <td className="text-slate-500">{r.checkIn ? new Date(r.checkIn).toLocaleDateString('fr-CI') : '—'}</td>
                      <td>
                        <span className={`badge-pill ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="text-right font-semibold text-slate-700">{formatCurrency(r.totalAmount ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
