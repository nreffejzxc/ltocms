import { Document } from "mongoose";
import { Request } from "express";
import mongoose from "mongoose";

// User roles enum
export enum UserRole {
  ADMIN = "admin",
  SALES_ADMIN = "sales_admin",
  SALES_ASSOCIATE = "sales_associate",
  CREDIT_STAFF = "credit_staff",
  CASHIER = "cashier",
  CLIENT = "client",
  DEVELOPER = "developer",
}

// OAuth provider enum
export enum OAuthProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  LOCAL = "local",
}

// User interface
export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for OAuth users
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
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  refreshTokens: string[];
  // OAuth fields
  provider: OAuthProvider;
  providerId?: string; // ID from OAuth provider
  providerData?: {
    googleId?: string;
    facebookId?: string;
    picture?: string;
    locale?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Vehicle status enum
export enum VehicleStatus {
  AVAILABLE = "available",
  LEASED = "leased",
  MAINTENANCE = "maintenance",
  SOLD = "sold",
  RESERVED = "reserved",
}

// Vehicle interface
export interface IVehicle extends Document {
  _id: string;
  make: string;
  vehicleModel: string;
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
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lease status enum
export enum LeaseStatus {
  PENDING = "pending",
  APPROVED = "approved",
  ACTIVE = "active",
  COMPLETED = "completed",
  DEFAULTED = "defaulted",
  CANCELLED = "cancelled",
}

// Lease agreement interface
export interface ILeaseAgreement extends Document {
  _id: string;
  leaseNumber: string;
  client: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  salesPerson: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  monthlyPayment: number;
  downPayment: number;
  totalAmount: number;
  remainingBalance: number;
  interestRate: number;
  status: LeaseStatus;
  terms: {
    duration: number; // in months
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
  createdAt: Date;
  updatedAt: Date;
}

// Payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

// Payment method enum
export enum PaymentMethod {
  CASH = "cash",
  CHECK = "check",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  ONLINE = "online",
}

// Payment interface
export interface IPayment extends Document {
  _id: string;
  paymentNumber: string;
  lease: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  dueDate: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
  processedBy: mongoose.Types.ObjectId;
  isLatePayment: boolean;
  lateFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

// JWT payload interface
export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// API Response interface
export interface IApiResponse<T = any> {
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

// Request with user interface
export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// Query parameters interface
export interface IQueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

// Dashboard stats interface
export interface IDashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalLeases: number;
  totalPayments: number;
  activeLeases: number;
  availableVehicles: number;
  monthlyRevenue: number;
  overduePayments: number;
}
