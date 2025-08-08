import express, { Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import { protect, salesAccess, staffAccess } from "../middleware/auth";
import { VehicleStatus } from "../types";
import {
  getAllVehicles,
  getAvailableVehicles,
  getVehicleStats,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  uploadVehicleImages,
  removeVehicleImage,
} from "../controllers/vehicleController";

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const createVehicleValidation = [
  body("make")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Make is required and must be less than 50 characters"),
  body("vehicleModel")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Model is required and must be less than 50 characters"),
  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Invalid year"),
  body("vin")
    .isLength({ min: 17, max: 17 })
    .withMessage("VIN must be exactly 17 characters"),
  body("color")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Color is required"),
  body("mileage")
    .isInt({ min: 0 })
    .withMessage("Mileage must be a positive number"),
  body("condition")
    .isIn(["excellent", "good", "fair", "poor"])
    .withMessage("Invalid condition"),
  body("purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),
  body("leasePrice")
    .isFloat({ min: 0 })
    .withMessage("Lease price must be a positive number"),
  body("location")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Location is required"),
];

// Routes

// GET /api/vehicles - Get all vehicles
// @ts-ignore
router.get("/", staffAccess, getAllVehicles);

// GET /api/vehicles/available - Get available vehicles
// @ts-ignore
router.get("/available", getAvailableVehicles);

// GET /api/vehicles/stats - Get vehicle statistics
// @ts-ignore
router.get("/stats", staffAccess, getVehicleStats);

// GET /api/vehicles/:id - Get vehicle by ID
// @ts-ignore
router.get("/:id", getVehicleById);

// POST /api/vehicles - Create new vehicle
// @ts-ignore
router.post("/", salesAccess, createVehicleValidation, createVehicle);

// PUT /api/vehicles/:id - Update vehicle
// @ts-ignore
router.put("/:id", salesAccess, updateVehicle);

// DELETE /api/vehicles/:id - Delete vehicle
// @ts-ignore
router.delete("/:id", salesAccess, deleteVehicle);

// PATCH /api/vehicles/:id/status - Update vehicle status
// @ts-ignore
router.patch("/:id/status", salesAccess, updateVehicleStatus);

// POST /api/vehicles/:id/images - Upload vehicle images
// @ts-ignore
router.post("/:id/images", salesAccess, uploadVehicleImages);

// DELETE /api/vehicles/:id/images - Remove vehicle image
// @ts-ignore
router.delete("/:id/images", salesAccess, removeVehicleImage);

export default router;
