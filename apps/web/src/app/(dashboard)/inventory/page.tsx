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
import { Plus, AlertTriangle, RefreshCw, Search, ArrowUp, ArrowDown } from 'lucide-react';

const itemSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  sku: z.string().optional(),
  category: z.string().min(1, 'Catégorie requise'),
  unit: z.string().min(1, 'Unité requise'),
  currentStock: z.string().min(1, 'Stock requis'),
  minStock: z.string().min(1, 'Stock minimum requis'),
  costPrice: z.string().optional(),
});
type ItemForm = z.infer<typeof itemSchema>;

const movementSchema = z.object({
  itemId: z.string().min(1, 'Article requis'),
  type: z.string().min(1, 'Type requis'),
  quantity: z.string().min(1, 'Quantité requise'),
  reason: z.string().optional(),
});
type MovementForm = z.infer<typeof movementSchema>;

const CATEGORIES = [
  { value: 'LINEN', label: 'Linge & Literie' },
  { value: 'CLEANING', label: 'Produits d\'entretien' },
  { value: 'FOOD', label: 'Alimentation' },
  { value: 'BEVERAGE', label: 'Boissons' },
  { value: 'TOILETRIES', label: 'Articles de toilette' },
  { value: 'EQUIPMENT', label: 'Équipements' },
  { value: 'OFFICE', label: 'Fournitures bureau' },
  { value: 'OTHER', label: 'Autre' },
];

const UNITS = [
  { value: 'UNIT', label: 'Unité' },
  { value: 'KG', label: 'Kilogramme' },
  { value: 'LITER', label: 'Litre' },
  { value: 'PIECE', label: 'Pièce' },
  { value: 'BOX', label: 'Boîte' },
  { value: 'PACK', label: 'Pack' },
];

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading, refetch } = useList('/inventory/items', {
    page, limit: 20,
    search: search || undefined,
    category: categoryFilter || undefined,
    lowStock: lowStockOnly || undefined,
  });
  const createItem = useCreate('/inventory/items');
  const createMovement = useCreate('/inventory/movements');

  const { register: registerItem, handleSubmit: handleItem, reset: resetItem, formState: { errors: itemErrors } } = useForm<ItemForm>({ resolver: zodResolver(itemSchema) });
  const { register: registerMov, handleSubmit: handleMov, reset: resetMov, formState: { errors: movErrors } } = useForm<MovementForm>({ resolver: zodResolver(movementSchema) });

  const items = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination;
  const lowStockCount = items.filter((i: any) => i.currentStock <= i.minStock).length;

  const onSubmitItem = async (values: ItemForm) => {
    await createItem.mutateAsync({
      ...values,
      currentStock: parseInt(values.currentStock),
      minStock: parseInt(values.minStock),
      costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
    });
    resetItem(); setCreateOpen(false); refetch();
  };

  const onSubmitMovement = async (values: MovementForm) => {
    await createMovement.mutateAsync({ ...values, quantity: parseInt(values.quantity) });
    resetMov(); setMovementOpen(false); refetch();
  };

  const columns = [
    {
      key: 'name', header: 'Article',
      render: (r: any) => (
        <div>
          <p className="font-medium text-gray-900">{r.name}</p>
          {r.sku && <p className="text-xs text-gray-500 font-mono">{r.sku}</p>}
        </div>
      )
    },
    { key: 'category', header: 'Catégorie', render: (r: any) => CATEGORIES.find(c => c.value === r.category)?.label ?? r.category },
    {
      key: 'stock', header: 'Stock',
      render: (r: any) => (
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${r.currentStock <= r.minStock ? 'text-red-600' : 'text-gray-900'}`}>{r.currentStock}</span>
          <span className="text-gray-400 text-xs">/ min {r.minStock}</span>
          {r.currentStock <= r.minStock && <AlertTriangle size={14} className="text-red-500" />}
        </div>
      )
    },
    { key: 'unit', header: 'Unité', render: (r: any) => UNITS.find(u => u.value === r.unit)?.label ?? r.unit },
    {
      key: 'status', header: 'Statut',
      render: (r: any) => r.currentStock <= 0
        ? <Badge variant="danger">Rupture</Badge>
        : r.currentStock <= r.minStock
          ? <Badge variant="warning">Stock faible</Badge>
          : <Badge variant="success">En stock</Badge>
    },
    {
      key: 'costPrice', header: 'Prix unitaire',
      render: (r: any) => r.costPrice
        ? new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(r.costPrice)
        : '—'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des stocks et approvisionnements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button variant="outline" onClick={() => setMovementOpen(true)}>
            <ArrowUp size={16} className="mr-1" /><ArrowDown size={16} className="mr-2" />Mouvement
          </Button>
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" />Nouvel article</Button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">{lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock faible ou en rupture</p>
            <p className="text-sm text-amber-600">Pensez à réapprovisionner pour éviter toute interruption de service.</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setLowStockOnly(true)}>
            Voir les alertes
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2B5E] focus:bg-white"
              placeholder="Rechercher un article..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            options={[{ value: '', label: 'Toutes les catégories' }, ...CATEGORIES]}
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="w-52"
          />
          <Button
            variant={lowStockOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }}
          >
            <AlertTriangle size={14} className="mr-1" />Alertes seulement
          </Button>
        </div>
        <Table columns={columns} data={items} loading={isLoading} keyExtractor={(r: any) => r.id} emptyMessage="Aucun article en inventaire" />
        {pagination && pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onChange={setPage} />}
      </div>

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetItem(); }} title="Nouvel article" size="md">
        <form onSubmit={handleItem(onSubmitItem)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom de l'article" placeholder="Ex: Draps simple" error={itemErrors.name?.message} {...registerItem('name')} />
            <Input label="Code SKU" placeholder="Ex: LIN-001" {...registerItem('sku')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" options={CATEGORIES} placeholder="Sélectionner" error={itemErrors.category?.message} {...registerItem('category')} />
            <Select label="Unité" options={UNITS} placeholder="Sélectionner" error={itemErrors.unit?.message} {...registerItem('unit')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock actuel" type="number" placeholder="0" error={itemErrors.currentStock?.message} {...registerItem('currentStock')} />
            <Input label="Stock minimum" type="number" placeholder="5" error={itemErrors.minStock?.message} {...registerItem('minStock')} />
          </div>
          <Input label="Prix unitaire (XOF)" type="number" placeholder="0" {...registerItem('costPrice')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); resetItem(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createItem.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal open={movementOpen} onClose={() => { setMovementOpen(false); resetMov(); }} title="Mouvement de stock" size="sm">
        <form onSubmit={handleMov(onSubmitMovement)} className="space-y-4">
          <Select
            label="Article"
            options={items.map((i: any) => ({ value: i.id, label: `${i.name} (${i.currentStock} ${UNITS.find(u => u.value === i.unit)?.label ?? i.unit})` }))}
            placeholder="Sélectionner un article"
            error={movErrors.itemId?.message}
            {...registerMov('itemId')}
          />
          <Select
            label="Type de mouvement"
            options={[
              { value: 'IN', label: 'Entrée (réapprovisionnement)' },
              { value: 'OUT', label: 'Sortie (consommation)' },
              { value: 'ADJUSTMENT', label: 'Ajustement (inventaire)' },
            ]}
            placeholder="Type"
            error={movErrors.type?.message}
            {...registerMov('type')}
          />
          <Input label="Quantité" type="number" placeholder="1" error={movErrors.quantity?.message} {...registerMov('quantity')} />
          <Input label="Raison / Note" placeholder="Ex: Livraison fournisseur" {...registerMov('reason')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setMovementOpen(false); resetMov(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createMovement.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
