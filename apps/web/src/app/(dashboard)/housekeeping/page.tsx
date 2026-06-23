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
import { Plus, RefreshCw } from 'lucide-react';

const taskSchema = z.object({
  roomId: z.string().min(1, 'Chambre requise'),
  type: z.string().min(1, 'Type requis'),
  priority: z.string().min(1, 'Priorité requise'),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

const TASK_TYPES = [
  { value: 'CLEANING', label: 'Nettoyage' },
  { value: 'DEEP_CLEANING', label: 'Grand nettoyage' },
  { value: 'TURNDOWN', label: 'Service couverture' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'LINEN_CHANGE', label: 'Changement linge' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Basse' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' },
];

const STATUS_VARIANTS: Record<string, any> = {
  PENDING: 'default', IN_PROGRESS: 'info', COMPLETED: 'success', VERIFIED: 'success', CANCELLED: 'danger',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', VERIFIED: 'Vérifié', CANCELLED: 'Annulé',
};
const PRIORITY_VARIANTS: Record<string, any> = {
  LOW: 'default', NORMAL: 'info', HIGH: 'warning', URGENT: 'danger',
};

export default function HousekeepingPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, refetch } = useList('/housekeeping/tasks', { page, limit: 20, status: statusFilter || undefined });
  const { data: roomsData } = useList('/rooms', { limit: 100 });
  const { data: staffData } = useList('/hr/employees', { limit: 100 });
  const createTask = useCreate('/housekeeping/tasks');
  const updateStatus = useUpdate('/housekeeping/tasks');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskForm>({ resolver: zodResolver(taskSchema) });

  const tasks = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination;
  const rooms = (roomsData as any)?.data ?? [];
  const staff = (staffData as any)?.data ?? [];

  const onSubmit = async (values: TaskForm) => {
    await createTask.mutateAsync(values);
    reset(); setCreateOpen(false); refetch();
  };

  const columns = [
    { key: 'room', header: 'Chambre', render: (r: any) => <div><p className="font-medium">{r.room?.number ?? '—'}</p><p className="text-xs text-gray-500">{r.room?.property?.name ?? ''}</p></div> },
    { key: 'type', header: 'Type', render: (r: any) => TASK_TYPES.find(t => t.value === r.type)?.label ?? r.type },
    { key: 'priority', header: 'Priorité', render: (r: any) => <Badge variant={PRIORITY_VARIANTS[r.priority]}>{r.priority}</Badge> },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge variant={STATUS_VARIANTS[r.status]}>{STATUS_LABELS[r.status] ?? r.status}</Badge> },
    { key: 'assignedTo', header: 'Assigné à', render: (r: any) => r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : <span className="text-gray-400">—</span> },
    {
      key: 'actions', header: '', render: (r: any) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); updateStatus.mutateAsync({ id: r.id, data: { status: 'IN_PROGRESS' } }).then(() => refetch()); }}>Démarrer</Button>}
          {r.status === 'IN_PROGRESS' && <Button size="sm" onClick={e => { e.stopPropagation(); updateStatus.mutateAsync({ id: r.id, data: { status: 'COMPLETED' } }).then(() => refetch()); }}>Terminer</Button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion du nettoyage et entretien des chambres</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" />Nouvelle tâche</Button>
        </div>
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
        <Table columns={columns} data={tasks} loading={isLoading} keyExtractor={(r: any) => r.id} emptyMessage="Aucune tâche de housekeeping" />
        {pagination && pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onChange={setPage} />}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Nouvelle tâche" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Chambre" options={rooms.map((r: any) => ({ value: r.id, label: `${r.number} — ${r.property?.name ?? ''}` }))} placeholder="Sélectionner une chambre" error={errors.roomId?.message} {...register('roomId')} />
          <Select label="Type" options={TASK_TYPES} placeholder="Type de tâche" error={errors.type?.message} {...register('type')} />
          <Select label="Priorité" options={PRIORITIES} placeholder="Priorité" error={errors.priority?.message} {...register('priority')} />
          <Select label="Assigner à" options={staff.map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))} placeholder="Sélectionner un agent" {...register('assignedToId')} />
          <Input label="Notes" placeholder="Instructions..." {...register('notes')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); reset(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createTask.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
