'use client';

import { useState } from 'react';
import { useList, useCreate, useUpdate } from '@/hooks/useApi';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RefreshCw, Wrench } from 'lucide-react';

const ticketSchema = z.object({
  title: z.string().min(2, 'Titre requis'),
  description: z.string().min(5, 'Description requise'),
  roomId: z.string().optional(),
  priority: z.string().min(1, 'Priorité requise'),
  category: z.string().min(1, 'Catégorie requise'),
  assignedToId: z.string().optional(),
});
type TicketForm = z.infer<typeof ticketSchema>;

const CATEGORIES = [
  { value: 'PLUMBING', label: 'Plomberie' },
  { value: 'ELECTRICAL', label: 'Électricité' },
  { value: 'HVAC', label: 'Climatisation / Chauffage' },
  { value: 'FURNITURE', label: 'Mobilier' },
  { value: 'TECHNOLOGY', label: 'Technologie / IT' },
  { value: 'CLEANING', label: 'Nettoyage spécial' },
  { value: 'OTHER', label: 'Autre' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'CRITICAL', label: 'Critique' },
];

const STATUS_VARIANTS: Record<string, any> = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default', CANCELLED: 'danger' };
const STATUS_LABELS: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu', CLOSED: 'Fermé', CANCELLED: 'Annulé' };
const PRIORITY_VARIANTS: Record<string, any> = { LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'danger' };

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);

  const { data, isLoading, refetch } = useList('/maintenance/tickets', { page, limit: 20, status: statusFilter || undefined });
  const { data: roomsData } = useList('/rooms', { limit: 100 });
  const { data: staffData } = useList('/hr/employees', { limit: 100 });
  const createTicket = useCreate('/maintenance/tickets');
  const updateTicket = useUpdate('/maintenance/tickets');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({ resolver: zodResolver(ticketSchema) });

  const tickets = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination;
  const rooms = (roomsData as any)?.data ?? [];
  const staff = (staffData as any)?.data ?? [];

  const onSubmit = async (values: TicketForm) => {
    await createTicket.mutateAsync(values);
    reset(); setCreateOpen(false); refetch();
  };

  const columns = [
    {
      key: 'ref', header: 'Référence',
      render: (r: any) => <div><p className="font-mono text-xs text-[#1B2B5E] font-medium">{r.ticketNumber ?? r.id.slice(0,8).toUpperCase()}</p><p className="font-medium text-gray-900 text-sm mt-0.5">{r.title}</p></div>
    },
    { key: 'category', header: 'Catégorie', render: (r: any) => CATEGORIES.find(c => c.value === r.category)?.label ?? r.category },
    { key: 'priority', header: 'Priorité', render: (r: any) => <Badge variant={PRIORITY_VARIANTS[r.priority]}>{PRIORITIES.find(p => p.value === r.priority)?.label ?? r.priority}</Badge> },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge variant={STATUS_VARIANTS[r.status]}>{STATUS_LABELS[r.status] ?? r.status}</Badge> },
    { key: 'room', header: 'Chambre', render: (r: any) => r.room?.number ?? <span className="text-gray-400">Communs</span> },
    { key: 'assignedTo', header: 'Technicien', render: (r: any) => r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : <span className="text-gray-400">—</span> },
    {
      key: 'actions', header: '', render: (r: any) => (
        <div className="flex gap-1">
          {r.status === 'OPEN' && <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); updateTicket.mutateAsync({ id: r.id, data: { status: 'IN_PROGRESS' } }).then(() => refetch()); }}>Démarrer</Button>}
          {r.status === 'IN_PROGRESS' && <Button size="sm" onClick={e => { e.stopPropagation(); updateTicket.mutateAsync({ id: r.id, data: { status: 'RESOLVED' } }).then(() => refetch()); }}>Résoudre</Button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des tickets de maintenance et réparations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" />Nouveau ticket</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Ouverts', status: 'OPEN', color: 'text-amber-600 bg-amber-50' },
          { label: 'En cours', status: 'IN_PROGRESS', color: 'text-blue-600 bg-blue-50' },
          { label: 'Résolus', status: 'RESOLVED', color: 'text-green-600 bg-green-50' },
          { label: 'Critiques', status: 'CRITICAL', color: 'text-red-600 bg-red-50' },
        ].map(item => (
          <div key={item.status} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${item.color}`}>
              <Wrench size={12} />{item.label}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {tickets.filter((t: any) => t.status === item.status || t.priority === item.status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <Select
            options={[{ value: '', label: 'Tous les statuts' }, ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-48"
          />
        </div>
        <Table columns={columns} data={tickets} loading={isLoading} keyExtractor={(r: any) => r.id} onRowClick={setDetailTicket} emptyMessage="Aucun ticket de maintenance" />
        {pagination && pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onChange={setPage} />}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Nouveau ticket de maintenance" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Titre" placeholder="Ex: Fuite robinet salle de bain" error={errors.title?.message} {...register('title')} />
          <Input label="Description" placeholder="Décrivez le problème en détail..." error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" options={CATEGORIES} placeholder="Catégorie" error={errors.category?.message} {...register('category')} />
            <Select label="Priorité" options={PRIORITIES} placeholder="Priorité" error={errors.priority?.message} {...register('priority')} />
          </div>
          <Select label="Chambre concernée" options={[{ value: '', label: 'Parties communes' }, ...rooms.map((r: any) => ({ value: r.id, label: `${r.number} — ${r.property?.name ?? ''}` }))]} {...register('roomId')} />
          <Select label="Technicien assigné" options={staff.map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))} placeholder="Sélectionner un technicien" {...register('assignedToId')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); reset(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createTicket.isPending}>Créer le ticket</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailTicket} onClose={() => setDetailTicket(null)} title={`Ticket — ${detailTicket?.ticketNumber ?? ''}`} size="lg">
        {detailTicket && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={STATUS_VARIANTS[detailTicket.status]}>{STATUS_LABELS[detailTicket.status]}</Badge>
              <Badge variant={PRIORITY_VARIANTS[detailTicket.priority]}>{PRIORITIES.find(p => p.value === detailTicket.priority)?.label}</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{detailTicket.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{detailTicket.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Catégorie</span><p className="font-medium">{CATEGORIES.find(c => c.value === detailTicket.category)?.label}</p></div>
              <div><span className="text-gray-500">Chambre</span><p className="font-medium">{detailTicket.room?.number ?? 'Parties communes'}</p></div>
              <div><span className="text-gray-500">Technicien</span><p className="font-medium">{detailTicket.assignedTo ? `${detailTicket.assignedTo.firstName} ${detailTicket.assignedTo.lastName}` : '—'}</p></div>
              <div><span className="text-gray-500">Créé le</span><p className="font-medium">{new Date(detailTicket.createdAt).toLocaleDateString('fr-CI')}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
