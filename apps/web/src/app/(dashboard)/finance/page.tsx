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
import { Plus, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Facture requise'),
  amount: z.string().min(1, 'Montant requis'),
  method: z.string().min(1, 'Mode de paiement requis'),
  reference: z.string().optional(),
});
type PaymentForm = z.infer<typeof paymentSchema>;

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'CARD', label: 'Carte bancaire' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'MTN_MONEY', label: 'MTN Money' },
  { value: 'MOOV_MONEY', label: 'Moov Money' },
  { value: 'CINETPAY', label: 'CinetPay' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
];

const INVOICE_STATUS_VARIANTS: Record<string, any> = { DRAFT: 'default', SENT: 'info', PAID: 'success', PARTIAL: 'warning', OVERDUE: 'danger', CANCELLED: 'danger' };
const INVOICE_STATUS_LABELS: Record<string, string> = { DRAFT: 'Brouillon', SENT: 'Envoyée', PAID: 'Payée', PARTIAL: 'Partielle', OVERDUE: 'En retard', CANCELLED: 'Annulée' };

export default function FinancePage() {
  const [tab, setTab] = useState<'invoices' | 'payments'>('invoices');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data, isLoading, refetch } = useList(
    tab === 'invoices' ? '/finance/invoices' : '/finance/payments',
    { page, limit: 20, status: statusFilter || undefined }
  );
  const { data: statsData } = useList('/finance/stats', {});
  const { data: invoicesData } = useList('/finance/invoices', { limit: 100, status: 'SENT' });
  const createPayment = useCreate('/finance/payments');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({ resolver: zodResolver(paymentSchema) });

  const items = (data as any)?.data ?? [];
  const pagination = (data as any)?.pagination;
  const stats = (statsData as any)?.data ?? {};
  const pendingInvoices = (invoicesData as any)?.data ?? [];

  const onSubmit = async (values: PaymentForm) => {
    await createPayment.mutateAsync({ ...values, amount: parseFloat(values.amount) });
    reset(); setPaymentOpen(false); refetch();
  };

  const invoiceColumns = [
    { key: 'number', header: 'N° Facture', render: (r: any) => <span className="font-mono text-[#1B2B5E] font-medium text-xs">{r.invoiceNumber}</span> },
    { key: 'customer', header: 'Client', render: (r: any) => r.reservation?.customer ? `${r.reservation.customer.firstName} ${r.reservation.customer.lastName}` : r.customer?.firstName ?? '—' },
    { key: 'amount', header: 'Montant', render: (r: any) => <span className="font-semibold">{formatXOF(r.totalAmount)}</span> },
    { key: 'paid', header: 'Payé', render: (r: any) => <span className="text-green-600">{formatXOF(r.paidAmount ?? 0)}</span> },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge variant={INVOICE_STATUS_VARIANTS[r.status]}>{INVOICE_STATUS_LABELS[r.status] ?? r.status}</Badge> },
    { key: 'dueDate', header: 'Échéance', render: (r: any) => r.dueDate ? new Date(r.dueDate).toLocaleDateString('fr-CI') : '—' },
  ];

  const paymentColumns = [
    { key: 'ref', header: 'Référence', render: (r: any) => <span className="font-mono text-xs">{r.reference ?? r.id.slice(0, 8).toUpperCase()}</span> },
    { key: 'invoice', header: 'Facture', render: (r: any) => r.invoice?.invoiceNumber ?? '—' },
    { key: 'amount', header: 'Montant', render: (r: any) => <span className="font-semibold text-green-600">{formatXOF(r.amount)}</span> },
    { key: 'method', header: 'Mode', render: (r: any) => PAYMENT_METHODS.find(m => m.value === r.method)?.label ?? r.method },
    { key: 'paidAt', header: 'Date', render: (r: any) => r.paidAt ? new Date(r.paidAt).toLocaleDateString('fr-CI') : '—' },
    { key: 'cashier', header: 'Caissier', render: (r: any) => r.createdBy ? `${r.createdBy.firstName} ${r.createdBy.lastName}` : '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Facturation, paiements et caisse</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}><RefreshCw size={16} /></Button>
          <Button onClick={() => setPaymentOpen(true)}><Plus size={16} className="mr-2" />Enregistrer paiement</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Recettes du mois', value: stats.monthlyRevenue ?? 0, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Factures en attente', value: stats.pendingAmount ?? 0, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
          { label: 'Factures en retard', value: stats.overdueAmount ?? 0, icon: TrendingDown, color: 'text-red-600 bg-red-50' },
          { label: 'Recettes annuelles', value: stats.yearlyRevenue ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${item.color}`}>
              <item.icon size={12} />{item.label}
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{formatXOF(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100 px-4">
          {(['invoices', 'payments'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-[#1B2B5E] text-[#1B2B5E]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'invoices' ? 'Factures' : 'Paiements'}
            </button>
          ))}
          <div className="ml-auto flex items-center py-2">
            {tab === 'invoices' && (
              <Select
                options={[{ value: '', label: 'Tous les statuts' }, ...Object.entries(INVOICE_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-40 text-xs"
              />
            )}
          </div>
        </div>
        <Table
          columns={tab === 'invoices' ? invoiceColumns : paymentColumns}
          data={items}
          loading={isLoading}
          keyExtractor={(r: any) => r.id}
          emptyMessage={tab === 'invoices' ? 'Aucune facture' : 'Aucun paiement'}
        />
        {pagination && pagination.totalPages > 1 && <Pagination page={page} totalPages={pagination.totalPages} total={pagination.total} limit={20} onChange={setPage} />}
      </div>

      <Modal open={paymentOpen} onClose={() => { setPaymentOpen(false); reset(); }} title="Enregistrer un paiement" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Facture"
            options={pendingInvoices.map((inv: any) => ({ value: inv.id, label: `${inv.invoiceNumber} — ${formatXOF(inv.totalAmount - (inv.paidAmount ?? 0))} restant` }))}
            placeholder="Sélectionner une facture"
            error={errors.invoiceId?.message}
            {...register('invoiceId')}
          />
          <Input label="Montant (XOF)" type="number" placeholder="0" error={errors.amount?.message} {...register('amount')} />
          <Select label="Mode de paiement" options={PAYMENT_METHODS} placeholder="Sélectionner" error={errors.method?.message} {...register('method')} />
          <Input label="Référence / N° transaction" placeholder="Ex: TXN-001234" {...register('reference')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setPaymentOpen(false); reset(); }}>Annuler</Button>
            <Button type="submit" className="flex-1" loading={createPayment.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
