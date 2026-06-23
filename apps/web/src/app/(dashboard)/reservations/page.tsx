'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Eye, XCircle, LogIn, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmée', variant: 'info' },
  CHECKED_IN: { label: 'En séjour', variant: 'success' },
  CHECKED_OUT: { label: 'Terminée', variant: 'ghost' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  NO_SHOW: { label: 'Non présenté', variant: 'danger' },
};

const reservationSchema = z.object({
  propertyId: z.string().min(1, 'Propriété requise'),
  customerId: z.string().min(1, 'Client requis'),
  roomId: z.string().min(1, 'Chambre requise'),
  checkIn: z.string().min(1, "Date d'arrivée requise"),
  checkOut: z.string().min(1, 'Date de départ requise'),
  adults: z.coerce.number().min(1),
  children: z.coerce.number().min(0),
  source: z.string().optional(),
  notes: z.string().optional(),
});
type ReservationForm = z.infer<typeof reservationSchema>;

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page, search],
    queryFn: async () => {
      const res = await api.get('/reservations', { params: { page, limit: 20, search } });
      return res.data;
    },
  });

  const { data: propertiesRes } = useQuery({
    queryKey: ['properties-list'],
    queryFn: async () => { const r = await api.get('/properties'); return r.data; },
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { adults: 1, children: 0, source: 'DIRECT' },
  });

  const selectedPropertyId = watch('propertyId');

  const { data: roomsRes } = useQuery({
    queryKey: ['rooms', selectedPropertyId],
    queryFn: async () => { const r = await api.get(`/properties/${selectedPropertyId}/rooms`); return r.data; },
    enabled: !!selectedPropertyId,
  });

  const { data: customersRes } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => { const r = await api.get('/customers', { params: { limit: 100 } }); return r.data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: ReservationForm) => api.post('/reservations', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reservations'] }); setShowModal(false); reset(); },
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, body }: any) => api.patch(`/reservations/${id}/${action}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  const reservations: any[] = data?.data || [];
  const pagination = data?.pagination;
  const properties = propertiesRes?.data || [];
  const rooms = roomsRes?.data || [];
  const customers = customersRes?.data || [];

  const columns = [
    { key: 'code', header: 'Code', render: (r: any) => <span className="font-mono font-semibold text-[#1B2B5E] text-xs">{r.code}</span> },
    { key: 'customer', header: 'Client', render: (r: any) => (
      <div>
        <p className="font-medium text-gray-900">{r.customer?.firstName} {r.customer?.lastName}</p>
        <p className="text-xs text-gray-400">{r.customer?.phone}</p>
      </div>
    )},
    { key: 'room', header: 'Chambre', render: (r: any) => <span className="font-medium">N° {r.room?.number}</span> },
    { key: 'dates', header: 'Séjour', render: (r: any) => (
      <div>
        <p className="font-medium text-sm">{formatDate(r.checkIn)} → {formatDate(r.checkOut)}</p>
        <p className="text-xs text-gray-400">{r.nights} nuit{r.nights > 1 ? 's' : ''} · {r.adults} adulte{r.adults > 1 ? 's' : ''}</p>
      </div>
    )},
    { key: 'status', header: 'Statut', render: (r: any) => {
      const s = STATUS_BADGE[r.status] || { label: r.status, variant: 'default' };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    }},
    { key: 'totalAmount', header: 'Montant', className: 'text-right', render: (r: any) => (
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(r.totalAmount)}</p>
        {r.balanceAmount > 0 && <p className="text-xs text-red-500">Reste: {formatCurrency(r.balanceAmount)}</p>}
      </div>
    )},
    { key: 'actions', header: '', render: (r: any) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(r); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Eye size={14} /></button>
        {r.status === 'CONFIRMED' && <button onClick={(e) => { e.stopPropagation(); actionMutation.mutate({ id: r.id, action: 'check-in' }); }} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><LogIn size={14} /></button>}
        {r.status === 'CHECKED_IN' && <button onClick={(e) => { e.stopPropagation(); actionMutation.mutate({ id: r.id, action: 'check-out' }); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><LogOut size={14} /></button>}
        {['PENDING','CONFIRMED'].includes(r.status) && <button onClick={(e) => { e.stopPropagation(); setCancelId(r.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><XCircle size={14} /></button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination?.total ?? 0} réservation(s)</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Nouvelle réservation</Button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Input placeholder="Rechercher…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={<Search size={14} />} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <Filter size={14} /> Filtres
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={reservations} loading={isLoading} keyExtractor={(r) => r.id} emptyMessage="Aucune réservation trouvée" />
        {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onChange={setPage} />}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouvelle réservation" size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Propriété *" options={properties.map((p: any) => ({ value: p.id, label: p.name }))} placeholder="Sélectionner" error={errors.propertyId?.message} {...register('propertyId')} />
            <Select label="Client *" options={customers.map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} placeholder="Sélectionner" error={errors.customerId?.message} {...register('customerId')} />
          </div>
          <Select label="Chambre *" options={rooms.map((r: any) => ({ value: r.id, label: `Chambre ${r.number} — ${formatCurrency(r.basePrice)}/nuit` }))} placeholder={selectedPropertyId ? 'Sélectionner une chambre' : "Choisir d'abord une propriété"} error={errors.roomId?.message} {...register('roomId')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Arrivée *" type="date" error={errors.checkIn?.message} {...register('checkIn')} />
            <Input label="Départ *" type="date" error={errors.checkOut?.message} {...register('checkOut')} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Adultes" type="number" min={1} {...register('adults')} />
            <Input label="Enfants" type="number" min={0} {...register('children')} />
            <Select label="Source" options={[{value:'DIRECT',label:'Direct'},{value:'WEBSITE',label:'Site web'},{value:'PHONE',label:'Téléphone'},{value:'WALKIN',label:'Walk-in'},{value:'OTA',label:'OTA'},{value:'AGENCY',label:'Agence'}]} {...register('source')} />
          </div>
          <Input label="Notes" placeholder="Notes internes" {...register('notes')} />
          {createMutation.isError && <p className="text-sm text-red-500">{(createMutation.error as any)?.response?.data?.message}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); reset(); }}>Annuler</Button>
            <Button type="submit" loading={createMutation.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!cancelId} onClose={() => { setCancelId(null); setCancelReason(''); }} title="Annuler la réservation" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Veuillez indiquer le motif d'annulation.</p>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Motif *</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Raison…" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#1B2B5E]" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setCancelId(null); setCancelReason(''); }}>Retour</Button>
            <Button variant="danger" disabled={!cancelReason.trim()} loading={actionMutation.isPending} onClick={() => actionMutation.mutate({ id: cancelId!, action: 'cancel', body: { reason: cancelReason } }, { onSuccess: () => { setCancelId(null); setCancelReason(''); }})}>Confirmer</Button>
          </div>
        </div>
      </Modal>

      {showDetail && (
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={`Réservation ${showDetail.code}`} size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Client', value: `${showDetail.customer?.firstName} ${showDetail.customer?.lastName}`, sub: showDetail.customer?.phone },
              { label: 'Chambre', value: `N° ${showDetail.room?.number}`, sub: showDetail.room?.category },
              { label: 'Séjour', value: `${formatDate(showDetail.checkIn)} → ${formatDate(showDetail.checkOut)}`, sub: `${showDetail.nights} nuit(s)` },
              { label: 'Montant', value: formatCurrency(showDetail.totalAmount), sub: showDetail.balanceAmount > 0 ? `Reste: ${formatCurrency(showDetail.balanceAmount)}` : 'Soldé' },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
