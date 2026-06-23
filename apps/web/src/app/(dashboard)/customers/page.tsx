'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Eye, Star, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

const LOYALTY_BADGE: Record<string, any> = {
  STANDARD: { label: 'Standard', variant: 'default' },
  SILVER: { label: 'Silver', variant: 'ghost' },
  GOLD: { label: 'Gold', variant: 'warning' },
  VIP: { label: 'VIP', variant: 'danger' },
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => { const r = await api.get('/customers', { params: { page, limit: 20, search } }); return r.data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/customers', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setShowModal(false); reset(); },
  });

  const customers: any[] = data?.data || [];
  const pagination = data?.pagination;

  const columns = [
    { key: 'name', header: 'Client', render: (c: any) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#1B2B5E] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {c.firstName[0]}{c.lastName[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
          <p className="text-xs text-gray-400">{c.nationality || 'Non renseigné'}</p>
        </div>
      </div>
    )},
    { key: 'contact', header: 'Contact', render: (c: any) => (
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-700"><Phone size={12} className="text-gray-400" />{c.phone}</div>
        {c.email && <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5"><Mail size={12} />{c.email}</div>}
      </div>
    )},
    { key: 'loyalty', header: 'Fidélité', render: (c: any) => {
      const l = LOYALTY_BADGE[c.loyaltyLevel] || { label: c.loyaltyLevel, variant: 'default' };
      return (
        <div>
          <Badge variant={l.variant}><Star size={10} className="mr-1" />{l.label}</Badge>
          <p className="text-xs text-gray-400 mt-1">{c.loyaltyPoints} pts</p>
        </div>
      );
    }},
    { key: 'stays', header: 'Séjours', render: (c: any) => (
      <div className="text-center">
        <p className="font-semibold text-gray-900">{c.totalStays}</p>
        <p className="text-xs text-gray-400">séjour(s)</p>
      </div>
    )},
    { key: 'totalSpent', header: 'Total dépensé', render: (c: any) => <span className="font-semibold">{formatCurrency(c.totalSpent)}</span> },
    { key: 'blacklisted', header: '', render: (c: any) => c.blacklisted ? <Badge variant="danger">Blacklisté</Badge> : null },
    { key: 'actions', header: '', render: (c: any) => (
      <button onClick={(e) => { e.stopPropagation(); setShowDetail(c); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Eye size={14} /></button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination?.total ?? 0} client(s) enregistré(s)</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Nouveau client</Button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Nom, email, téléphone…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={<Search size={14} />} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table columns={columns} data={customers} loading={isLoading} keyExtractor={(c) => c.id} emptyMessage="Aucun client trouvé" />
        {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onChange={setPage} />}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouveau client" size="md">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom *" {...register('firstName', { required: true })} />
            <Input label="Nom *" {...register('lastName', { required: true })} />
          </div>
          <Input label="Téléphone *" placeholder="+225 07 00 00 00 00" {...register('phone', { required: true })} />
          <Input label="Email" type="email" {...register('email')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nationalité" placeholder="Ivoirien(ne)" {...register('nationality')} />
            <Select label="Type pièce d'identité" options={[{value:'PASSPORT',label:'Passeport'},{value:'NATIONAL_ID',label:'CNI'},{value:'DRIVERS_LICENSE',label:'Permis de conduire'}]} placeholder="Sélectionner" {...register('idType')} />
          </div>
          <Input label="Numéro de pièce" {...register('idNumber')} />
          {createMutation.isError && <p className="text-sm text-red-500">{(createMutation.error as any)?.response?.data?.message}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); reset(); }}>Annuler</Button>
            <Button type="submit" loading={createMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {showDetail && (
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={`${showDetail.firstName} ${showDetail.lastName}`} size="md">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1B2B5E] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                {showDetail.firstName[0]}{showDetail.lastName[0]}
              </div>
              <div>
                <Badge variant={LOYALTY_BADGE[showDetail.loyaltyLevel]?.variant || 'default'}><Star size={10} className="mr-1" />{LOYALTY_BADGE[showDetail.loyaltyLevel]?.label}</Badge>
                <p className="text-gray-500 mt-1">{showDetail.loyaltyPoints} points fidélité</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Téléphone', value: showDetail.phone },
                { label: 'Email', value: showDetail.email || '—' },
                { label: 'Nationalité', value: showDetail.nationality || '—' },
                { label: 'Pièce d\'identité', value: showDetail.idNumber ? `${showDetail.idType} · ${showDetail.idNumber}` : '—' },
                { label: 'Séjours', value: `${showDetail.totalStays} séjour(s)` },
                { label: 'Total dépensé', value: formatCurrency(showDetail.totalSpent) },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="font-medium text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
