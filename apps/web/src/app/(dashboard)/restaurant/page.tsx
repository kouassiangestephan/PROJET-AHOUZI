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
import { Plus, UtensilsCrossed, RefreshCw } from 'lucide-react';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const menuItemSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
  price: z.string().min(1, 'Prix requis'),
  category: z.string().min(1, 'Catégorie requise'),
  preparationTime: z.string().optional(),
});
type MenuItemForm = z.infer<typeof menuItemSchema>;

const MENU_CATEGORIES = [
  { value: 'STARTER', label: 'Entrées' },
  { value: 'MAIN', label: 'Plats principaux' },
  { value: 'DESSERT', label: 'Desserts' },
  { value: 'DRINK', label: 'Boissons' },
  { value: 'SNACK', label: 'Snacks' },
  { value: 'BREAKFAST', label: 'Petit-déjeuner' },
  { value: 'SPECIAL', label: 'Plat du jour' },
];

const ORDER_STATUS_VARIANTS: Record<string, any> = {
  PENDING: 'warning', PREPARING: 'info', READY: 'success', SERVED: 'default', CANCELLED: 'danger',
};
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', PREPARING: 'En préparation', READY: 'Prêt', SERVED: 'Servi', CANCELLED: 'Annulé',
};

export default function RestaurantPage() {
  const [tab, setTab] = useState<'orders' | 'menu'>('orders');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useList('/restaurant/orders', { page, limit: 20, status: statusFilter || undefined });
  const { data: menuData, isLoading: menuLoading, refetch: refetchMenu } = useList('/restaurant/menu', { page, limit: 20 });
  const createMenuItem = useCreate('/restaurant/menu');
  const updateOrder = useUpdate('/restaurant/orders');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MenuItemForm>({ resolver: zodResolver(menuItemSchema) });

  const orders = (ordersData as any)?.data ?? [];
  const menu = (menuData as any)?.data ?? [];
  const ordersPagination = (ordersData as any)?.pagination;
  const menuPagination = (menuData as any)?.pagination;

  const onSubmitMenu = async (values: MenuItemForm) => {
    await createMenuItem.mutateAsync({
      ...values,
      price: parseFloat(values.price),
      preparationTime: values.preparationTime ? parseInt(values.preparationTime) : undefined,
    });
    reset(); setCreateMenuOpen(false); refetchMenu();
  };

  const orderColumns = [
    { key: 'number', header: 'N° Commande', render: (r: any) => <span className="font-mono text-xs text-[#1B2B5E] font-medium">{r.orderNumber ?? r.id.slice(0,8).toUpperCase()}</span> },
    { key: 'table', header: 'Table', render: (r: any) => r.tableNumber ? `Table ${r.tableNumber}` : r.roomNumber ? `Chambre ${r.roomNumber}` : '—' },
    { key: 'items', header: 'Articles', render: (r: any) => `${r.items?.length ?? 0} article${(r.items?.length ?? 0) > 1 ? 's' : ''}` },
    { key: 'total', header: 'Total', render: (r: any) => <span className="font-semibold">{formatXOF(r.totalAmount ?? 0)}</span> },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge variant={ORDER_STATUS_VARIANTS[r.status]}>{ORDER_STATUS_LABELS[r.status] ?? r.status}</Badge> },
    { key: 'createdAt', header: 'Heure', render: (r: any) => new Date(r.createdAt).toLocaleTimeString('fr-CI', { hour: '2-digit', minute: '2-digit' }) },
    {
      key: 'actions', header: '', render: (r: any) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); updateOrder.mutateAsync({ id: r.id, data: { status: 'PREPARING' } }).then(() => refetchOrders()); }}>Préparer</Button>}
          {r.status === 'PREPARING' && <Button size="sm" onClick={e => { e.stopPropagation(); updateOrder.mutateAsync({ id: r.id, data: { status: 'READY' } }).then(() => refetchOrders()); }}>Prêt</Button>}
          {r.status === 'READY' && <Button size="sm" onClick={e => { e.stopPropagation(); updateOrder.mutateAsync({ id: r.id, data: { status: 'SERVED' } }).then(() => refetchOrders()); }}>Servi</Button>}
        </div>
      )
    },
  ];

  const menuColumns = [
    {
      key: 'name', header: 'Plat',
      render: (r: any) => (
        <div>
          <p className="font-medium text-gray-900">{r.name}</p>
          {r.description && <p className="text-xs text-gray-500 truncate max-w-xs">{r.description}</p>}
        </div>
      )
    },
    { key: 'category', header: 'Catégorie', render: (r: any) => MENU_CATEGORIES.find(c => c.value === r.category)?.label ?? r.category },
    { key: 'price', header: 'Prix', render: (r: any) => <span className="font-semibold">{formatXOF(r.price)}</span> },
    { key: 'prepTime', header: 'Prep.', render: (r: any) => r.preparationTime ? `${r.preparationTime} min` : '—' },
    { key: 'available', header: 'Disponible', render: (r: any) => <Badge variant={r.isAvailable !== false ? 'success' : 'default'}>{r.isAvailable !== false ? 'Oui' : 'Non'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant</h1>
          <p className="text-sm text-gray-500 mt-1">Commandes, menu et service en salle</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => tab === 'orders' ? refetchOrders() : refetchMenu()}><RefreshCw size={16} /></Button>
          {tab === 'menu' && (
            <Button onClick={() => setCreateMenuOpen(true)}><Plus size={16} className="mr-2" />Ajouter au menu</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Commandes du jour', value: orders.length, color: 'text-[#1B2B5E] bg-blue-50' },
          { label: 'En attente', value: orders.filter((o: any) => o.status === 'PENDING').length, color: 'text-amber-600 bg-amber-50' },
          { label: 'En préparation', value: orders.filter((o: any) => o.status === 'PREPARING').length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Prêtes', value: orders.filter((o: any) => o.status === 'READY').length, color: 'text-green-600 bg-green-50' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${item.color}`}>
              <UtensilsCrossed size={12} />{item.label}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100 px-4 items-center">
          {(['orders', 'menu'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-[#1B2B5E] text-[#1B2B5E]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'orders' ? 'Commandes' : 'Menu'}
            </button>
          ))}
          {tab === 'orders' && (
            <div className="ml-auto py-2">
              <Select
                options={[{ value: '', label: 'Tous les statuts' }, ...Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-44"
              />
            </div>
          )}
        </div>
        <Table
          columns={tab === 'orders' ? orderColumns : menuColumns}
          data={tab === 'orders' ? orders : menu}
          loading={tab === 'orders' ? ordersLoading : menuLoading}
          keyExtractor={(r: any) => r.id}
          emptyMessage={tab === 'orders' ? 'Aucune commande' : 'Menu vide'}
        />
        {tab === 'orders' && ordersPagination && ordersPagination.totalPages > 1 && (
          <Pagination page={page} totalPages={ordersPagination.totalPages} total={ordersPagination.total} limit={20} onChange={setPage} />
        )}
        {tab === 'menu' && menuPagination && menuPagination.totalPages > 1 && (
          <Pagination page={page} totalPages={menuPagination.totalPages} total={menuPagination.total} limit={20} onChange={setPage} />
        )}
      </div>

      <Modal open={createMenuOpen} onClose={() => { setCreateMenuOpen(false); reset(); }} title="Ajouter au menu" size="md">
        <form onSubmit={handleSubmit(onSubmitMenu)} className="space-y-4">
          <Input label="Nom du plat" placeholder="Ex: Poulet braisé yassa" error={errors.name?.message} {...register('name')} />
          <Input label="Description" placeholder="Description courte..." {...register('description')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" options={MENU_CATEGORIES} placeholder="Catégorie" error={errors.category?.message} {...register('category')} />
            <Input label="Temps de préparation (min)" type="number" placeholder="15" {...register('preparationTime')} />
          </div>
          <Input label="Prix (XOF)" type="number" placeholder="0" error={errors.price?.message} {...register('price')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateMenuOpen(false); reset(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createMenuItem.isPending}>Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
