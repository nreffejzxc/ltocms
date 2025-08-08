import express, { Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import {
  protect,
  salesAccess,
  staffAccess,
  clientAccess,
} from "../middleware/auth";
import { LeaseStatus } from "../types";
import {
  getAllLeases,
  getMyLeases,
  getActiveLeases,
  getOverdueLeases,
  getLeaseStats,
  getLeaseById,
  createLease,
  updateLease,
  deleteLease,
  updateLeaseStatus,
  approveLease,
  completeLease,
  requestEarlyBuyout,
} from "../controllers/leaseController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const createLeaseValidation = [
  body("client").isMongoId().withMessage("Valid client ID is required"),
  body("vehicle").isMongoId().withMessage("Valid vehicle ID is required"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
  body("monthlyPayment")
    .isFloat({ min: 0 })
    .withMessage("Monthly payment must be a positive number"),
  body("downPayment")
    .isFloat({ min: 0 })
    .withMessage("Down payment must be a positive number"),
  body("totalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be a positive number"),
  body("interestRate")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Interest rate must be between 0 and 100"),
  body("terms.duration")
    .isInt({ min: 1, max: 120 })
    .withMessage("Duration must be between 1 and 120 months"),
  body("terms.mileageLimit")
    .isInt({ min: 0 })
    .withMessage("Mileage limit must be a positive number"),
  body("terms.earlyTerminationFee")
    .isFloat({ min: 0 })
    .withMessage("Early termination fee must be positive"),
  body("terms.latePaymentFee")
    .isFloat({ min: 0 })
    .withMessage("Late payment fee must be positive"),
];

// Routes

// GET /api/leases - Get all leases
// @ts-ignore
router.get("/", staffAccess, getAllLeases);

// GET /api/leases/my-leases - Get current user's leases (for clients)
// @ts-ignore
router.get("/my-leases", clientAccess, getMyLeases);

// GET /api/leases/active - Get active leases
// @ts-ignore
router.get("/active", staffAccess, getActiveLeases);

// GET /api/leases/overdue - Get overdue leases
// @ts-ignore
router.get("/overdue", staffAccess, getOverdueLeases);

// GET /api/leases/stats - Get lease statistics
// @ts-ignore
router.get("/stats", staffAccess, getLeaseStats);

// GET /api/leases/:id - Get lease by ID
// @ts-ignore
router.get("/:id", getLeaseById);

// POST /api/leases - Create new lease
// @ts-ignore
router.post("/", salesAccess, createLeaseValidation, createLease);

// PUT /api/leases/:id - Update lease
// @ts-ignore
router.put("/:id", salesAccess, updateLease);

// DELETE /api/leases/:id - Delete lease
// @ts-ignore
router.delete("/:id", salesAccess, deleteLease);

// PATCH /api/leases/:id/status - Update lease status
// @ts-ignore
router.patch("/:id/status", salesAccess, updateLeaseStatus);

// PATCH /api/leases/:id/approve - Approve lease
// @ts-ignore
router.patch("/:id/approve", salesAccess, approveLease);

// PATCH /api/leases/:id/complete - Complete lease
// @ts-ignore
router.patch("/:id/complete", salesAccess, completeLease);

// POST /api/leases/:id/early-buyout - Request early buyout
// @ts-ignore
router.post("/:id/early-buyout", requestEarlyBuyout);

export default router;
