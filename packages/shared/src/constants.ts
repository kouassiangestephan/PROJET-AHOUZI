export const CURRENCIES = { XOF: 'Franc CFA (BCEAO)', USD: 'Dollar US', EUR: 'Euro' };

export const COUNTRIES_WEST_AFRICA = [
  "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Ghana', 'Guinée',
  'Bénin', 'Togo', 'Niger', 'Nigeria', 'Mauritanie', 'Liberia', 'Sierra Leone',
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'CARD', label: 'Carte bancaire' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'MTN_MONEY', label: 'MTN Money' },
  { value: 'MOOV_MONEY', label: 'Moov Money' },
  { value: 'DJAMO', label: 'Djamo' },
  { value: 'CINETPAY', label: 'CinetPay' },
  { value: 'PAYDUNYA', label: 'PayDunya' },
];

export const RESERVATION_STATUSES = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CHECKED_IN: 'En séjour',
  CHECKED_OUT: 'Terminée',
  CANCELLED: 'Annulée',
  NO_SHOW: 'Non présenté',
};

export const ROOM_CATEGORIES = {
  STANDARD: 'Standard',
  SUPERIOR: 'Supérieure',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  STUDIO: 'Studio',
  PENTHOUSE: 'Penthouse',
};

export const USER_ROLES = {
  SUPER_ADMIN: 'Super Administrateur',
  GENERAL_MANAGER: 'Directeur Général',
  PROPERTY_MANAGER: 'Directeur de Propriété',
  RECEPTIONIST: 'Réceptionniste',
  ACCOUNTANT: 'Comptable',
  HR_MANAGER: 'Responsable RH',
  HOUSEKEEPING_STAFF: 'Personnel Ménage',
  MAINTENANCE_TECH: 'Technicien Maintenance',
  RESTAURANT_MANAGER: 'Responsable Restaurant',
  STORE_MANAGER: 'Responsable Boutique',
};
