export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'GENERAL_MANAGER'
  | 'PROPERTY_MANAGER'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT'
  | 'HR_MANAGER'
  | 'HOUSEKEEPING_STAFF'
  | 'MAINTENANCE_TECH'
  | 'RESTAURANT_MANAGER'
  | 'STORE_MANAGER';

export interface Property {
  id: string;
  name: string;
  code: string;
  type: 'HOTEL' | 'RESIDENCE' | 'VILLA' | 'MIXED';
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  propertyId: string;
  number: string;
  name?: string;
  category: string;
  status: RoomStatus;
  maxOccupancy: number;
  basePrice: number;
  floor: number;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  nationality?: string;
  loyaltyLevel: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  loyaltyPoints: number;
  totalStays: number;
  totalSpent: number;
}

export interface Reservation {
  id: string;
  code: string;
  propertyId: string;
  customerId: string;
  roomId: string;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  source: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
