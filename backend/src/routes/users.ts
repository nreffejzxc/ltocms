import express, { Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import { protect, adminOnly, staffAccess } from "../middleware/auth";
import { UserRole, IAuthRequest } from "../types";
import {
  getAllUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  getBusinessSummary,
} from "../controllers/userController";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Validation rules
const createUserValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(Object.values(UserRole))
    .withMessage("Invalid role specified"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

const updateUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("Invalid role specified"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

const getUserValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("role")
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage("Invalid role filter"),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search term must not be empty"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive filter must be a boolean"),
];

// Routes

// GET /api/users - Get all users (Admin and Staff only)
// @ts-ignore
router.get("/", staffAccess as any, queryValidation, getAllUsers as any);

// GET /api/users/stats - Get user statistics (Admin only)
// @ts-ignore
router.get("/stats", adminOnly as any, getUserStats as any);

// GET /api/users/business-summary - Get business summary (Admin only)
// @ts-ignore
router.get("/business-summary", adminOnly as any, getBusinessSummary as any);

// GET /api/users/:id - Get user by ID (Admin and Staff only)
// @ts-ignore
router.get("/:id", staffAccess as any, getUserValidation, getUserById as any);

// POST /api/users - Create new user (Admin only)
// @ts-ignore
router.post("/", adminOnly as any, createUserValidation, createUser as any);

// PUT /api/users/:id - Update user (Admin only)
// @ts-ignore
router.put("/:id", adminOnly as any, updateUserValidation, updateUser as any);

// DELETE /api/users/:id - Delete user (Admin only)
// @ts-ignore
router.delete("/:id", adminOnly as any, getUserValidation, deleteUser as any);

// PATCH /api/users/:id/activate - Activate user (Admin only)
// @ts-ignore
router.patch(
  "/:id/activate",
  adminOnly as any,
  getUserValidation,
  activateUser as any
);

// PATCH /api/users/:id/deactivate - Deactivate user (Admin only)
// @ts-ignore
router.patch(
  "/:id/deactivate",
  adminOnly as any,
  getUserValidation,
  deactivateUser as any
);

// PATCH /api/users/:id/reset-password - Reset user password (Admin only)
// @ts-ignore
router.patch(
  "/:id/reset-password",
  adminOnly as any,
  getUserValidation,
  resetUserPassword as any
);

export default router;
