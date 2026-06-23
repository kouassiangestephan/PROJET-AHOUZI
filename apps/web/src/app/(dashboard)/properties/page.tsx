'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Building2, BedDouble, Users, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', search],
    queryFn: async () => { const r = await api.get('/properties', { params: { search } }); return r.data; },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/properties', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['properties'] }); setShowModal(false); reset(); },
  });

  const properties: any[] = data?.data || [];

  const TYPE_LABELS: Record<string, string> = { HOTEL: 'Hôtel', RESIDENCE: 'Résidence', VILLA: 'Villa', MIXED: 'Mixte' };
  const TYPE_COLORS: Record<string, string> = { HOTEL: 'bg-blue-100 text-blue-700', RESIDENCE: 'bg-green-100 text-green-700', VILLA: 'bg-amber-100 text-amber-700', MIXED: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propriétés</h1>
          <p className="text-gray-500 text-sm mt-1">{properties.length} propriété(s) gérée(s)</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Nouvelle propriété</Button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <Input placeholder="Rechercher par nom, code, ville…" value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={14} />} className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune propriété. Cliquez sur &quot;Nouvelle propriété&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-3 bg-gradient-to-r from-[#1B2B5E] to-[#D4A017]" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{p.city}, {p.country}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[p.type] || 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[p.type] || p.type}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1B2B5E]">{p._count?.rooms || 0}</p>
                    <p className="text-xs text-gray-400">Chambres</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">{p._count?.reservations || 0}</p>
                    <p className="text-xs text-gray-400">Réservations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">—</p>
                    <p className="text-xs text-gray-400">Occupation</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{p.code}</span>
                    {p.phone && <span>{p.phone}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button className="text-xs text-[#1B2B5E] hover:underline font-medium">Tableau de bord</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouvelle propriété" size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom de la propriété *" placeholder="Villas Ahouzi Cocody" {...register('name', { required: 'Requis' })} error={errors.name?.message as string} />
            <Input label="Code unique *" placeholder="VAC001" {...register('code', { required: 'Requis' })} error={errors.code?.message as string} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" options={[{value:'HOTEL',label:'Hôtel'},{value:'RESIDENCE',label:'Résidence'},{value:'VILLA',label:'Villa'},{value:'MIXED',label:'Mixte'}]} {...register('type')} />
            <Input label="Ville *" placeholder="Abidjan" {...register('city', { required: 'Requis' })} error={errors.city?.message as string} />
          </div>
          <Input label="Adresse *" placeholder="Rue des Jardins, Cocody" {...register('address', { required: 'Requis' })} error={errors.address?.message as string} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Téléphone" placeholder="+225 27 00 00 00 00" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Heure check-in" type="time" defaultValue="14:00" {...register('checkInTime')} />
            <Input label="Heure check-out" type="time" defaultValue="12:00" {...register('checkOutTime')} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Description de la propriété…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10" />
          </div>
          {createMutation.isError && <p className="text-sm text-red-500">{(createMutation.error as any)?.response?.data?.message}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowModal(false); reset(); }}>Annuler</Button>
            <Button type="submit" loading={createMutation.isPending}>Créer la propriété</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
