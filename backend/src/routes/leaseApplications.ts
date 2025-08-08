import express from "express";
import { body, param, query } from "express-validator";
import {
  protect,
  salesAccess,
  staffAccess,
  clientAccess,
} from "../middleware/auth";
import {
  getAllLeaseApplications,
  getMyLeaseApplications,
  getLeaseApplicationById,
  submitLeaseApplication,
  updateApplicationStatus,
  convertToLease,
  getApplicationStats,
} from "../controllers/leaseApplicationController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const submitApplicationValidation = [
  body("vehicle").isMongoId().withMessage("Valid vehicle ID is required"),
  body("requestedStartDate")
    .isISO8601()
    .withMessage("Valid start date is required"),
  body("requestedDuration")
    .isInt({ min: 6, max: 120 })
    .withMessage("Duration must be between 6 and 120 months"),
  body("monthlyBudget")
    .isFloat({ min: 100 })
    .withMessage("Monthly budget must be at least $100"),
  body("downPaymentAmount")
    .isFloat({ min: 0 })
    .withMessage("Down payment must be positive"),
  body("employmentInfo.employer")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Employer name is required"),
  body("employmentInfo.position")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Position is required"),
  body("employmentInfo.monthlyIncome")
    .isFloat({ min: 500 })
    .withMessage("Monthly income must be at least $500"),
  body("employmentInfo.employmentDuration")
    .isInt({ min: 1 })
    .withMessage("Employment duration must be at least 1 month"),
  body("personalInfo.driversLicense")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Driver's license is required"),
  body("personalInfo.licenseExpiry")
    .isISO8601()
    .withMessage("Valid license expiry date is required"),
  body("personalInfo.emergencyContact.name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Emergency contact name is required"),
  body("personalInfo.emergencyContact.relationship")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Emergency contact relationship is required"),
  body("personalInfo.emergencyContact.phone")
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Valid emergency contact phone is required"),
];

const updateStatusValidation = [
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("status")
    .isIn(["submitted", "under_review", "approved", "rejected", "converted"])
    .withMessage("Invalid status"),
  body("reviewNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Review notes cannot exceed 1000 characters"),
  body("rejectionReason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Rejection reason cannot exceed 500 characters"),
];

const convertToLeaseValidation = [
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("actualStartDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required"),
  body("actualEndDate").isISO8601().withMessage("Valid end date is required"),
  body("finalMonthlyPayment")
    .isFloat({ min: 0 })
    .withMessage("Monthly payment must be positive"),
  body("finalDownPayment")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Down payment must be positive"),
  body("finalTotalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be positive"),
  body("interestRate")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Interest rate must be between 0 and 100"),
  body("terms.duration")
    .isInt({ min: 1, max: 120 })
    .withMessage("Duration must be between 1 and 120 months"),
  body("terms.mileageLimit")
    .isInt({ min: 0 })
    .withMessage("Mileage limit must be positive"),
  body("terms.earlyTerminationFee")
    .isFloat({ min: 0 })
    .withMessage("Early termination fee must be positive"),
  body("terms.latePaymentFee")
    .isFloat({ min: 0 })
    .withMessage("Late payment fee must be positive"),
];

// Routes

// GET /api/lease-applications - Get all lease applications (staff only)
// @ts-ignore
router.get("/", staffAccess as any, getAllLeaseApplications as any);

// GET /api/lease-applications/my-applications - Get current user's applications (clients)
// @ts-ignore
router.get(
  "/my-applications",
  clientAccess as any,
  getMyLeaseApplications as any
);

// GET /api/lease-applications/stats - Get application statistics (staff only)
// @ts-ignore
router.get("/stats", staffAccess as any, getApplicationStats as any);

// GET /api/lease-applications/:id - Get application by ID
// @ts-ignore
router.get("/:id", getLeaseApplicationById as any);

// POST /api/lease-applications - Submit new lease application (clients only)
// @ts-ignore
router.post(
  "/",
  clientAccess as any,
  submitApplicationValidation,
  submitLeaseApplication as any
);

// PATCH /api/lease-applications/:id/status - Update application status (staff only)
// @ts-ignore
router.patch(
  "/:id/status",
  staffAccess as any,
  updateStatusValidation,
  updateApplicationStatus as any
);

// POST /api/lease-applications/:id/convert - Convert application to lease (sales staff only)
// @ts-ignore
router.post(
  "/:id/convert",
  salesAccess as any,
  convertToLeaseValidation,
  convertToLease as any
);

export default router;
