import express, { Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import {
  protect,
  authorize,
  creditAccess,
  staffAccess,
  clientAccess,
  financialAccess,
} from "../middleware/auth";
import { PaymentStatus, PaymentMethod, UserRole } from "../types";
import {
  getAllPayments,
  getMyPayments,
  getOverduePayments,
  getPaymentStats,
  getPaymentsByLease,
  getPaymentById,
  getPaymentReceipt,
  createPayment,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
  completePayment,
  refundPayment,
  bulkCreatePayments,
} from "../controllers/paymentController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const createPaymentValidation = [
  body("lease").isMongoId().withMessage("Valid lease ID is required"),
  body("client").isMongoId().withMessage("Valid client ID is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
  body("method")
    .isIn(Object.values(PaymentMethod))
    .withMessage("Invalid payment method"),
  body("transactionId")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Transaction ID cannot be empty"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
  body("lateFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Late fee must be positive"),
];

// Routes

// GET /api/payments - Get all payments
// @ts-ignore
router.get("/", staffAccess, getAllPayments);

// GET /api/payments/my-payments - Get current user's payments (for clients)
// @ts-ignore
router.get("/my-payments", clientAccess, getMyPayments);

// GET /api/payments/overdue - Get overdue payments
// @ts-ignore
router.get("/overdue", creditAccess, getOverduePayments);

// GET /api/payments/stats - Get payment statistics
// @ts-ignore
router.get("/stats", staffAccess, getPaymentStats);

// GET /api/payments/lease/:leaseId - Get payments for a specific lease (clients can access their own lease payments)
// @ts-ignore
router.get(
  "/lease/:leaseId",
  authorize(
    UserRole.ADMIN,
    UserRole.SALES_ADMIN,
    UserRole.SALES_ASSOCIATE,
    UserRole.CREDIT_STAFF,
    UserRole.CASHIER,
    UserRole.CLIENT
  ) as any,
  getPaymentsByLease
);

// GET /api/payments/:id - Get payment by ID (clients can access their own payments)
// @ts-ignore
router.get(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.SALES_ADMIN,
    UserRole.SALES_ASSOCIATE,
    UserRole.CREDIT_STAFF,
    UserRole.CASHIER,
    UserRole.CLIENT
  ) as any,
  getPaymentById
);

// GET /api/payments/:id/receipt - Get payment receipt (clients can access their own payment receipts)
// @ts-ignore
router.get(
  "/:id/receipt",
  authorize(
    UserRole.ADMIN,
    UserRole.SALES_ADMIN,
    UserRole.SALES_ASSOCIATE,
    UserRole.CREDIT_STAFF,
    UserRole.CASHIER,
    UserRole.CLIENT
  ) as any,
  getPaymentReceipt
);

// POST /api/payments - Create new payment (Credit staff and Cashiers)
// @ts-ignore
router.post("/", financialAccess, createPaymentValidation, createPayment);

// PUT /api/payments/:id - Update payment (Credit staff and Cashiers)
// @ts-ignore
router.put("/:id", financialAccess, updatePayment);

// DELETE /api/payments/:id - Delete payment (Admin and Credit staff only)
// @ts-ignore
router.delete(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.CREDIT_STAFF) as any,
  deletePayment
);

// PATCH /api/payments/:id/status - Update payment status (Credit staff and Cashiers)
// @ts-ignore
router.patch("/:id/status", financialAccess, updatePaymentStatus);

// PATCH /api/payments/:id/complete - Mark payment as completed (Credit staff and Cashiers)
// @ts-ignore
router.patch("/:id/complete", financialAccess, completePayment);

// PATCH /api/payments/:id/refund - Refund payment (Admin and Credit staff only)
// @ts-ignore
router.patch(
  "/:id/refund",
  authorize(UserRole.ADMIN, UserRole.CREDIT_STAFF) as any,
  refundPayment
);

// POST /api/payments/bulk-create - Create multiple payments (Credit staff only)
// @ts-ignore
router.post(
  "/bulk-create",
  authorize(UserRole.ADMIN, UserRole.CREDIT_STAFF) as any,
  bulkCreatePayments
);

export default router;
