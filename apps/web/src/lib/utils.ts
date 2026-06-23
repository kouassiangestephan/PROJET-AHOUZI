import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'XOF'): string {
  if (currency === 'XOF') {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-CI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function formatNights(nights: number): string {
  return nights <= 1 ? `${nights} nuit` : `${nights} nuits`;
}

export const RESERVATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  CHECKED_IN: { label: 'En séjour', color: 'bg-green-100 text-green-800' },
  CHECKED_OUT: { label: 'Terminée', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'Non présenté', color: 'bg-orange-100 text-orange-800' },
};

export const ROOM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
  OCCUPIED: { label: 'Occupée', color: 'bg-blue-100 text-blue-800' },
  DIRTY: { label: 'Sale', color: 'bg-yellow-100 text-yellow-800' },
  CLEANING: { label: 'En nettoyage', color: 'bg-orange-100 text-orange-800' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-red-100 text-red-800' },
  OUT_OF_SERVICE: { label: 'Hors service', color: 'bg-gray-100 text-gray-800' },
};
