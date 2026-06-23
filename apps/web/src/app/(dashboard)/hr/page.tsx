'use client';

import { useState } from 'react';
import { useList, useCreate } from '@/hooks/useApi';
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
import { Plus, Users, RefreshCw, Search } from 'lucide-react';

const employeeSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Département requis'),
  jobTitle: z.string().min(2, 'Poste requis'),
  salary: z.string().optional(),
  hireDate: z.string().min(1, 'Date d\'embauche requise'),
  propertyId: z.string().optional(),
});
type EmployeeForm = z.infer<typeof employeeSchema>;

const DEPARTMENTS = [
  { value: 'RECEPTION', label: 'Réception' },
  { value: 'HOUSEKEEPING', label: 'Housekeeping' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'SECURITY', label: 'Sécurité' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HR', label: 'Ressources Humaines' },
  { value: 'MANAGEMENT', label: 'Direction' },
];

const STATUS_VARIANTS: Record<string, any> = { ACTIVE: 'success', INACTIVE: 'default', ON_LEAVE: 'warning', TERMINATED: 'danger' };
const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Actif', INACTIVE: 'Inactif', ON_LEAVE: 'En congé', TERMINATED: 'Licencié' };

export default function HrPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<any>(null);

  const { data, isLoading, refetch } = useList('/hr/employees', { page, limit: 20, search: search || undefined, department: deptFilter || undefined });
  const { data: propertiesData } = useList('/properties', { limit: 100 });
  const createEmployee = useCreate('/hr/employees');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema) });

  const employees = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination;
  const properties = (propertiesData as any)?.data ?? [];

  const onSubmit = async (values: EmployeeForm) => {
    await createEmployee.mutateAsync({ ...values, salary: values.salary ? parseFloat(values.salary) : undefined });
    reset(); setCreateOpen(false); refetch();
  };

  const getInitials = (first: string, last: string) => `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

  const columns = [
    {
      key: 'name', header: 'Employé',
      render: (r: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {getInitials(r.firstName, r.lastName)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{r.firstName} {r.lastName}</p>
            <p className="text-xs text-gray-500">{r.email}</p>
          </div>
        </div>
      )
    },
    { key: 'jobTitle', header: 'Poste', render: (r: any) => r.jobTitle },
    { key: 'department', header: 'Département', render: (r: any) => DEPARTMENTS.find(d => d.value === r.department)?.label ?? r.department },
    { key: 'property', header: 'Établissement', render: (r: any) => r.property?.name ?? <span className="text-gray-400">Siège</span> },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge variant={STATUS_VARIANTS[r.status ?? 'ACTIVE']}>{STATUS_LABELS[r.status ?? 'ACTIVE']}</Badge> },
    { key: 'hireDate', header: 'Embauché le', render: (r: any) => r.hireDate ? new Date(r.hireDate).toLocaleDateString('fr-CI') : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ressources Humaines</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des employés, congés et paie</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" />Nouvel employé</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total employés', value: (data as any)?.pagination?.total ?? 0, color: 'text-[#1B2B5E] bg-blue-50' },
          { label: 'Actifs', value: employees.filter((e: any) => (e.status ?? 'ACTIVE') === 'ACTIVE').length, color: 'text-green-600 bg-green-50' },
          { label: 'En congé', value: employees.filter((e: any) => e.status === 'ON_LEAVE').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'Départements', value: DEPARTMENTS.length, color: 'text-purple-600 bg-purple-50' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${item.color}`}>
              <Users size={12} />{item.label}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2B5E] focus:bg-white"
              placeholder="Rechercher un employé..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            options={[{ value: '', label: 'Tous les départements' }, ...DEPARTMENTS]}
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="w-52"
          />
        </div>
        <Table columns={columns} data={employees} loading={isLoading} keyExtractor={(r: any) => r.id} onRowClick={setDetailEmployee} emptyMessage="Aucun employé trouvé" />
        {pagination && pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onChange={setPage} />}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Nouvel employé" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" placeholder="Jean" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Nom" placeholder="Kouassi" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="jean@hotel.ci" error={errors.email?.message} {...register('email')} />
            <Input label="Téléphone" placeholder="+225 07 00 00 00 00" {...register('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Département" options={DEPARTMENTS} placeholder="Sélectionner" error={errors.department?.message} {...register('department')} />
            <Input label="Poste" placeholder="Ex: Chef de réception" error={errors.jobTitle?.message} {...register('jobTitle')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Salaire (XOF)" type="number" placeholder="250000" {...register('salary')} />
            <Input label="Date d'embauche" type="date" error={errors.hireDate?.message} {...register('hireDate')} />
          </div>
          <Select
            label="Établissement"
            options={[{ value: '', label: 'Siège social' }, ...properties.map((p: any) => ({ value: p.id, label: p.name }))]}
            {...register('propertyId')}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); reset(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createEmployee.isPending}>Créer l'employé</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailEmployee} onClose={() => setDetailEmployee(null)} title="Fiche employé" size="md">
        {detailEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center text-xl font-bold">
                {getInitials(detailEmployee.firstName, detailEmployee.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{detailEmployee.firstName} {detailEmployee.lastName}</h3>
                <p className="text-sm text-gray-500">{detailEmployee.jobTitle}</p>
                <Badge variant={STATUS_VARIANTS[detailEmployee.status ?? 'ACTIVE']}>{STATUS_LABELS[detailEmployee.status ?? 'ACTIVE']}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Email</span><p className="font-medium">{detailEmployee.email}</p></div>
              <div><span className="text-gray-500">Téléphone</span><p className="font-medium">{detailEmployee.phone ?? '—'}</p></div>
              <div><span className="text-gray-500">Département</span><p className="font-medium">{DEPARTMENTS.find(d => d.value === detailEmployee.department)?.label}</p></div>
              <div><span className="text-gray-500">Établissement</span><p className="font-medium">{detailEmployee.property?.name ?? 'Siège'}</p></div>
              <div><span className="text-gray-500">Date d'embauche</span><p className="font-medium">{detailEmployee.hireDate ? new Date(detailEmployee.hireDate).toLocaleDateString('fr-CI') : '—'}</p></div>
              <div><span className="text-gray-500">Salaire</span><p className="font-medium">{detailEmployee.salary ? new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(detailEmployee.salary) : '—'}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
