import express, { Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import {
  protect,
  creditAccess,
  staffAccess,
  clientAccess,
} from "../middleware/auth";
import { PaymentStatus, PaymentMethod } from "../types";
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

// GET /api/payments/lease/:leaseId - Get payments for a specific lease
// @ts-ignore
router.get("/lease/:leaseId", getPaymentsByLease);

// GET /api/payments/:id - Get payment by ID
// @ts-ignore
router.get("/:id", getPaymentById);

// GET /api/payments/:id/receipt - Get payment receipt
// @ts-ignore
router.get("/:id/receipt", getPaymentReceipt);

// POST /api/payments - Create new payment
// @ts-ignore
router.post("/", creditAccess, createPaymentValidation, createPayment);

// PUT /api/payments/:id - Update payment
// @ts-ignore
router.put("/:id", creditAccess, updatePayment);

// DELETE /api/payments/:id - Delete payment
// @ts-ignore
router.delete("/:id", creditAccess, deletePayment);

// PATCH /api/payments/:id/status - Update payment status
// @ts-ignore
router.patch("/:id/status", creditAccess, updatePaymentStatus);

// PATCH /api/payments/:id/complete - Mark payment as completed
// @ts-ignore
router.patch("/:id/complete", creditAccess, completePayment);

// PATCH /api/payments/:id/refund - Refund payment
// @ts-ignore
router.patch("/:id/refund", creditAccess, refundPayment);

// POST /api/payments/bulk-create - Create multiple payments (for monthly billing)
// @ts-ignore
router.post("/bulk-create", creditAccess, bulkCreatePayments);

export default router;
