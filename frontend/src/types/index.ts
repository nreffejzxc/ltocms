import React from "react";

// User types
export enum UserRole {
  ADMIN = "admin",
  SALES_ADMIN = "sales_admin",
  SALES_ASSOCIATE = "sales_associate",
  CREDIT_STAFF = "credit_staff",
  CASHIER = "cashier",
  CLIENT = "client",
  DEVELOPER = "developer",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Vehicle types
export enum VehicleStatus {
  AVAILABLE = "available",
  LEASED = "leased",
  MAINTENANCE = "maintenance",
  SOLD = "sold",
  RESERVED = "reserved",
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  mileage: number;
  condition: "excellent" | "good" | "fair" | "poor";
  status: VehicleStatus;
  purchasePrice: number;
  leasePrice: number;
  images: string[];
  features: string[];
  description?: string;
  location: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Lease types
export enum LeaseStatus {
  PENDING = "pending",
  APPROVED = "approved",
  ACTIVE = "active",
  COMPLETED = "completed",
  DEFAULTED = "defaulted",
  CANCELLED = "cancelled",
}

export interface LeaseAgreement {
  id: string;
  leaseNumber: string;
  client: User;
  vehicle: Vehicle;
  salesPerson: User;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  downPayment: number;
  totalAmount: number;
  remainingBalance: number;
  interestRate: number;
  status: LeaseStatus;
  terms: {
    duration: number;
    mileageLimit: number;
    earlyTerminationFee: number;
    latePaymentFee: number;
  };
  documents: {
    contract?: string;
    insurance?: string;
    registration?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CASH = "cash",
  CHECK = "check",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  ONLINE = "online",
}

export interface Payment {
  id: string;
  paymentNumber: string;
  lease: LeaseAgreement;
  client: User;
  amount: number;
  paymentDate: string;
  dueDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
  processedBy: User;
  isLatePayment: boolean;
  lateFee?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthUser {
  user: User;
  tokens: AuthTokens;
}

// Form types
export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  mileage: number;
  condition: "excellent" | "good" | "fair" | "poor";
  purchasePrice: number;
  leasePrice: number;
  images: string[];
  features: string[];
  description?: string;
  location: string;
}

export interface LeaseFormData {
  client: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  downPayment: number;
  totalAmount: number;
  interestRate: number;
  terms: {
    duration: number;
    mileageLimit: number;
    earlyTerminationFee: number;
    latePaymentFee: number;
  };
  notes?: string;
}

export interface PaymentFormData {
  lease: string;
  client: string;
  amount: number;
  dueDate: string;
  method: PaymentMethod;
  transactionId?: string;
  notes?: string;
  lateFee?: number;
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalLeases: number;
  totalPayments: number;
  activeLeases: number;
  availableVehicles: number;
  monthlyRevenue: number;
  overduePayments: number;
}

// Query types
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
  children?: NavItem[];
  roles?: UserRole[];
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, direction: "asc" | "desc") => void;
  className?: string;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
